'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Account extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------{ASSOC #1: Account belongs to Employee}-----------
            Account.belongsTo(models.Employee, { as: "employee", });
            // this will add 'employeeId' column to Account table.
            // -------{ASSOC #2: Account belongs to Employee_Position}----------------
            Account.belongsTo(models.Employee_Position, { as: "lastLoginPosition" });
            // this will add 'lastLoginPositionId' column to Account table.
            // -------{ASSOC #3: Account(`username`) references User(`email`)}----------------
            // Account.belongsTo(models.Employee, {
            //     foreignKey: {
            //         name: "username",
            //         allowNull: false,
            //     },
            //     targetKey: "email",
            // });
            // //remember: Account(`username`) references User(`email`) 😃
        }
    }
    Account.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: true, //will be used to login to the system
            // references: {
            //     model: "Employees",
            //     key: 'email'
            // }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActivated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            // In order to activate the account, the employee must click the activation 
            // link which will be sent to his email address.
        }
    }, {
        sequelize,
        modelName: 'Account',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Account;
};
