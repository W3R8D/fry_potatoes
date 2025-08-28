"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// --------------- Middlewares --------------------------------
const tokenValidation_1 = require("../middlewares/tokenValidation");
// =========== CONTROLLERS =====================
const positionController_1 = require("../controllers/positionController");
router.get("/", positionController_1.getPositions);
router.post("/", positionController_1.addPositions);
// router.post("add", getPositions);
router.get("/", tokenValidation_1.validateAccessToken, positionController_1.getPositions);
router.post("/", tokenValidation_1.validateAccessToken, positionController_1.addPositions);
exports.default = router; //export the router
