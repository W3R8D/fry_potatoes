"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexWelcome2 = exports.indexWelcome = void 0;
const indexWelcome = (req, res) => {
    return res.json('Welcome to My API');
};
exports.indexWelcome = indexWelcome;
const indexWelcome2 = (req, res) => {
    return res.json('Welcome to My API2');
};
exports.indexWelcome2 = indexWelcome2;
exports.default = { indexWelcome: exports.indexWelcome, indexWelcome2: exports.indexWelcome2 };
