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
exports.setNewAdmin = exports.removeFromGroup = exports.addToGroup = exports.renameGroup = exports.createGroupChat = exports.fetchChats = exports.accessChat = void 0;
const models_1 = __importDefault(require("../../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
require("dotenv/config");
const accessChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // remove the cookie whose name is "access-token" from the server:
    try {
        const { userId } = req.body;
        const myId = req.user.employeeId;
        // Check if a chat with this userId exists (one-on-One chat), then return it.
        // But if it doesn't exist, create a chat with this userId.
        let myChannelsRes = models.Channel_Member.findAll({
            include: [{
                    model: models.Channel,
                    as: "channel"
                }],
            where: {
                memberId: myId,
                '$channel.isGroup$': false,
            }
        });
        let otherUserChannelsRes = models.Channel_Member.findAll({
            include: [{
                    model: models.Channel,
                    as: "channel"
                }],
            where: {
                memberId: userId,
                '$channel.isGroup$': false,
            }
        });
        let [myChannels, otherUserChannels] = yield Promise.all([myChannelsRes, otherUserChannelsRes]);
        myChannels = myChannels.map((ch) => ch.channelId);
        otherUserChannels = otherUserChannels.map((ch) => ch.channelId);
        let intersection = myChannels.filter((myChannel) => otherUserChannels.includes(myChannel));
        let channelIdMeAndYou;
        if (intersection.length > 0) {
            // then there is a previous channel between me and the user with userId
            // the intersection.length is either 0 or 1.
            channelIdMeAndYou = intersection[0];
            // const q = `SELECT DISTINCT C.id, C.name, C.latestMessageId, CM.memberId, E.firstName, E.avatar, M.content 
            // FROM channels as C
            // JOIN channels_members as CM on CM.channelId = C.id 
            // JOIN messages as M on M.channelId = C.id
            // JOIN employees_positions as EP on EP.id = CM.memberId
            // JOIN employees as E on E.id = EP.employeeId
            // WHERE C.id = ${intersection[0]}
            // AND M.id = C.latestMessageId`;
            // const q = `SELECT C.id, C.name, C.latestMessageId, CM.memberId, E.firstName, E.avatar, M.content
            // FROM channels as C
            // JOIN channels_members as CM on CM.channelId = C.id
            // JOIN messages as M on M.channelId = C.id
            // JOIN employees as E on E.id = CM.memberId
            // WHERE C.id = ${intersection[0]}
            // AND M.senderId = CM.memberId`;
            // const q = `SELECT C.id, C.name, C.isGroup, C.latestMessageId, CM.memberId, E.firstName, E.avatar
            // FROM channels as C
            // JOIN channels_members as CM on CM.channelId = C.id
            // JOIN employees as E on E.id = CM.memberId
            // WHERE C.id = ${intersection[0]}`;
            // let fullChat = await db.sequelize.query(q, {
            //     logging: console.log,
            //     type: QueryTypes.SELECT
            // });
            // --- 🤯🤯🤯🤯🤯🤯🤯🤯🤯
            // const myChannels: any = await fetchChatsUtil(req, res, next);
            // const selectedChat = myChannels.find(
            //     (myChannel: any) => myChannel.channelId == intersection[0]
            // );
            // --- 🤯🤯🤯🤯🤯🤯🤯🤯🤯
            // const selectedChat: any = await accessChatUtil(req, res, next, intersection[0]);
            // return res.json({
            //     selectedChat
            // });
        }
        else {
            // then we have to create a channel between me and you:
            const senderEmpRecord = yield models.Employee.findByPk(userId);
            const newChannel = yield models.Channel.create({
                name: senderEmpRecord.firstName + ' ' + senderEmpRecord.lastName,
                isGroup: false, //because it is a direct channel (between 2 persons only)
            });
            // create 2 records of `Channels_Members` table: 
            const newChannelMembers = yield models.Channel_Member.bulkCreate([
                { channelId: newChannel.id, memberId: myId, isAdmin: false },
                { channelId: newChannel.id, memberId: userId, isAdmin: false },
            ]);
            channelIdMeAndYou = newChannel.id;
            // const q = `SELECT * FROM channels as C
            // JOIN channels_members as CM on CM.channelId = C.id 
            // WHERE C.id = ${newChannel.id}`;
            // let selectedChat = await db.sequelize.query(q, {
            //     logging: console.log,
            //     type: QueryTypes.SELECT
            // });
            // return res.status(200).json({
            //     selectedChat
            // });
            // --- 🤯🤯🤯🤯🤯🤯🤯🤯🤯
            // const myChannels: any = await fetchChatsUtil(req, res, next);
            // const selectedChat = myChannels.find(
            //     (myChannel: any) => myChannel.channelId == newChannel.id
            // );
            // --- 🤯🤯🤯🤯🤯🤯🤯🤯🤯
            // const selectedChat: any = await accessChatUtil(req, res, next, newChannel.id);
            // return res.json({
            //     selectedChat
            // });
        }
        const selectedChat = yield accessChatUtil(req, res, next, channelIdMeAndYou);
        return res.json({
            selectedChat
        });
    }
    catch (err) {
        // console.log(err.message);
        next(err);
    }
});
exports.accessChat = accessChat;
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
        // -------- Fetch data about the latest message --------
        if (myChannel["channel.latestMessageId"] !== null) {
            let latestMessage = yield models.Message.findOne({
                where: { id: myChannel["channel.latestMessageId"] },
                raw: true,
            });
            // Get the sender of the latest message:
            let latestMessageSender = myChannel.members.find((member) => member.memberId == (latestMessage === null || latestMessage === void 0 ? void 0 : latestMessage.senderId));
            latestMessage.sender = latestMessageSender;
            // console.log("latestMessage**: ", latestMessage);
            myChannel.latestMessage = latestMessage;
        }
        // console.log(myChannels);
        return myChannel;
    }
    catch (error) {
        next(error);
    }
});
const fetchChatsUtil = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const myId = req.user.employeePositionId;
    const myId = req.user.employeeId;
    try {
        // return all the chats (channels) which this particular user is part of:
        let myChannels = yield models.Channel_Member.findAll({
            include: [
                {
                    model: models.Channel,
                    as: "channel"
                },
            ],
            where: {
                memberId: myId
            },
            raw: true,
        });
        for (let i = 0; i < myChannels.length; i++) {
            let myChannel = myChannels[i];
            // ----------- Regarding channel MEMBERS -------------------
            const members = yield models.Channel_Member.findAll({
                where: {
                    channelId: myChannel.channelId,
                },
                raw: true,
            });
            for (let j = 0; j < members.length; j++) {
                let member = members[j];
                // let memberEmpPosIdRecord = await models.Employee_Position.findOne({
                //     where: { id: member.memberId }
                // });
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
                let channelAdmin = myChannel.members.find((member) => member.isAdmin == true);
                myChannel.admin = channelAdmin;
            }
            // Fetch data about the latest message
            if (myChannel["channel.latestMessageId"] !== null) {
                let latestMessage = yield models.Message.findOne({
                    where: { id: myChannel["channel.latestMessageId"] },
                    raw: true,
                });
                // Get the sender of the latest message:
                let latestMessageSender = myChannel.members.find((member) => member.memberId == (latestMessage === null || latestMessage === void 0 ? void 0 : latestMessage.senderId));
                latestMessage.sender = latestMessageSender;
                // console.log("latestMessage**: ", latestMessage);
                myChannel.latestMessage = latestMessage;
            }
            console.log(myChannels);
        }
        return myChannels;
    }
    catch (error) {
        next(error);
    }
});
const fetchChats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myChannels = yield fetchChatsUtil(req, res, next);
        return res.json({
            myChannels
        });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchChats = fetchChats;
