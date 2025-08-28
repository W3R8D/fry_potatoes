"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router(); // Create Express Router
// Import all used routes 
const authRoute_1 = __importDefault(require("./authRoute"));
const profileRoute_1 = __importDefault(require("./profileRoute"));
const employeeRoute_1 = __importDefault(require("./employeeRoute"));
const workflowRoute_1 = __importDefault(require("./workflowRoute"));
const actionRoute_1 = __importDefault(require("./actionRoute"));
const fileDownloadRoute_1 = __importDefault(require("./fileDownloadRoute"));
const positionRoute_1 = __importDefault(require("./positionRoute"));
const chatRoute_1 = __importDefault(require("./chat/chatRoute"));
const userRoute_1 = __importDefault(require("./chat/userRoute"));
const messageRoute_1 = __importDefault(require("./chat/messageRoute"));
// Import the needed controllers
const indexController_1 = require("../controllers/indexController");
router.get('/', indexController_1.indexWelcome);
router.use('/auth', authRoute_1.default);
router.use('/profile', profileRoute_1.default);
router.use('/employee', employeeRoute_1.default);
router.use('/workflow', workflowRoute_1.default);
router.use('/action', actionRoute_1.default);
router.use('/downloadFile', fileDownloadRoute_1.default);
router.use('/positions', positionRoute_1.default);
router.use('/chat', chatRoute_1.default);
router.use('/chat-user', userRoute_1.default);
router.use('/message', messageRoute_1.default);
exports.default = router; //export the router
