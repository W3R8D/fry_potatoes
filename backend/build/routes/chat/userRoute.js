"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// ============ Middlewares: ========================
const tokenValidation_1 = require("../../middlewares/tokenValidation");
// Import the needed controllers
const userController_1 = require("../../controllers/chat/userController");
router.get("/", tokenValidation_1.validateAccessToken, userController_1.getAllUsers);
router.get("/seenBy", userController_1.whoSawThisMessage);
exports.default = router; //export the router
