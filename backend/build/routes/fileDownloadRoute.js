"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
// ============ Middlewares: ========================
const tokenValidation_1 = require("../middlewares/tokenValidation");
router.get("/", tokenValidation_1.validateAccessToken, (req, res, next) => {
    try {
        const { fileName } = req.query; // for ex: 22_25_1649887379401.jpg
        res.download(`public/actions_attachments/${fileName}`);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router; //export the router
