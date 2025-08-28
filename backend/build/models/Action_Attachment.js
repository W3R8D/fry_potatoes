'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Action_Attachment extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------------- {#1: Action_Attachment belongs to Action} --------------
            Action_Attachment.belongsTo(models.Action, { as: "action", });
            // NOTE: { as: "action" } will consider the target model name "action" instead 
            // of "Action_Attachment", so it will add field: `actionId` to the `Action_Attachment` model.
            // So, `actionId` is a FK that references `Action`(`id`),
        }
    } // end class
    Action_Attachment.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        fileName: {
            type: DataTypes.STRING,
            //(will be including file extension, for example "myfile.txt")
            allowNull: false,
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            // defaultValue: "UnnamedFile.ext"
        },
        size: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: "Action_Attachment",
        freezeTableName: true,
        tableName: "Actions_Attachments"
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Action_Attachment;
};
