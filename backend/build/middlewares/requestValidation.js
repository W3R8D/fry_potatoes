"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
// Middleware FUnction to handle validation result which will be received from 
// express-validator function:
const handleValidation = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req); //this returns array called: errors if there is any error.
    if (!errors.isEmpty()) {
        // then there is an error (or errors) in the request. 
        // No need to return all errors, just return the 1st error.
        // This will make the front-end easier to show response:
        return res.json(errors.array()[0]);
    }
    // else, then the request passed the validation test:
    next(); //pass the request to its next stage (the controller function)
};
exports.default = handleValidation;
