"use strict";
// 'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
module.exports = {
    up(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.createTable('users', {
                id: {
                    type: Sequelize.INTEGER(11).UNSIGNED,
                    primaryKey: true,
                    allowNull: false,
                    autoIncrement: true,
                },
                firstName: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                    // validate: {
                    //   isGT3
                    // }
                },
                middleName: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                },
                lastName: {
                    type: Sequelize.STRING(30),
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    unique: true, //will be used to login to the system
                },
                avatar: {
                    type: Sequelize.STRING(300),
                    allowNull: true,
                },
                phoneNumber: {
                    type: Sequelize.STRING(32),
                    allowNull: false,
                },
                hireDate: {
                    type: Sequelize.DATEONLY,
                    // Since Sequelize.DATE will be converted to DATETIME for mysql. 
                    allowNull: false,
                },
                userStatus: {
                    type: Sequelize.ENUM(),
                    // values must be array of strings
                    values: [
                        "regular", "in-vacation", "fired", "retired"
                    ],
                    defaultValue: "regular",
                    allowNull: false, // although there is a default value, this default valueensures
                    // that the field will not be null when record is inserted for first time,
                    // but since we can update the field after insertion and make it null,
                    // so that's why we put allowNull: false
                },
                role: {
                    type: Sequelize.ENUM,
                    values: [
                        "admin", "moderator", "full-time-employee", "part-time-employee"
                    ],
                    defaultValue: "full-time-employee",
                    allowNull: false,
                }
            });
        });
    },
    down(queryInterface, Sequelize) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryInterface.dropTable('users');
        });
    }
};
// module.s = { up, down }
