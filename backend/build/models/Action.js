'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Action extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------------- {#1: Action belongs to Workflow} --------------
            Action.belongsTo(models.Workflow, { as: "workflow", });
            // NOTE: { as: "workflow" } will consider the target model name "workflow" instead 
            // of "Workflow", so it will add field: `workflowId` to the `Action` model.
            // So, `workflowId` is a FK that references `Workflow(`id`)`,
            // -------------- {#2: Action HAS MANY Workflow_Participants} --------------
            Action.hasMany(models.Workflow_Participant, {
                foreignKey: {
                    name: 'actionId',
                    allowNull: false,
                },
                // onDelete: 'SET NULL',
                // onUpdate: 'CASCADE',
            });
            // -------------- {#3: Action HAS MANY Attachments} --------------
            Action.hasMany(models.Action_Attachment, {
                foreignKey: {
                    name: 'actionId',
                    allowNull: false,
                },
                //   onDelete: 'SET NULL',
                //   onUpdate: 'CASCADE',
            });
        }
    } // end class
    Action.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Action',
        timestamps: false, //Adds createdAt and updatedAt timestamps to the model. Default true.
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Action;
};
