"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// =========== CONTROLLERS =====================
const employeeController_1 = require("../controllers/employeeController");
const updateEmployeeController_1 = require("../controllers/updateEmployeeController");
// ========= express-VALIDATORS: =================
const employeeValidator_1 = __importDefault(require("../validators/employeeValidator"));
// ============ Middlewares: ========================
const tokenValidation_1 = require("../middlewares/tokenValidation");
const requestValidation_1 = __importDefault(require("../middlewares/requestValidation"));
router.post("/checkUsernameExists", tokenValidation_1.validateAccessToken, employeeController_1.checkUsernameExists);
router.get("/positions", tokenValidation_1.validateAccessToken, employeeController_1.fetchPositions);
router.post('/add', // add new employee by the admin page
tokenValidation_1.validateAccessToken, // 2nd arg: validateAccessToken middleware function
employeeValidator_1.default.checkAddUser(), //3rd arg: express-validator function
requestValidation_1.default, //4th arg: handle errors received from express-validator function 
employeeController_1.addEmployee // 5th arg: controller function
);
router.put("/updateLastLoginPositionId", tokenValidation_1.validateAccessToken, // 2nd arg: validateAccessToken middleware function
employeeValidator_1.default.checkEmployeeCurrentPositionId(), //3rd arg: express-validator function
requestValidation_1.default, //4th arg: handle errors received from express-validator function 
employeeController_1.updateLastLoginPositionId // 5th arg: controller function
);
router.get("/avatar", tokenValidation_1.validateAccessToken, // 2nd arg: validateAccessToken middleware function
employeeController_1.getUserAvatar // 3rd arg: controller function
);
router.get("/", tokenValidation_1.validateAccessToken, // 2nd arg: validateAccessToken middleware function
employeeController_1.getEmployeeRecord);
// ------ Hamadneh Update Employee --------------
router.get("/initializeUpdateForm", tokenValidation_1.validateAccessToken, updateEmployeeController_1.informationOfEmployee);
router.put("/update", tokenValidation_1.validateAccessToken, updateEmployeeController_1.updateEmployeeInfo);
router.put("/updateEmployeePositions", tokenValidation_1.validateAccessToken, updateEmployeeController_1.updateEmployeePositionsTable);
router.get("/all", tokenValidation_1.validateAccessToken, updateEmployeeController_1.getAllEmployees);
router.put("/updateEmployeeAvatar", tokenValidation_1.validateAccessToken, updateEmployeeController_1.updateImageOfEmployee);
router.get("/employeePositions/:employeeId", tokenValidation_1.validateAccessToken, updateEmployeeController_1.getEmployeePositions);
router.put("/change-password", tokenValidation_1.validateAccessToken, updateEmployeeController_1.changePassword);
exports.default = router; //export the router
