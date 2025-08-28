'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Workflow_1 = require("../interfaces/Workflow");
const Workflow_2 = require("../interfaces/Workflow");
module.exports = (sequelize, DataTypes) => {
    class Workflow extends sequelize_1.Model {
        // creationDate!: wAttr["creationDate"];
        // updateDate!: wAttr["updateDate"];
        static associate(models) {
            // define association here:
            // -------{#1: Workflow HAS MANY Actions} -------
            Workflow.hasMany(models.Action, {
                foreignKey: {
                    name: 'workflowId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            // -------{#2: Workflow HAS MANY Workflow_Participants} -------
            Workflow.hasMany(models.Workflow_Participant, {
                foreignKey: {
                    name: 'workflowId',
                    allowNull: false,
                },
                // onDelete: 'SET NULL',
                // onUpdate: 'CASCADE',
            });
        }
    } // end class
    Workflow.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        workflowType: {
            type: DataTypes.ENUM,
            values: [
                Workflow_2.WorkflowType.INTERNAL_CORRESPONDENCE,
                Workflow_2.WorkflowType.EXTERNAL_CORRESPONDENCE_INCOMING,
                Workflow_2.WorkflowType.EXTERNAL_CORRESPONDENCE_OUTGOING,
                Workflow_2.WorkflowType.LETTER,
                Workflow_2.WorkflowType.DECISION,
                Workflow_2.WorkflowType.REPORT,
                Workflow_2.WorkflowType.INSTRUCTIONS,
                Workflow_2.WorkflowType.INVITATION,
            ],
            defaultValue: Workflow_2.WorkflowType.INTERNAL_CORRESPONDENCE,
            allowNull: false,
        },
        priority: {
            type: DataTypes.ENUM,
            values: [
                Workflow_1.WorkflowPriority.URGENT,
                Workflow_1.WorkflowPriority.HIGH,
                Workflow_1.WorkflowPriority.MEDIUM,
                Workflow_1.WorkflowPriority.LOW,
            ],
            defaultValue: Workflow_1.WorkflowPriority.MEDIUM,
            allowNull: false,
        },
        // creationDate: {
        //     type: DataTypes.DATE, // DATETIME for mysql
        //     // defaultValue: Date.now(),
        //     allowNull: false,
        // },
        // updateDate: {
        //     type: DataTypes.DATE, // DATETIME for mysql
        //     // defaultValue: Date.now(),
        //     allowNull: false,
        // }
    }, {
        sequelize,
        modelName: 'Workflow',
    });
    return Workflow;
};
