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
exports.activateAccount = exports.logoutUser = exports.loginUser = exports.verifyCodeToResetForgottenPassword = exports.verifyResetPassword = exports.resetPassword = exports.forgotPasswordFaris = exports.forgotPassword = void 0;
const models_1 = __importDefault(require("../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt")); //for hashing the password when registering new user
require("dotenv/config");
const jsonwebtoken_1 = require("jsonwebtoken"); //Secret is a type from @types/jsonwebtoken
// ---------- For Validation and Error Throwing ------------
const http_errors_1 = __importDefault(require("http-errors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp-mail.outlook.com',
    // host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    // auth: {
    //     user: process.env.MY_OUTLOOK_FROM_EMAIL_ADDRESS,
    //     pass: process.env.MY_OUTLOOK_EMAIL_PASSWORD
    // },
    auth: {
        user: process.env.MY_OUTLOOK_FROM_EMAIL_ADDRESS,
        pass: process.env.MY_OUTLOOK_EMAIL_PASSWORD
    },
});
const generate_password_1 = __importDefault(require("generate-password"));
// ======================== GENERATE ACCESS TOKEN WHEN LOGIN =======================
const generateAccessToken = (payload) => {
    // Function receives the user record and generates jwt access token:
    // const mySecretKey: Secret = process.env.JWT_AUTH_SECRET as Secret;
    const mySecretKey = process.env.JWT_AUTH_SECRET;
    const accessToken = (0, jsonwebtoken_1.sign)({
        accountId: payload.accountId,
        employeeId: payload.employeeId,
        fullName: payload.fullName,
        role: payload.role,
        allEmployeePositions: payload.allEmployeePositions
    }, mySecretKey);
    return accessToken;
};
// =================================================================
// ======================== forgot-password ========================
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username) {
            return res.json({
                message: 'Invalid username',
                type: "error",
                statusCode: 400,
                path: req.path
            });
        }
        // Find the Account Record
        const accountRecord = yield models.Account.findOne({
            where: { username }
        });
        if (!accountRecord) {
            return res.json({
                message: `This username doesn't belong to anyone`,
                type: "error",
                statusCode: 401,
                path: req.path
            });
        }
        // Find the email corresponding to this username
        const employeeRecord = yield models.Employee.findByPk(accountRecord.employeeId);
        // Generate random password 
        let code = generate_password_1.default.generate({
            length: 10,
            strict: true, //Code should include at least one character from each pool
        });
        const hashedCode = yield bcrypt_1.default.hash(code, 10);
        const saltRoundsForUsername = 3;
        const generatedSalt = yield bcrypt_1.default.genSalt(saltRoundsForUsername);
        const hashedUsername = yield bcrypt_1.default.hash(username, generatedSalt);
        // ------------- Create Cookies -----------------
        res.status(202).cookie('code', hashedCode, {
            secure: true,
            expires: new Date(Date.now() + 1000 * 60 * 60),
            httpOnly: true,
        });
        res.status(202).cookie('username', username, {
            secure: true,
            expires: new Date(Date.now() + 1000 * 60 * 60),
            httpOnly: true,
        });
        const recipientFullName = `${employeeRecord.firstName} ${employeeRecord.lastName}`;
        const nodemailerOptions = {
            from: "CORRESPONDENCE HRMS <fareshatem.fh@outlook.com>",
            to: employeeRecord.email,
            subject: "Forgot Password: Verification Code",
            html: "<h1>Hello, " + recipientFullName + "🙋</h1><p>This verification code is sent to you upon your request to reset your forgotten password.</p><h3>Security code: " + code + "</h3><p>This code will be invalid after one hour from the time this email was sent.</p>" + "<a href='" + process.env.CLIENT_URL + "/verification'>Click this link to verify the code</a>",
        };
        transporter.sendMail(nodemailerOptions, function (err, info) {
            // This is callback function called when the sendMail finishes execution.
            if (err) {
                console.log("Error sending email from Nodemailer! 😕");
                console.log(err);
                return res.json({
                    // message: `Error sending email from Nodemailer! 😕`,
                    message: err === null || err === void 0 ? void 0 : err.response,
                    type: "error",
                    statusCode: 400
                });
            }
            // If reaches here, then the email has been successfully sent ✅
            console.log(info);
            return res.json({
                // message: `Success! A verification code has been sent to: [${employeeRecord.email}]`,
                message: `If ${employeeRecord.email} matches the email address on your account, we'll send you a code. Kindly check your email`,
                type: "success",
                statusCode: 200
            });
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const forgotPasswordFaris = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.body;
        if (!username) {
            return res.json({
                message: 'Invalid username',
                type: "error",
                statusCode: 400,
                path: req.path
            });
        }
        // Find the Account Record
        const accountRecord = yield models.Account.findOne({
            where: { username }
        });
        if (!accountRecord) {
            return res.json({
                message: `This username doesn't belong to anyone`,
                type: "error",
                statusCode: 401,
                path: req.path
            });
        }
        // Find the email corresponding to this username
        const employeeRecord = yield models.Employee.findByPk(accountRecord.employeeId);
        const recipientFullName = `${employeeRecord.firstName} ${employeeRecord.lastName}`;
        // --------- Create a one-time unique link valid for 15 minutes ----------------
        // Since we want this link to be only one-time link. That is, the user cannot use the same link twice to reset his password.
        // How to do that? Answer is to concatenate the current password to the secret:
        const secret = process.env.JWT_FORGOT_PASSWORD_SECRET + accountRecord.password;
        // So now the secret will be unique for each user.
        const payload = {
            accountId: accountRecord.id,
            email: employeeRecord.email
        };
        const token = (0, jsonwebtoken_1.sign)(payload, secret, { expiresIn: "15m" });
        const link = `${process.env.CLIENT_URL}/auth/reset-password/${accountRecord.id}/${token}`;
        console.log(link);
        const nodemailerOptions = {
            from: "CORRESPONDENCE HRMS <fareshatem.fh@outlook.com>",
            to: employeeRecord.email,
            subject: "Forgot Password: Verification Code",
            html: "<h1>Hello, " + recipientFullName + "🙋</h1><p>This password reset link is sent to you upon your request to reset your forgotten password.</p><p>This link will be invalid after 15 minutes from the time this email was sent.</p>" + "<h3><a href='" + link + "'>Click this link to verify the code</a></h3>",
        };
        transporter.sendMail(nodemailerOptions, function (err, info) {
            // This is callback function called when the sendMail finishes execution.
            if (err) {
                console.log("Error sending email from Nodemailer! 😕");
                console.log(err);
                return res.json({
                    // message: `Error sending email from Nodemailer! 😕`,
                    message: err === null || err === void 0 ? void 0 : err.response,
                    type: "error",
                    statusCode: 400
                });
            }
            // If reaches here, then the email has been successfully sent ✅
            console.log(info);
            return res.json({
                // message: `Success! A verification code has been sent to: [${employeeRecord.email}]`,
                message: `If ${employeeRecord.email} matches the email address on your account, we'll send you a link to reset your password. Kindly check your email`,
                type: "success",
                statusCode: 200
            });
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPasswordFaris = forgotPasswordFaris;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { newPassword, accountId } = req.body;
        const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield models.Account.update({ password: hashedNewPassword }, {
            where: { id: accountId }
        });
        return res.json({
            message: "Success! Password has been reset",
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const verifyResetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { accountId, token } = req.body;
        // Check if this id exists in the database
        const accountRecord = yield models.Account.findByPk(accountId);
        if (!accountRecord) {
            return res.json({
                message: "Invalid account ID",
                verified: false,
                statusCode: 401 //401 unauthorized
            });
        }
        const employeeRecord = yield models.Employee.findByPk(accountRecord.employeeId, { raw: true });
        const secret = process.env.JWT_FORGOT_PASSWORD_SECRET + accountRecord.password;
        const decodedToken = (0, jsonwebtoken_1.verify)(token, secret);
        // If the token is verified, the program will reach here, otherwise will throw error:
        return res.json({
            message: "Valid token. You can reset your password",
            verified: true,
            decodedToken,
            employeeRecord,
            statusCode: 200
        });
    }
    catch (error) {
        // next(error);
        return res.json({
            message: "Invalid token",
            error,
            statusCode: 401,
            verified: false
        });
    }
});
exports.verifyResetPassword = verifyResetPassword;
// =================================================================
const verifyCodeToResetForgottenPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verification } = req.body;
    const code = req.cookies['code']; // `code` is the hashed version of the `verification`
    const username = req.cookies['username'];
    const match = yield bcrypt_1.default.compare(verification, code);
    if (!match) {
        return res.json({
            message: "The verification code is not correct",
            type: "error",
            statusCode: 401
        });
    }
    // --- We will log in the user using the same logic as in the `loginUser` function
    // except that here we don't require the user to enter his password ---
    const accountFromDB = yield models.Account.findOne({
        where: { username }
    });
    const employeeFromDB = yield models.Employee.findByPk(accountFromDB.employeeId);
    if (!accountFromDB.isActivated) {
        return res.json({
            message: `You need to activate your account first, using the link which we have sent to your email address: ${employeeFromDB.email}`,
            type: "warning",
            statusCode: 401,
            path: req.path
        });
    }
    // ----- Query to find all `EmployeePosition` records for this user ----
    const getAllEmpPositions = `SELECT EP.id, JT.title FROM employees_positions as EP 
    JOIN positions as PO ON EP.positionId = PO.id
    JOIN jobtitles as JT on EP.jobTitleId = JT.id
    WHERE EP.employeeId = ${accountFromDB.employeeId}`;
    // ----- Execute the query to find all `EmployeePosition` records for this user ----
    const employeePositionsFromDB = yield models_1.default.sequelize.query(getAllEmpPositions, {
        type: sequelize_1.QueryTypes.SELECT,
        logging: console.log,
    });
    // --------- Now prepare some data about the currently logged-in user to send as a response to the frontend: ----------
    const fullName = employeeFromDB.firstName + " " + employeeFromDB.lastName;
    let lastLoginPositionId = accountFromDB.lastLoginPositionId;
    // But when the user logs in for the first time, the `lastLoginPositionId` column will be null:
    if (lastLoginPositionId === null) {
        lastLoginPositionId = employeePositionsFromDB[0].id;
    }
    const payload = {
        accountId: accountFromDB.id,
        employeeId: employeeFromDB.id,
        fullName: fullName,
        role: employeeFromDB.role,
        allEmployeePositions: employeePositionsFromDB,
    };
    const accessToken = generateAccessToken(payload);
    // === Now, CREATE A COOKIE and store it in the user's browser:
    // cookie(name, value, options).
    // status 202: accepted
    res.status(202).cookie('access-token', accessToken, {
        // domain: "http://localhost",
        // sameSite: "lax",
        maxAge: 60 * 60 * 24 * 1000,
        // maxAge converts to expires (here cookie will be removed after 7 days)
        httpOnly: true,
        // secure: true // limits the scope of the cookie to "secure" channels.
    });
    return res.json({
        message: 'successfully logged in to account',
        type: "success",
        tokenData: payload,
        employeeCurrentPositionId: lastLoginPositionId
    });
});
exports.verifyCodeToResetForgottenPassword = verifyCodeToResetForgottenPassword;
// =================================================================
const loginUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username) {
        next((0, http_errors_1.default)(400, "Invalid username or password"));
    }
    // --------------------------------------------------
    const accountFromDB = yield models.Account.findOne({
        where: { username }
    });
    if (!accountFromDB) {
        // Entered username doesn't exist in our database
        return res.json({
            message: 'Wrong username and/or password combination',
            type: "error",
            statusCode: 401,
            path: req.path
        });
    }
    // Else, account exists, let's test the entered password:
    const hashedPassFromDB = accountFromDB.password;
    // ======================================================
    const match = yield bcrypt_1.default.compare(password, hashedPassFromDB);
    if (!match) {
        // Entered password is wrong
        return res.json({
            message: 'Wrong username and/or password combination',
            type: "error",
            statusCode: 401,
            path: req.path
        });
    }
    // Else, entered password is correct.
    // ============ So, NOW LET's GENERATE JWT TOKEN ============
    // === We need to fetch some data from other tables, and put this data in the 
    // token's payload:
    // === We need the privilegeGroup (the role whether admin or employee or so on)
    const employeeFromDB = yield models.Employee.findOne({
        where: { id: accountFromDB.employeeId },
        // attributes: ["privilegeGroup"]
    });
    // Before proceeding, check if the account is activated:
    if (!accountFromDB.isActivated) {
        return res.json({
            message: `You need to activate your account first, using the link which we have sent to your email address: ${employeeFromDB.email}`,
            type: "warning",
            statusCode: 401,
            path: req.path
        });
    }
    // ----- Query to find all `EmployeePosition` records for this user ----
    const getAllEmpPositions = `SELECT EP.id, JT.title FROM employees_positions as EP 
    JOIN positions as PO ON EP.positionId = PO.id
    JOIN jobtitles as JT on EP.jobTitleId = JT.id
    WHERE EP.employeeId = ${accountFromDB.employeeId}`;
    // ----- Execute the query to find all `EmployeePosition` records for this user ----
    const employeePositionsFromDB = yield models_1.default.sequelize.query(getAllEmpPositions, {
        type: sequelize_1.QueryTypes.SELECT,
        logging: console.log,
    });
    // --------- Now prepare some data about the currently logged-in user to send as a response to the frontend: ----------
    const fullName = employeeFromDB.firstName + " " + employeeFromDB.lastName;
    let lastLoginPositionId = accountFromDB.lastLoginPositionId;
    // But when the user logs in for the first time, the `lastLoginPositionId` column will be null:
    if (lastLoginPositionId === null) {
        lastLoginPositionId = employeePositionsFromDB[0].id;
    }
    const payload = {
        accountId: accountFromDB.id,
        employeeId: employeeFromDB.id,
        fullName: fullName,
        role: employeeFromDB.role,
        allEmployeePositions: employeePositionsFromDB,
    };
    const accessToken = generateAccessToken(payload);
    // === Now, CREATE A COOKIE and store it in the user's browser:
    // cookie(name, value, options).
    // status 202: accepted
    res.status(202).cookie('access-token', accessToken, {
        // domain: "http://localhost",
        // sameSite: "lax",
        maxAge: 60 * 60 * 24 * 1000,
        // maxAge converts to expires (here cookie will be removed after 7 days)
        httpOnly: true,
        // secure: true // limits the scope of the cookie to "secure" channels.
    });
    // If you close the tab, or close the whole browser and shutdown the laptop,
    // the cookie will still be stored in your device until it expires or removed by you.
    /*
        httpOnly:true makes the cookie cannot be accessed through client-side script. As a result, even if a cross-site scripting (XSS) flaw exists, and a user accidentally accesses a link that exploits this flaw, the browser will not reveal the cookie to a third party.
    */
    return res.json({
        message: 'successfully logged in to account',
        type: "success",
        tokenData: payload,
        employeeCurrentPositionId: lastLoginPositionId
    });
});
exports.loginUser = loginUser;
// ======================================================================
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // remove the cookie whose name is "access-token" from the server:
    res.status(202).clearCookie('access-token').send("access-token Cleared");
});
exports.logoutUser = logoutUser;
// ======================================================================
const activateAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // if request reaches here (to the controller function)
    // then this means the token has been verified in the middleware function.
    // Now it's time to continue account activation procedure here 👇:
    try {
        const { accountId } = req.user; //from the decoded token payload
        // First of all, check whether the account is already activated:
        const accountRecord = yield models.Account.findByPk(accountId);
        if (accountRecord.isActivated === true) {
            return res.json({
                msg: "Account has been previously activated 😼✅",
                status: 200,
                success: false,
                activated: true
            });
        }
        // If program reaches this line, then the account is not activated, 
        // now execute a query to update the user's account record to (isActivated: true)
        yield models.Account.update({
            isActivated: true,
        }, {
            where: {
                id: accountId
            }
        });
        return res.json({
            msg: "Account has been activated 😎✅",
            status: 200,
            activated: true
        });
    }
    catch (error) {
        next(error);
    }
});
exports.activateAccount = activateAccount;
// export default { registerUser, loginUser }
