"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// ========= express-VALIDATORS: =================
const workflowValidator_1 = __importDefault(require("../validators/workflowValidator"));
// ============ Middlewares: ========================
const tokenValidation_1 = require("../middlewares/tokenValidation");
const requestValidation_1 = __importDefault(require("../middlewares/requestValidation"));
// Import the needed controllers
const workflowController_1 = require("../controllers/workflowController");
// ---- `Actions for a Specific Workflow` ----
router.get("/getActionsByWorkflowId", tokenValidation_1.validateAccessToken, workflowController_1.getActionsByWorkflowId);
router.get("/toWhomCanIRespondWithNewAction", tokenValidation_1.validateAccessToken, workflowController_1.getToWhomCanIRespondWithNewAction);
// ---- `Create New Action to an existing Workflow` ----:
router.post('/create', tokenValidation_1.validateAccessToken, //2nd arg: terminate the request if user is not logged in
workflowValidator_1.default.checkCreateAction(), //3rd arg: express-validator function
requestValidation_1.default, //4th arg: handle errors received from express-validator function 
workflowController_1.createNewAction);
router.post('/create/uploadFiles', tokenValidation_1.validateAccessToken, workflowController_1.uploadNewActionFiles);
exports.default = router; //export the router
