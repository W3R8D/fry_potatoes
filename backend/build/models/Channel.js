'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Channel extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------{#1: Workflow HAS MANY Actions} -------
            Channel.hasMany(models.Message, {
                foreignKey: {
                    name: 'channelId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
            Channel.hasMany(models.Channel_Member, {
                foreignKey: {
                    name: 'channelId',
                    allowNull: false,
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            });
        }
    }
    Channel.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(25),
            allowNull: false,
            // unique: true, 
        },
        isGroup: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        // adminId: {
        //     type: DataTypes.INTEGER(11).UNSIGNED,
        //     allowNull: true,
        //     defaultValue: null,
        // },
        latestMessageId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
            defaultValue: null,
        }
    }, {
        sequelize,
        modelName: 'Channel',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Channel;
};
