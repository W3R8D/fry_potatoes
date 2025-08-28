"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
class WorkflowValidator {
    checkCreateAction() {
        return [
            (0, express_validator_1.body)("workflowId")
                .notEmpty()
                .withMessage("Must provide a workflowId"),
            (0, express_validator_1.body)("recipients")
                .notEmpty()
                .withMessage("Must specify at least one recipient!")
                .isArray()
                .withMessage("Recipients must be an array of objects"),
            // body("cc")
            //     .notEmpty()
            //     .withMessage("CC field is not provided")
            //     .isArray()
            //     .withMessage("CC must be an array of objects")
            // ,
            // body("richTextContent")
            //     .notEmpty()
            //     .withMessage("Content field is not provided")
            //     .isString()
            // ,
        ];
    }
    checkSearchBy() {
        return [
            (0, express_validator_1.query)('filterBy')
                .notEmpty()
                .withMessage('You need to specify a `filterBy` query')
                .ltrim(' ')
                .rtrim(' '),
            // .isStrongPassword()
            // .withMessage('Please write a strong password')
        ];
    }
}
exports.default = new WorkflowValidator();