const createGroupChat = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // users will be sent on stringify format and we will parse it.
    // const myId = req.user.employeePositionId;
    const myId = req.user.employeeId;
    // let users = JSON.parse(req.body.users);
    let membersIDs = req.body.membersIDs;
    if (membersIDs.length < 2) {
        return res.status(400).send("More then 2 users are required to form a group chat");
    }
    // users.push(req.user); //push myself to the array (I am the creator of the channel)
    try {
        const groupChat = yield models.Channel.create({
            name: req.body.name,
            isGroup: true,
        });
        let promises = [];
        for (let i = 0; i < membersIDs.length; i++) {
            let membersID = membersIDs[i];
            let newUserResponse = models.Channel_Member.create({
                channelId: groupChat.id,
                memberId: membersID,
                isAdmin: false,
            });
            promises.push(newUserResponse);
        }
        // Don't forget to add myself as the creator/admin of the group:
        let newUserResponse = models.Channel_Member.create({
            channelId: groupChat.id,
            memberId: myId,
            isAdmin: true,
        });
        promises.push(newUserResponse);
        // Now execute the list of promises: (Create a `Channel_Member` record for each user)
        yield Promise.all(promises);
        // -------- Now return the response (the newly created channel with its users):
        // return all the chats (channels) which this particular user is part of:
        let myNewGroupChannel = yield models.Channel_Member.findOne({
            include: [
                {
                    model: models.Channel,
                    as: "channel"
                },
            ],
            where: {
                memberId: myId,
                channelId: groupChat.id //the id of the newly created channel
            },
            raw: true,
        });
        // ----------- Regarding the MEMBERS of the newly created channel  -------------------
        const members = yield models.Channel_Member.findAll({
            where: {
                channelId: groupChat.id,
            },
            raw: true,
        });
        for (let j = 0; j < members.length; j++) {
            let member = members[j];
            // let memberEmpPosIdRecord = await models.Employee_Position.findOne({
            //     where: { id: member.memberId }
            // });
            let employeeRecord = yield models.Employee.findByPk(member.memberId);
            let { firstName, middleName, lastName, email, avatar } = employeeRecord;
            member.fullName = firstName + " " + lastName;
            member.email = email;
            member.avatar = avatar;
        }
        // groupChat.dataValues.members = members;
        myNewGroupChannel.members = members;
        // ----------- End Regarding channel MEMBERS -------------------
        // ------------ Fetch data about the admin (which is me - the channel creator):
        // let channelAdmin = groupChat.dataValues.members.filter(
        //     (member: any) => member.isAdmin == true
        // );
        // groupChat.dataValues.admin = channelAdmin;
        let channelAdmin = myNewGroupChannel.members.filter((member) => member.isAdmin == true);
        myNewGroupChannel.admin = channelAdmin;
        return res.status(200).json({
            myNewGroupChannel
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createGroupChat = createGroupChat;
const renameGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId, chatNewName } = req.body;
    try {
        const chat = yield models.Channel.findByPk(chatId);
        if (chat == null) {
            res.status(404);
            throw new Error("Chat Not Found");
        }
        const message = `Chat name has been updated from "${chat.name}" to "${chatNewName}"`;
        chat.update({
            name: chatNewName,
        });
        res.json({ chat, message });
    }
    catch (error) {
        next(error);
    }
});
exports.renameGroup = renameGroup;
const addToGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const foundUser = yield models.Employee.findByPk(userId);
        const foundChat = yield models.Channel.findByPk(chatId);
        if (!foundUser) {
            res.status(404);
            throw new Error("User Not Found with id: " + userId);
        }
        if (!foundChat) {
            res.status(404);
            throw new Error("Chat Not Found with id: " + chatId);
        }
        // Check that the user is not already in this chat:
        const userAlreadyInThisChat = yield models.Channel_Member.findOne({
            where: {
                memberId: foundUser.id,
                channelId: foundChat.id
            }
        });
        if (userAlreadyInThisChat) {
            res.status(400);
            throw new Error(`User: ${foundUser.firstName} is already a member in Chat: ${foundChat.name}`);
        }
        // Add the user to the chat:
        let newlyAddedUser = yield models.Channel_Member.create({
            memberId: foundUser.id,
            channelId: foundChat.id,
            isAdmin: false,
        });
        // ---------- Now return the added user to update the redux state `selectedChat` in frontend:
        // await models.Channel_Member.findOne({
        //     where: {memberId: userId},
        //     raw: true
        // })
        newlyAddedUser = newlyAddedUser.dataValues;
        newlyAddedUser = Object.assign(Object.assign({}, newlyAddedUser), { fullName: foundUser.dataValues.firstName + " " + foundUser.dataValues.lastName, email: foundUser.dataValues.email, avatar: foundUser.dataValues.email });
        console.log("newlyAddedUser**: ", newlyAddedUser);
        return res.json({
            newlyAddedUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addToGroup = addToGroup;
const removeFromGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const foundUser = yield models.Employee.findByPk(userId);
        const foundChat = yield models.Channel.findByPk(chatId);
        if (!foundUser) {
            res.status(404);
            throw new Error("User Not Found with id: " + userId);
        }
        if (!foundChat) {
            res.status(404);
            throw new Error("Chat Not Found with id: " + chatId);
        }
        // Check that the user is not already in this chat:
        const userAlreadyInThisChat = yield models.Channel_Member.findOne({
            where: {
                memberId: foundUser.id,
                channelId: foundChat.id
            }
        });
        if (!userAlreadyInThisChat) {
            res.status(400);
            throw new Error(`User: ${foundUser.firstName} is not even a member of Chat: ${foundChat.name}`);
        }
        // Delete the user from the chat:
        const deletedUser = yield models.Channel_Member.destroy({
            where: {
                memberId: foundUser.id,
                channelId: foundChat.id
            }
        });
        return res.json({
            deletedUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.removeFromGroup = removeFromGroup;
const setNewAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, userId } = req.body;
        const foundUser = yield models.Employee.findByPk(userId);
        const foundChat = yield models.Channel.findByPk(chatId);
        if (!foundUser) {
            res.status(404);
            throw new Error("User Not Found with id: " + userId);
        }
        if (!foundChat) {
            res.status(404);
            throw new Error("Chat Not Found with id: " + chatId);
        }
        // Check that the user is not already in this chat:
        const userAlreadyInThisChat = yield models.Channel_Member.findOne({
            where: {
                memberId: foundUser.id,
                channelId: foundChat.id
            }
        });
        if (!userAlreadyInThisChat) {
            res.status(400);
            throw new Error(`User: ${foundUser.firstName} is not even a member of Chat: ${foundChat.name}`);
        }
        // Delete the user from the chat:
        const theNewAdmin = yield models.Channel_Member.update({
            isAdmin: true
        }, {
            where: {
                memberId: foundUser.id,
                channelId: foundChat.id
            }
        });
        return res.json({
            theNewAdmin
        });
    }
    catch (error) {
        next(error);
    }
});
exports.setNewAdmin = setNewAdmin;
// ======================================================================
// export default { registerUser, loginUser }
