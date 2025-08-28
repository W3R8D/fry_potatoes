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
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// =========== CONTROLLERS =====================
const authController_1 = require("../controllers/authController");
// ========= express-VALIDATORS: =================
const authValidator_1 = __importDefault(require("../validators/authValidator"));
// ============ Middlewares: ========================
const requestValidation_1 = __importDefault(require("../middlewares/requestValidation"));
const tokenValidation_1 = require("../middlewares/tokenValidation");
router.get("/verifyToken", tokenValidation_1.validateAccessToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get info regarding whether the user is authenticated or not
    // The program reaches here only if the middleware function allowed the request to pass to 
    // this point by calling the next() function:
    // console.log("req.user: " + JSON.stringify(req.user, undefined, 4)); // req.user is contains the decoded jwt payload received from the middleware function `validateAccessToken`
    return res.json({
        user: req.user,
        tokenVerified: true,
        statusCode: 200,
    });
}));
router.post('/login', authValidator_1.default.checkLoginUser(), //2nd arg: express-validator function
requestValidation_1.default, //3rd arg: handle errors received from express-validator function 
authController_1.loginUser);
router.post('/verification', authController_1.verifyCodeToResetForgottenPassword);
router.post('/forgot-password', authController_1.forgotPassword);
// ----------- Faris Forgot Password ------------------
router.post('/forgot-password-faris', authController_1.forgotPasswordFaris);
router.put('/reset-password', authController_1.resetPassword);
router.post('/verify-reset-password', authController_1.verifyResetPassword);
router.delete('/logout', authController_1.logoutUser);
router.patch('/activate', tokenValidation_1.validateAccountActivationToken, //middleware function
authController_1.activateAccount //controller function
);
exports.default = router; //export the router
