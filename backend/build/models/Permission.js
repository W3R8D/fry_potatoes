'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Permission extends sequelize_1.Model {
        static associate(models) {
            // define association here:      
        }
    }
    Permission.init({
        id: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "Permission_index"
        },
    }, {
        sequelize,
        modelName: 'Permission',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Permission;
};
