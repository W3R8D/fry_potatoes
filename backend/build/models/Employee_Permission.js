'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Employee_Permission extends sequelize_1.Model {
        static associate(models) {
            // define association here:
        }
    }
    Employee_Permission.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        permissionId: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            allowNull: false,
            references: {
                model: "Permissions",
                key: "id"
            },
            // onDelete: "SET NULL",
            // onUpdate: "CASCADE",
            // primaryKey: true,
            unique: "composite_Employee_Permission_index"
            // Creating two objects with the same value will throw an error. The unique property can be either a
            // boolean, or a string. If you provide the same string for multiple columns, they will form a
            // composite unique key.
            // visit: https://sequelize.org/master/manual/model-basics.html#column-options
        },
        employeeId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "Employees",
                key: "id"
            },
            // onDelete: "SET NULL",
            // onUpdate: "CASCADE",
            // primaryKey: true,
            unique: "composite_Employee_Permission_index"
            // Creating two objects with the same value will throw an error. The unique property can be either a
            // boolean, or a string. If you provide the same string for multiple columns, they will form a
            // composite unique key.
        },
    }, {
        sequelize,
        modelName: 'Employee_Permission',
        freezeTableName: true,
        tableName: "Employees_Permissions"
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Employee_Permission;
};
