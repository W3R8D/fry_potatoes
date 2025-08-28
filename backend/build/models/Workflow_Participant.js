'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Workflow_Participants_1 = require("../interfaces/Workflow_Participants");
module.exports = (sequelize, DataTypes) => {
    class Workflow_Participant extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------------- {#1: Action belongs to Workflow} --------------
            Workflow_Participant.belongsTo(models.Workflow, { as: "workflow", });
            // NOTE: { as: "workflow" } will consider the target model name "workflow" instead 
            // of "Workflow", so it will add field: `workflowId` to the `WorkflowParticipant` model.
            // So, `workflowId` is a FK that references `Workflow(`id`)`,
            // -------------- {#2: WorkflowParticipant belongs to Action} --------------
            Workflow_Participant.belongsTo(models.Action, { as: "action", });
            // NOTE: { as: "action" } will consider the target model name "action" instead 
            // of "Action", so it will add field: `actionId` to the `Action` model.
            // So, `actionId` is a FK that references `Action(`id`)`,
        }
    } // end class
    Workflow_Participant.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        // empId: {
        //     type: DataTypes.INTEGER(11).UNSIGNED,
        //     allowNull: false,
        //     references: {
        //       model: "Employees",
        //       key: 'id',
        //     },
        // },
        empPositionId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "Employees_Positions",
                key: 'id',
            },
        },
        actionType: {
            type: DataTypes.ENUM,
            values: [
                Workflow_Participants_1.ActionTypes.SENDER,
                Workflow_Participants_1.ActionTypes.RECIPIENT,
                Workflow_Participants_1.ActionTypes.CC,
            ],
            allowNull: false,
            defaultValue: Workflow_Participants_1.ActionTypes.RECIPIENT
        },
        // creationDate: {
        //     type: DataTypes.DATE, // = DATETIME for mysql
        //     // defaultValue: Date.now(),
        //     allowNull: false,
        // },
        isSeen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        isPinned: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Workflow_Participant',
        timestamps: true, //Adds createdAt and updatedAt timestamps to the model. Default true.
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Workflow_Participant; // Workflow Participants Class
};
