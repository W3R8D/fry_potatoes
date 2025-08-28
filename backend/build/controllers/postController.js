"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = void 0;
const models_1 = __importDefault(require("../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
const getPosts = (req, res) => {
    models_1.default.User.findAll({
        include: {
            model: models.Project,
        },
        attributes: {
            exclude: ['password']
        }
    })
        .then((result) => {
        //console.log(JSON.stringify(result));
        return res.json(result);
    })
        .catch((err) => console.log(err));
};
exports.getPosts = getPosts;
exports.default = { getPosts: exports.getPosts };
