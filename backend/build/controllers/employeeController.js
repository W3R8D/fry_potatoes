"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeeRecord = exports.getUserAvatar = exports.updateLastLoginPositionId = exports.addEmployee = exports.fetchPositions = exports.checkUsernameExists = void 0;
const models_1 = __importDefault(require("../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt")); //for hashing the password when registering new user
const jsonwebtoken_1 = require("jsonwebtoken"); //Secret is a type from @types/jsonwebtoken
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MY_OUTLOOK_FROM_EMAIL_ADDRESS,
        pass: process.env.MY_OUTLOOK_EMAIL_PASSWORD
    },
});
// ========= End Nodemailer: ===============
// ========= Random Password Generator: ============
const generate_password_1 = __importDefault(require("generate-password"));
const checkUsernameExists = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    models.Account.findOne({
        where: { username },
        attributes: ['username']
    }).then((result) => {
        // if the username doesn't exist in the database, the result will be null.
        if (result) {
            return res.json({
                message: `Username: ${username} is taken❕`,
                taken: true,
                status: 200
            });
        }
        return res.json({
            message: `Username: ${username} is available ☑️`,
            taken: false,
            status: 200
        });
    }).catch((error) => {
        next(error); // passing error to error handler middleware
        // console.log(error.message);
    });
});
exports.checkUsernameExists = checkUsernameExists;
// =================================================================
const fetchPositions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const allPositions = yield models.Position.findAll({ attributes: ["id", "description"] });
    const allClassifications = yield models.Classification.findAll({ attributes: ["id", "name"] });
    const allJobTitles = yield models.JobTitle.findAll({ attributes: ["id", "title"] });
    return res.json({
        allPositions,
        allClassifications,
        allJobTitles
    });
});
exports.fetchPositions = fetchPositions;
// =================================================================
const addEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, middleName, lastName, email, phoneNumber, hireDate, birthDate, username, position, classification, jobTitle, startDate, endDate } = req.body;
        // First, check if email is taken:
        const employeeWithThisEmail = yield models.Employee.findOne({
            where: { email },
            attributes: ['email']
        });
        if (employeeWithThisEmail) {
            return res.json({
                message: `Sorry, this email: ${employeeWithThisEmail.email} is taken`,
                type: "error",
                status: 200
            });
        }
        // else, the email is not taken, so proceed:
        // Generate random password:
        let generatedPassword = generate_password_1.default.generate({
            length: 10,
            strict: true, //Password should include at least one character from each pool
        });
        // If reaches here, then email is not taken, so let's register the user
        const hashedPassword = yield bcrypt_1.default.hash(generatedPassword, 10);
        const newEmployee = yield models.Employee.create({
            firstName,
            middleName,
            lastName,
            email,
            phoneNumber,
            hireDate,
            birthDate,
            // userStatus: "regular",
            // privilegeGroup: "employee",
            role: "employee",
        });
        // Now the record is added to the `Employee` model, let's get the inserted id:
        const employeeId = newEmployee.id; // needed in order to store it in the `Accounts` table
        // Now we have to insert a new record to the `Account` model:
        const newAccount = yield models.Account.create({
            username,
            password: hashedPassword,
            employeeId, // references the `Employee`(`id`) model
        });
        // Now we have to insert a new record to the `Employees_Positions` model:
        const newEmpPosition = yield models.Employee_Position.create({
            positionId: position,
            classification,
            jobTitleId: jobTitle,
            startDate,
            endDate,
            employeeId, // references the `Employee`(`id`) model
        });
        // ============= GENERATE TOKEN TO SEND WITHIN THE EMAIL ==============
        const mySecretKey = process.env.JWT_ACC_ACTIVATE;
        const token = (0, jsonwebtoken_1.sign)({
            accountId: newAccount.id,
            // I need the accountId in order to execute the query that will 
            // update the column `Account(`isActivated`)` and set it to true.
        }, mySecretKey, //2nd arg: the secretKey
        { expiresIn: "30 m" } //20 minutes
        );
        // ==================================================================
        // ============= NOW: SENDING EMAIL with the token to THE NEW USER: ==============
        //  ======================= Start Nodemailer Email Sending =======================
        const nodemailerOptions = {
            from: `CORRESPONDENCE HRMS <fareshatem.fh@outlook.com>`,
            to: email,
            subject: "Account Activation Link",
            html: "<h1>Hello, " + newEmployee.firstName + ". Welcome to our company 🙋</h1><h3>Kindly click the below link to activate your account:</h3><p>" + process.env.CLIENT_URL + "/auth/activate/" + token + "</p>" + "<p>Note: The above activation link will expire after 30 minutes from the time this email was sent</p><h4>After activation, you can login to your account using the following credentials:</h4><p>Username: " + newAccount.username + "</P><p>Password: " + generatedPassword + "</p>",
        };
        transporter.sendMail(nodemailerOptions, function (err, info) {
            if (err) {
                console.log(err);
                console.log("Error sending email from Nodemailer! 😕");
            }
            console.log(info);
        });
        //  ======================= End Nodemailer Email Sending =======================
        return res.json({
            message: `Success! An email with account activation link has been sent to: [${newEmployee.email}]`,
            type: "success",
            insertedRecords: [
                newEmployee,
                newAccount,
                newEmpPosition
            ],
            statusCode: 200
        });
    }
    catch (error) {
        next(error); // passing error to error handler middleware
    }
});
exports.addEmployee = addEmployee;
const updateLastLoginPositionId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeCurrentPositionId = req.body.employeeCurrentPositionId;
        // First, ensure that the passed id is owned by the user who is making the request:
        const empPosRecord = yield models.Employee_Position.findOne({
            where: {
                id: employeeCurrentPositionId,
                employeeId: req.user.employeeId
            }
        });
        if (empPosRecord) {
            // -- Update the `lastLoginPositionId` for the user:
            const updatedRecord = yield models.Account.update({
                lastLoginPositionId: employeeCurrentPositionId
            }, {
                where: { employeeId: req.user.employeeId }
            });
            // -- Find the job title that the user switched into: 
            const theJobTitleSwitchedInto = yield models.JobTitle.findByPk(empPosRecord.jobTitleId);
            return res.json({
                message: `You will be acting as: "${theJobTitleSwitchedInto.title}"`,
            });
        }
        else {
            return res.json({
                message: `The passed employeeCurrentPositionId is not owned by the current user`,
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.updateLastLoginPositionId = updateLastLoginPositionId;
const getUserAvatar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeRecord = yield models.Employee.findByPk(req.user.employeeId, {
            attributes: ["avatar"],
            raw: true,
        });
        return res.json({
            "avatar": employeeRecord.avatar
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserAvatar = getUserAvatar;
const getEmployeeRecord = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let employeeId = req.query.employeeId;
        if (!employeeId) {
            employeeId = req.user.employeeId;
        }
        const employeeRecord = yield models.Employee.findByPk(employeeId, {
            raw: true,
        });
        return res.json({
            "employeeRecord": employeeRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEmployeeRecord = getEmployeeRecord;
