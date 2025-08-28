'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Channel_Member extends sequelize_1.Model {
        static associate(models) {
            // define association here:
            // define association here:
            Channel_Member.belongsTo(models.Channel, {
                as: "channel", onDelete: "CASCADE", onUpdate: "CASCADE"
            });
            Channel_Member.belongsTo(models.Employee, {
                as: "member", onDelete: "CASCADE", onUpdate: "CASCADE"
            });
            Channel_Member.belongsTo(models.Message, {
                as: "lastSeenMessage", onDelete: "SET NULL", onUpdate: "CASCADE"
            });
        }
    } // end class
    Channel_Member.init({
        id: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
        },
        lastSeenMessageId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
            // references: {
            // }
        }
    }, {
        sequelize,
        modelName: "Channel_Member",
        freezeTableName: true,
        tableName: "Channels_Members",
        timestamps: true, //Adds createdAt and updatedAt timestamps to the model. Default true.
        // initialAutoIncrement: "1000", //must be string | undefined
    });
    return Channel_Member; // Workflow Participants Class
};
