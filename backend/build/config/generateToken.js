"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_AUTH_SECRET, {
        expiresIn: "30d",
    });
};
exports.default = generateToken;
