'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Position extends sequelize_1.Model {
        static associate(models) {
            // define association here:
        }
    }
    Position.init({
        id: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            // autoIncrement: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        parentId: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            allowNull: true,
            references: {
                model: Position,
                key: 'id',
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            // `parentPosId` references `id` ?????!! R U sure it is possible?
            // Yes, it is possible to reference a column in the same table,
            // but notice that the `parentPositionId` must be nullable
            // otherwise you can't insert the first record.
        }
    }, {
        sequelize,
        modelName: 'Position',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Position;
};
