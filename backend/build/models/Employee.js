'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Employee_1 = require("../interfaces/Employee");
// remember that these 2 arguments: (sequelize, DataTypes) came from the 
// ./models/index.js file  from the forEach in line:23
module.exports = (sequelize, DataTypes) => {
    //(In some situations, not all type information is available)
    //Since Sequelize is a 3rd party library and we should trust it, so here we
    //can specify the 'any' type for the function arguments. 
    class Employee extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------{#1: Employee HAS MANY EmpPositions} -------
            Employee.hasMany(models.Employee_Position, {
                foreignKey: {
                    name: 'employeeId',
                    allowNull: false,
                },
                // onDelete: 'SET NULL',
                // onUpdate: 'CASCADE',
            });
            // -------{#2: Employee HAS ONE Account} -------
            Employee.hasOne(models.Account, {
                foreignKey: {
                    name: 'employeeId',
                    allowNull: false,
                },
                // onDelete: 'SET NULL',
                // onUpdate: 'CASCADE',
            });
            // -------{#3: Employee HAS ONE Account} -------
            // // Account(`username`) references Employee(`email`) 😃
            // Employee.hasOne(models.Account, {
            //   foreignKey: {
            //     name: 'username',
            //     allowNull: false,
            //   },
            //   onDelete: 'NO ACTION',
            //   onUpdate: 'CASCADE',
            // })
            Employee.hasMany(models.Channel_Member, {
                foreignKey: {
                    name: 'memberId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            // Employee.hasMany(models.Message_Member, {
            //   foreignKey: {
            //     name: 'memberId',
            //     allowNull: false,
            //   },
            //   onDelete: 'CASCADE',
            //   onUpdate: 'CASCADE',
            // });
            Employee.hasMany(models.Message, {
                foreignKey: {
                    name: 'senderId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    }
    ;
    // ===== User-defined validator functions: ===============
    function isGT3(value) {
        value = value.trim();
        if (value.length <= 2) {
            throw new Error('First Name must be greater than 2 letters');
        }
        return value;
    }
    // Now grab the created 'Employee' class, and initialize the schema:
    Employee.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING(30),
            allowNull: false,
            // validate: {
            //   isGT3
            // }
        },
        middleName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, //will be used to login to the system
        },
        avatar: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING(15),
            // Thanks to the international phone numbering plan (ITU-T E. 164), phone numbers cannot contain more than 15 digits. 
            allowNull: false,
        },
        hireDate: {
            type: DataTypes.DATEONLY,
            // Since DataTypes.DATE will be converted to DATETIME for mysql. 
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        birthDate: {
            type: DataTypes.DATEONLY,
            // Since DataTypes.DATE will be converted to DATETIME for mysql. 
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM(),
            values: ["male", "female"],
            defaultValue: "male",
            allowNull: false,
        },
        maritalStatus: {
            type: DataTypes.ENUM(),
            // values must be array of strings
            values: [
                Employee_1.MaritalStatus.SINGLE,
                Employee_1.MaritalStatus.MARRIED,
                Employee_1.MaritalStatus.DIVORCED,
                Employee_1.MaritalStatus.WIDOWED,
                Employee_1.MaritalStatus.OTHER,
            ],
            defaultValue: Employee_1.MaritalStatus.SINGLE,
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(255),
            defaultValue: "Tulkarm"
        },
        userStatus: {
            type: DataTypes.ENUM(),
            // values must be array of strings
            values: [
                Employee_1.EmployeeStatus.REGULAR,
                Employee_1.EmployeeStatus.IN_VACATION,
                Employee_1.EmployeeStatus.FIRED,
                Employee_1.EmployeeStatus.RETIRED,
                Employee_1.EmployeeStatus.RESIGNED,
            ],
            defaultValue: Employee_1.EmployeeStatus.REGULAR,
            allowNull: false, // although there is a default value, this default valueensures
            // that the field will not be null when record is inserted for first time,
            // but since we can update the field after insertion and make it null,
            // so that's why we put allowNull: false
        },
        // privilegeGroup: {
        //   type: DataTypes.ENUM(),
        //   values: [
        //     PrivilegeGroup.ADMIN,
        //     PrivilegeGroup.MODERATOR,
        //     PrivilegeGroup.EMPLOYEE,
        //     // PrivilegeGroup.FULL_TIME_EMPLOYEE,
        //     // PrivilegeGroup.PART_TIME_EMPLOYEE,
        //   ],
        //   defaultValue: PrivilegeGroup.EMPLOYEE,
        //   allowNull: false,
        // },
        role: {
            type: DataTypes.ENUM(),
            values: [
                Employee_1.Role.ADMIN,
                Employee_1.Role.MODERATOR,
                Employee_1.Role.EMPLOYEE,
                // PrivilegeGroup.FULL_TIME_EMPLOYEE,
                // PrivilegeGroup.PART_TIME_EMPLOYEE,
            ],
            defaultValue: Employee_1.Role.EMPLOYEE,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'Employee',
        initialAutoIncrement: "1000", //must be string | undefined
    });
    return Employee;
};
