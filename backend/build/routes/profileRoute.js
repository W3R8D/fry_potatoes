"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)(); // Create Express Router
const tokenValidation_1 = require("../middlewares/tokenValidation");
router.get('/', tokenValidation_1.validateAccessToken, (req, res) => {
    res.json({
        msg: 'Welcome to profile',
        user: req.user,
        // authenticated: req.authenticated
    });
});
exports.default = router; //export the router
