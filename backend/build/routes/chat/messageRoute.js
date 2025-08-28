"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// ============ Middlewares: ========================
const tokenValidation_1 = require("../../middlewares/tokenValidation");
// Import the needed controllers
const messageController_1 = require("../../controllers/chat/messageController");
// For sending a message:
router.post("/", tokenValidation_1.validateAccessToken, messageController_1.sendMessage);
router.get("/:chatId", tokenValidation_1.validateAccessToken, messageController_1.getAllMessages);
router.patch("/setIsSeen", tokenValidation_1.validateAccessToken, messageController_1.setIsSeen);
// For fetching all messages of a channel(chat):
exports.default = router; //export the router
