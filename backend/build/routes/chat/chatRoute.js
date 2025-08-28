"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// =========== CONTROLLERS =====================
const chatController_1 = require("../../controllers/chat/chatController");
// ========= express-VALIDATORS: =================
const chatValidator_1 = __importDefault(require("../../validators/chatValidator"));
// ============ Middlewares: ========================
const tokenValidation_1 = require("../../middlewares/tokenValidation");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
router.post("/", chatValidator_1.default.checkAccessGroup(), // middleware function to validate request
requestValidation_1.default, // middleware to terminate the request if it is not valid
tokenValidation_1.validateAccessToken, // middleware function to ensure the user is logged in
chatController_1.accessChat // the controller function which is supposed to return the response
);
// 2. Fetching all the chats for this particular user: 👇
router.get("/", tokenValidation_1.validateAccessToken, chatController_1.fetchChats);
// 3. Creating new Group Chat (Group Channel): 👇
router.post("/group", chatValidator_1.default.checkCreateGroup(), // middleware function to validate request
requestValidation_1.default, // middleware to terminate the request if it is not valid
tokenValidation_1.validateAccessToken, // middleware function to ensure the user is logged in
chatController_1.createGroupChat // the controller function which is supposed to return the response
);
router.put("/rename", tokenValidation_1.validateAccessToken, chatController_1.renameGroup);
router.put("/groupremove", tokenValidation_1.validateAccessToken, chatController_1.removeFromGroup);
router.put("/groupadd", tokenValidation_1.validateAccessToken, chatController_1.addToGroup);
router.put("/setNewAdmin", tokenValidation_1.validateAccessToken, chatController_1.setNewAdmin);
exports.default = router; //export the router
