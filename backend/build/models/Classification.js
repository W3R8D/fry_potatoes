'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Classification extends sequelize_1.Model {
        static associate(models) {
            // define association here:
        }
    }
    Classification.init({
        id: {
            type: DataTypes.INTEGER(2).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(100),
            unique: true,
            // type: DataTypes.ENUM(),
            // values: [
            //     Classifcations.RESPONSIBLE,
            //     Classifcations.SUBORDINATE,
            //     Classifcations.SECRETARY
            // ],
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Classification',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Classification;
};
