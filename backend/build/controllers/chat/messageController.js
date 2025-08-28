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
exports.setIsSeen = exports.getAllMessages = exports.sendMessage = void 0;
const models_1 = __importDefault(require("../../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
const sequelize_1 = require("sequelize");
require("dotenv/config");
const colors_1 = __importDefault(require("colors"));
const sendMessage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const senderId = req.user.employeeId; // I am the sender of the message
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }
    try {
        const newMessage = yield models.Message.create({
            content: content,
            channelId: chatId,
            senderId: senderId,
        });
        // --- get the IDs of all members in this channel: ---
        let allMembers = yield models.Channel_Member.findAll({
            where: {
                channelId: chatId
            }
        });
        const membersIDs = allMembers.map((m) => m.memberId);
        // // ------- This table `Message_Member` will be deleted --------------
        // let promises = [];
        // for (let i = 0; i < membersIDs.length; i++) {
        //     const mId = membersIDs[i];
        //     const response = models.Message_Member.create({
        //         messageId: newMessage.dataValues.id,
        //         memberId: mId,
        //         isSeen: mId == senderId ? true : false
        //     });
        //     promises.push(response);
        // }
        // await Promise.all(promises);
        // // ---------------------------------------------------------------
        // --- Update the `latestMessageId` of this channel: ---
        yield models.Channel.update({
            latestMessageId: newMessage.dataValues.id
        }, { where: { id: chatId } });
        // --- Update the `lastSeenMessageId` for the sender in this channel: ---
        yield models.Channel_Member.update({
            lastSeenMessageId: newMessage.dataValues.id
        }, {
            where: { channelId: chatId, memberId: senderId }
        });
        // ---------------------------------------------------------------
        // --- ❌💁 Now return the formatted response needed in frontend: ---
        // let selectedChat = await accessChatUtil(req, res, next, chatId);
        // const sender = selectedChat?.members?.find((m: any) => m.memberId == senderId);
        // selectedChat.sender = sender;
        // selectedChat.content = content;
        // // ---------------------------------------------------------------
        // return res.json({
        //     selectedChat
        // });
        // --- ✅💁 Now return the formatted response needed in frontend: ---
        // 1. Fetch the newly sent message with the same format written in `getAllMessages` function:
        const q = `SELECT C.id as channelId, C.name, C.isGroup, E.id as senderId, CONCAT_WS(' ', E.firstName, E.lastName) fullName, E.id, M.id as messageId, M.content, M.createdAt
        FROM channels as C
        JOIN messages as M on M.channelId = C.id
        JOIN employees as E on E.id = M.senderId
        WHERE C.id = ${chatId} AND M.id=${newMessage.dataValues.id}`;
        const message = yield models_1.default.sequelize.query(q, {
            logging: console.log,
            type: sequelize_1.QueryTypes.SELECT
        });
        // Be careful here, the raw query will return a list, not a single object.
        // So, return only the message[0] 
        // 2. Fetch data for the channel on which this message was sent:
        // (This data is needed for the purpose of Socket.io notifications)
        let targetChat = yield accessChatUtil(req, res, next, chatId);
        const sender = (_a = targetChat === null || targetChat === void 0 ? void 0 : targetChat.members) === null || _a === void 0 ? void 0 : _a.find((m) => m.memberId == senderId);
        targetChat.sender = sender;
        targetChat.content = content;
        return res.json({
            message: message[0],
            targetChat
        });
    }
    catch (error) {
        next(error);
    }
});
exports.sendMessage = sendMessage;
const accessChatUtil = (req, res, next, channelId) => __awaiter(void 0, void 0, void 0, function* () {
    const myId = req.user.employeeId;
    try {
        let myChannel = yield models.Channel_Member.findOne({
            include: [
                {
                    model: models.Channel,
                    as: "channel"
                },
            ],
            where: {
                memberId: myId,
                channelId: channelId
            },
            raw: true,
        });
        // ----------- Regarding channel MEMBERS -------------------
        const members = yield models.Channel_Member.findAll({
            where: {
                channelId: myChannel.channelId,
            },
            raw: true,
        });
        for (let j = 0; j < members.length; j++) {
            let member = members[j];
            let employeeRecord = yield models.Employee.findOne({
                where: { id: member.memberId }
            });
            let { firstName, middleName, lastName, email, avatar } = employeeRecord;
            member.fullName = firstName + " " + lastName;
            member.email = email;
            member.avatar = avatar;
        }
        myChannel.members = members;
        // ----------- End Regarding channel MEMBERS -------------------
        // -------- Check if the chat (channel) is a group: ----------------
        if (myChannel["channel.isGroup"] == true) {
            // then find its admin:
            let channelAdmin = myChannel.members.find((member) => member.isAdmin == true);
            myChannel.admin = channelAdmin;
        }
        // console.log(myChannels);
        return myChannel;
    }
    catch (error) {
        next(error);
    }
});
const getAllMessages = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myId = req.user.employeeId;
        const { chatId } = req.params;
        // Fetch all messages of a particular chat:
        const q = `SELECT C.id as channelId, C.name, C.isGroup, C.latestMessageId, E.id as senderId, CONCAT_WS(' ', E.firstName, E.lastName) fullName, E.id, E.avatar, M.id as messageId, M.content, M.createdAt
        FROM channels as C
        JOIN messages as M on M.channelId = C.id
        JOIN employees as E on E.id = M.senderId
        WHERE C.id = ${chatId}`;
        const messages = yield models_1.default.sequelize.query(q, {
            logging: console.log,
            type: sequelize_1.QueryTypes.SELECT
        });
        return res.json({
            messages
        });
    }
    catch (err) {
        // console.log(err.message);
        next(err);
    }
});
exports.getAllMessages = getAllMessages;
const setIsSeen = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const senderId = req.user.employeeId; // I am the sender of the message
    const { channelId, memberId } = req.body;
    if (!channelId || !memberId) {
        console.log("Please provide a channelId and memberId");
        return res.sendStatus(400);
    }
    try {
        // // --- get the IDs of all messages in this channel: ---
        // let allMessages = await models.Message.findAll({
        //     where: { channelId: channelId }
        // });
        // const allMessagesIDs = allMessages.map((msg: any) => msg.id);
        // console.log("allMessages: ", allMessages);
        // ---- Get the `latestMessageId` on this channel: ---
        const channelRecord = yield models.Channel.findByPk(channelId, {
            raw: true,
            attributes: ["latestMessageId"]
        });
        // ---- update the `lastSeenMessageId` for this member on this channel: ---
        const updatedRecord = yield models.Channel_Member.update({
            lastSeenMessageId: channelRecord.latestMessageId
        }, {
            where: {
                channelId, memberId
            }
        });
        console.log(colors_1.default.bgCyan(`SET IS SEEN FOR: ${memberId}`));
        return res.json({
            updatedRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.setIsSeen = setIsSeen;
