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
exports.whoSawThisMessage = exports.getAllUsers = void 0;
const models_1 = __importDefault(require("../../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
const sequelize_1 = require("sequelize");
require("dotenv/config");
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // remove the cookie whose name is "access-token" from the server:
    try {
        const keyword = req.query.search;
        console.log(keyword);
        console.log(req.user);
        // Find all users matching the search query (the keyword) and exclude yourself.
        const users = yield models.Employee.findAll({
            // include: [models.Account, models.Employee_Position], 
            include: [models.Account],
            where: {
                id: { [sequelize_1.Op.ne]: req.user.employeeId },
                [sequelize_1.Op.or]: {
                    firstName: { [sequelize_1.Op.like]: `%${keyword}%` },
                    middleName: { [sequelize_1.Op.like]: `%${keyword}%` },
                    lastName: { [sequelize_1.Op.like]: `%${keyword}%` },
                    email: { [sequelize_1.Op.like]: `%${keyword}%` },
                    '$Account.username$': { [sequelize_1.Op.like]: `%${keyword}%` },
                }
            }
        });
        for (let i = 0; i < users.length; i++) {
            let user = users[i].dataValues;
            user.fullName = `${user.firstName} ${user.lastName}`;
        }
        // for(let i = 0; i <users.length; i++) {
        //     let user = users[i].dataValues;
        //     console.log("USER**: ", user);
        //     for(let j=0; j < user.Employee_Positions.length; j++) {
        //         let empPos = user.Employee_Positions[j].dataValues;
        //         console.log("empPos**: ", empPos);
        //         console.log("empPos.positionId**: ", empPos.positionId);
        //         let positionRecord = await models.Position.findByPk(empPos.positionId);
        //         empPos.position = positionRecord.description;
        //         let jobTitleRecord = await models.JobTitle.findByPk(empPos.jobTitleId);
        //         empPos.jobTitle = jobTitleRecord.title;
        //     }
        // }
        return res.json({
            result: users
        });
    }
    catch (err) {
        // console.log(err.message);
        next(err);
    }
});
exports.getAllUsers = getAllUsers;
const whoSawThisMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { channelId, messageId } = req.query;
    if (!channelId || !messageId) {
        console.log("Please provide a channelId and messageId");
        return res.sendStatus(400);
    }
    // console.log("**channelId: ", channelId);
    // console.log("**messageId: ", messageId);
    try {
        const seeners = yield models.Channel_Member.findAll({
            include: [{
                    model: models.Employee,
                    as: "member",
                    attributes: ["firstName", "middleName", "lastName", "avatar"]
                }],
            where: {
                channelId,
                lastSeenMessageId: {
                    [sequelize_1.Op.gte]: messageId
                }
            },
        });
        console.log(seeners);
        return res.json({
            seeners
        });
    }
    catch (error) {
        next(error);
    }
});
exports.whoSawThisMessage = whoSawThisMessage;
// export default { registerUser, loginUser }
