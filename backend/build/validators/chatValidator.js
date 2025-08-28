"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
class ChatValidator {
    checkAccessGroup() {
        return [
            (0, express_validator_1.body)('userId')
                .notEmpty()
                .withMessage('userId field is empty!')
                .ltrim(' ')
                .rtrim(' '),
        ];
    }
    checkCreateGroup() {
        return [
            (0, express_validator_1.body)('membersIDs')
                .notEmpty()
                .withMessage('membersIDs field is empty!')
                .isArray()
                .withMessage("membersIDs must be an array"),
            (0, express_validator_1.body)("name")
                .notEmpty()
                .withMessage('name field is empty!')
                .isString()
                .withMessage('name field must be string!')
        ];
    }
}
/*
.isStrongPassword()
Check if a password is strong or not. Allows for custom requirements or scoring rules. If returnScore is true, then the function returns an integer score for the password rather than a boolean.
Default options:
{ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10, pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }
*/
exports.default = new ChatValidator();
