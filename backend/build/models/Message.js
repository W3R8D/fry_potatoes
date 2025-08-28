'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Message extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // -------------- {#1: Message belongs to Channel} --------------
            Message.belongsTo(models.Channel, { as: "channel", });
            // NOTE: { as: "channel" } will consider the target model name "channel" instead 
            // of "Channel", so it will add field: `channelId` to the `Message` model.
            // So, `channelId` is a FK that references `Channel(`id`)`,
            // Message.belongsTo(models.Employee_Position, { as: "sender" });
            Message.belongsTo(models.Employee, { as: "sender" });
            // Message.hasMany(models.Message_Member, {
            //     foreignKey: {
            //         name: 'messageId',
            //         allowNull: false,
            //     },
            //     onDelete: 'CASCADE',
            //     onUpdate: 'CASCADE',
            // });
            Message.hasOne(models.Channel_Member, {
                foreignKey: {
                    name: 'lastSeenMessageId',
                    allowNull: true,
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            });
        }
    }
    Message.init({
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
    }, {
        sequelize,
        modelName: 'Message',
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Message;
};
