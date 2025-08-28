'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class JobTitle extends sequelize_1.Model {
        static associate(models) {
            // define association here:      
            // -------{ASSOC #1: JobTitle HAS ONE Employee_Position }----------------
            // Each Employee_Position record will has a `jobTitleId` field referencing the JobTitle model
            JobTitle.hasOne(models.Employee_Position, {
                foreignKey: {
                    name: 'jobTitleId',
                    // allowNull: false, 
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            });
        }
    }
    JobTitle.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: "jobTitle_index"
        },
    }, {
        sequelize,
        modelName: 'JobTitle',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return JobTitle;
};
