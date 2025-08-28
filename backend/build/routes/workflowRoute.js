"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// --------------- Validators --------------------------------
const workflowValidator_1 = __importDefault(require("../validators/workflowValidator"));
// --------------- Middlewares --------------------------------
const tokenValidation_1 = require("../middlewares/tokenValidation");
const requestValidation_1 = __importDefault(require("../middlewares/requestValidation"));
// Import the needed controllers
// ----------- Workflow Controller -----------
const workflowController_1 = require("../controllers/workflowController");
// ----------- Inbox Controller -----------
const workflowTableController_1 = require("../controllers/workflowTableController");
// ---- `Create New Workflow` ----:
router.post('/create', tokenValidation_1.validateAccessToken, workflowController_1.createNewWorkflow);
router.post('/create/uploadFiles', tokenValidation_1.validateAccessToken, workflowController_1.uploadNewWorkflowFiles);
router.get("/toWhomCanISendNewWorkflow", tokenValidation_1.validateAccessToken, workflowController_1.getToWhomCanISendNewWorkflow);
// ---- `View Workflow Table Page (Inbox, Follow-Up, CC)` ----:
router.get("/table", tokenValidation_1.validateAccessToken, workflowTableController_1.populateTable);
router.patch("/table/pinRecord", tokenValidation_1.validateAccessToken, workflowTableController_1.toggleRecordPin);
router.patch("/table/moveToOrFromArchive", tokenValidation_1.validateAccessToken, workflowTableController_1.moveToOrFromArchive);
router.get("/searchBy", tokenValidation_1.validateAccessToken, //2nd arg: middleware function to checkAccessToken
workflowValidator_1.default.checkSearchBy(), //3rd arg: express-validator function
requestValidation_1.default, //4th arg: handle errors received from express-validator function 
workflowTableController_1.searchBy);
router.get("/getEmployeesListToSearchBy", tokenValidation_1.validateAccessToken, workflowController_1.getEmployeesListToSearchBy);
// router.get("/multiJoin", validateAccessToken, multiJoin);
exports.default = router; //export the router
