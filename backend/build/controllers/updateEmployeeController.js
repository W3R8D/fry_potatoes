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
exports.changePassword = exports.getAllEmployees = exports.updateEmployeePositionsTable = exports.getEmployeePositions = exports.updateImageOfEmployee = exports.updateEmployeeInfo = exports.informationOfEmployee = void 0;
const models_1 = __importDefault(require("../models/")); // our database connection object
const sequelize_1 = require("sequelize");
const { models } = models_1.default.sequelize; // returns object with all our models.
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt")); //for hashing the password when registering new user
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs")); //file system
const informationOfEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeePositionId, employeeId, accountId } = req.user;
        let accountRecord = yield models.Account.findByPk(accountId);
        accountRecord = accountRecord.dataValues;
        let employeeRecord = yield models.Employee.findByPk(employeeId);
        employeeRecord = employeeRecord.dataValues;
        const initialValues = Object.assign(Object.assign({}, employeeRecord), { username: accountRecord.username });
        res.json({
            initialValues
        });
    }
    catch (error) {
        next(error);
    }
});
exports.informationOfEmployee = informationOfEmployee;
const updateEmployeeInfo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeePositionId, employeeId, accountId } = req.user;
        const { theNewData } = req.body;
        const { firstName, middleName, lastName, username, hireDate, birthDate, email, phoneNumber, city, gender, maritalStatus } = theNewData;
        const updatedEmployeeRecord = yield models.Employee.update({
            firstName, middleName, lastName,
            hireDate, birthDate, email, phoneNumber, city, gender, maritalStatus
        }, {
            where: { id: employeeId }
        });
        return res.json({
            updatedEmployeeRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEmployeeInfo = updateEmployeeInfo;
const updateImageOfEmployee = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeePositionId, employeeId, accountId } = req.user;
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        // ---- Before uploading new avatar, remove the previous one if any: ----
        const employeeRecord = yield models.Employee.findByPk(employeeId);
        const accountRecord = yield models.Account.findByPk(accountId);
        console.log("Previous avatar: ", employeeRecord.avatar);
        const previousAvatarPath = `public/avatars/${employeeRecord.avatar}`;
        fs_1.default.unlinkSync(previousAvatarPath);
        console.log(previousAvatarPath);
        // -----------------------------------------------------------
        let targetFile = req.files.image;
        console.log(" ----- ** targetFile ** -----");
        const extension = path_1.default.extname(targetFile.name); //extension name with the dot (.) ex: .png
        targetFile.name = accountRecord.username + extension; //rename the file to be the username
        console.log(targetFile);
        targetFile.mv(path_1.default.join(__dirname, '../../public/avatars', targetFile.name), (err) => {
            if (err)
                return res.status(500).send(err);
            res.send('File uploaded!');
        });
        yield models.Employee.update({ avatar: targetFile.name }, { where: { id: employeeId } });
        return res.json("successfully uploaded avatar");
    }
    catch (error) {
        next(error);
    }
});
exports.updateImageOfEmployee = updateImageOfEmployee;
const getEmployeePositions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { employeePositionId, employeeId, accountId } = req.user;
        const employeeId = Number(req.params.employeeId);
        const q = `SELECT EP.id as recordId, EP.positionId, EP.classification, EP.jobTitleId, EP.startDate, EP.endDate, 
        P.description, JT.title
        FROM employees_positions as EP
        JOIN positions as P on P.id = EP.positionId
        JOIN jobtitles as JT on JT.id = EP.jobTitleId
        WHERE employeeId = ${employeeId}`;
        const myEmployeePositions = yield models_1.default.sequelize.query(q, {
            type: sequelize_1.QueryTypes.SELECT,
            logging: console.log,
        });
        myEmployeePositions.forEach((emp) => {
            emp.isNew = false;
            emp.isDeleted = false;
            emp.isUpdated = false;
        });
        const allPositions = yield models.Position.findAll({});
        const allJobTitles = yield models.JobTitle.findAll({});
        return res.json({
            myEmployeePositions,
            allPositions,
            allJobTitles,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getEmployeePositions = getEmployeePositions;
const updateEmployeePositionsTable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { employeePositionId, employeeId, accountId } = req.user;
        const { myEmpPositions, employeeId } = req.body;
        // this is the employeeId for the employee whose positions are about to be updated:
        let employeeRecord = yield models.Employee.findByPk(employeeId);
        employeeRecord = employeeRecord.dataValues;
        let promises = [];
        for (let i = 0; i < (myEmpPositions === null || myEmpPositions === void 0 ? void 0 : myEmpPositions.length); i++) {
            let currentEmpPos = myEmpPositions[i];
            if (currentEmpPos.isNew == false) {
                // then either delete or update. 
                if (currentEmpPos.isDeleted) {
                    // then delete the record from the database
                    let deletedRecordResponse = models.Employee_Position.destroy({
                        where: { id: currentEmpPos.recordId }
                    });
                    promises.push(deletedRecordResponse);
                }
                if (currentEmpPos.isUpdated) {
                    // then update the record
                    const { positionId, jobTitleId, classification, startDate, endDate } = currentEmpPos;
                    let updatedRecordResponse = models.Employee_Position.update({ positionId, jobTitleId, classification, startDate, endDate }, { where: { id: currentEmpPos.recordId } });
                    promises.push(updatedRecordResponse);
                }
            }
            else {
                // then the record is new (doesn't exist in the database yet):
                // if (currentEmpPos.isDeleted) continue; //the record is new but it was deleted in the frontend, so 
                const { positionId, jobTitleId, classification, startDate, endDate } = currentEmpPos;
                const createdRecordResponse = models.Employee_Position.create({
                    positionId, jobTitleId, classification, startDate, endDate,
                    employeeId
                });
                promises.push(createdRecordResponse);
            }
            // Now reset the flags all to false:
            currentEmpPos.isNew = false; //the new records will become old after inserting them to the database.
            currentEmpPos.isUpdated = false;
        }
        // Now execute the list of promises all in parallel:
        yield Promise.all(promises);
        // Now we can safely remove the deleted objects permanently.
        // Because we have deleted them from the database.
        const updatedList = myEmpPositions.filter((item) => item.isDeleted == false);
        return res.json({
            message: `Positions has been updated for: ${employeeRecord.firstName} ${employeeRecord.lastName}`,
            myEmpPositions: updatedList
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateEmployeePositionsTable = updateEmployeePositionsTable;
// ======= This is for the Cards Page that shows all employees =====
const getAllEmployees = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const positionsList = yield models.Position.findAll();
    const employees = yield models.Employee.findAll();
    for (let i = 0; i < employees.length; ++i) {
        // list of all empPositions for the current employee:
        const employeePositions = yield models.Employee_Position.findAll({
            where: { employeeId: employees[i].id }
        });
        const departments = [];
        for (let j = 0; j < employeePositions.length; ++j) {
            const positions = yield models.Position.findOne({
                where: { id: employeePositions[j].positionId },
            });
            departments.push(positions.description);
        }
        employees[i] = Object.assign(employees[i].dataValues, { 'departments': departments });
    }
    return res.json({
        employees,
        positionsList
    });
});
exports.getAllEmployees = getAllEmployees;
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeePositionId, employeeId, accountId } = req.user;
    const { currentPassword, newPassword } = req.body;
    try {
        const accountRecord = yield models.Account.findByPk(accountId);
        // Compare the currentPassword received from `req.body` with the password stored in the database: 
        const match = yield bcrypt_1.default.compare(currentPassword, accountRecord.password);
        if (match) {
            const hashedNewPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield models.Account.update({ password: hashedNewPassword }, {
                where: { id: accountId }
            });
            return res.status(200).json({
                message: 'Password has been successfully changed',
                statusCode: 200
            });
        }
        else {
            return res.json({
                message: 'This is not your current password',
                statusCode: 403 //Forbidden
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.changePassword = changePassword;
