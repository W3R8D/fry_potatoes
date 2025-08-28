'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Position_JobTitle extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------{ASSOC #1: }-----------    
            // const { Position, JobTitle } = models; //destructure the `models` object
            // Position.belongsToMany(JobTitle, { through: Position_JobTitle, });
            // JobTitle.belongsToMany(Position, { through: Position_JobTitle });
            /*
            for {through: } option, instead of a string, we are passing the models directly.
            So, the Position_JobTitle model will be created as the junction table that shows
            the Many-to-Many relationship between the `Position` and the `JobTitle` models.
            */
            // PRIMARY KEY will be ("positionId", "jobTitleId")
        }
    }
    Position_JobTitle.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        positionId: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            allowNull: false,
            references: {
                model: "Positions",
                key: "id"
            },
            // onDelete: "SET NULL",
            // onUpdate: "CASCADE",
            // primaryKey: true,
            unique: "composite_Position_JobTitle_index"
            // Creating two objects with the same value will throw an error. The unique property can be either a
            // boolean, or a string. If you provide the same string for multiple columns, they will form a
            // composite unique key.
            // visit: https://sequelize.org/master/manual/model-basics.html#column-options
        },
        jobTitleId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            references: {
                model: "JobTitles",
                key: "id"
            },
            // onDelete: "SET NULL",
            // onUpdate: "CASCADE",
            // primaryKey: true,
            unique: "composite_Position_JobTitle_index"
            // Creating two objects with the same value will throw an error. The unique property can be either a
            // boolean, or a string. If you provide the same string for multiple columns, they will form a
            // composite unique key.
        },
    }, {
        sequelize,
        modelName: 'Position_JobTitle',
        freezeTableName: true,
        tableName: "Positions_JobTitles"
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Position_JobTitle;
};
