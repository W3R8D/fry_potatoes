'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Employee_Position extends sequelize_1.Model {
        //endDate field is nullable, because when endDate field is null in a record
        //then this record means that this employee is still on his position
        static associate(models) {
            // define association here
            // -------{ASSOC #1: Employee_Position belongs to Employee}-----------
            Employee_Position.belongsTo(models.Employee, { as: "employee", });
            // NOTE: { as: "employee" } will consider the target model name "employee" instead of "Employee"
            // will add field: `employeeId` to the `Employee_Position` model.
            // So, `employeeId` is a FK that references `Employee(`id`)`,
            // -------{ASSOC #2: Employee_Position HAS ONE Account}----------------
            Employee_Position.hasOne(models.Account, {
                foreignKey: {
                    name: 'lastLoginPositionId',
                    allowNull: true, //nullable if this account has never logged in before
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            });
            // ----------------------------{ASSOC #3}----------------------------
            // Employee_Position.belongsTo(models.Position, { as: "position" });
            // NOTE: { as: "position" } will consider the target model name "position" instead of "Positions"
            // ----- {ASSOC #4: Employee_Position HAS MANY Consignee_Group} --------
            Employee_Position.hasMany(models.Consignees_Group, {
                foreignKey: {
                    name: 'ownerId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Employee_Position.hasMany(models.Consignees_Group_Member, {
                foreignKey: {
                    name: 'memberId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            // {ASSOC #5:  Employee_Position belongsToMany Consignees_Group (The Employee_Position can be member in multiple Consignees_Groups)}:
            // Employee_Position.belongsToMany(models.Consignees_Group, {
            //     through: models.Consignees_Group_Member,
            //     uniqueKey: "unique_memberId_groupId",
            //     as: "member",
            // });
        }
    }
    Employee_Position.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        // employeeId: {
        // }
        /*
         employeeId will be generated automatically via association relationship with the model `Employee`
        */
        positionId: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            allowNull: false,
            references: {
                model: 'Positions',
                key: 'id'
            },
            // onDelete: 'SET NULL',
            // onUpdate: 'CASCADE'
        },
        /*
         positionId will be generated automatically via association
         relationship with the model `hierarchy`
        */
        classification: {
            // type: DataTypes.ENUM,
            // values: [
            //     Classifications.RESPONSIBLE,
            //     Classifications.SUBORDINATE,
            //     Classifications.SECRETARY
            // ],
            allowNull: false,
            type: DataTypes.STRING(100),
            references: {
                model: 'Classifications',
                key: 'name'
            },
        },
        jobTitleId: {
            // type: DataTypes.STRING, //default length is VARCHAR(255)
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "JobTitles",
                key: "id"
            },
        },
        startDate: {
            type: DataTypes.DATEONLY,
            // Since DataTypes.DATE will be converted to DATETIME for mysql. 
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            // Since DataTypes.DATE will be converted to DATETIME for mysql. 
            allowNull: true,
            /*
            endDate field is nullable, because when endDate field is null in a record
            then this record means that this employee is still on his position
            */
        }
    }, {
        sequelize,
        modelName: "Employee_Position",
        freezeTableName: true,
        tableName: "Employees_Positions"
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Employee_Position;
};
