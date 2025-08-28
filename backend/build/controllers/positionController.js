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
exports.addPositions = exports.getPositions = void 0;
const models_1 = __importDefault(require("../models/")); // our database connection object
const { models } = models_1.default.sequelize; // returns object with all our models.
require("dotenv/config");
const getPositions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const positions = yield models.Position.findAll();
        return res.json({ positions: positions });
    }
    catch (err) {
        return res.json(err);
    }
});
exports.getPositions = getPositions;
const addPositions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _positions = req.body;
        _positions.reverse();
        let counter = 1;
        const map = new Map();
        _positions.map((pos) => {
            models.Position.create({ id: counter, description: pos.description, parentPositionId: ((counter == 1) ? counter : map.get(pos.parent)) });
            map.set(pos.description, counter);
            counter++;
        });
        res.json("success");
    }
    catch (err) {
        return res.json(err);
    }
});
exports.addPositions = addPositions;
