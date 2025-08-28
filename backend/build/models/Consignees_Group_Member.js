'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Consignees_Group_Member extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            Consignees_Group_Member.belongsTo(models.Consignees_Group, {
                as: "group", onDelete: "CASCADE", onUpdate: "CASCADE"
            });
            Consignees_Group_Member.belongsTo(models.Employee_Position, {
                as: "member", onDelete: "CASCADE", onUpdate: "CASCADE"
            });
        }
    }
    Consignees_Group_Member.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        memberId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "Employees_Positions",
                key: 'id', //references Employee_Position(id)
            },
            unique: "unique_memberId_groupId"
        },
        groupId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "Consignees_Groups",
                key: 'id', //references Consignees_Group(id)
            },
            unique: "unique_memberId_groupId"
        }
    }, {
        sequelize,
        modelName: "Consignees_Group_Member",
        freezeTableName: true,
        tableName: "Consignees_Groups_Members"
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Consignees_Group_Member;
};
