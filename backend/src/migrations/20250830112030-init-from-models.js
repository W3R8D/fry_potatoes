'use strict';

/**
 * Aligned with your models (source of truth).
 * Key fixes vs previous version:
 *  - Create Employees_Positions BEFORE any table that references it (Accounts, Consignee tables, Workflow_Participants).
 *  - Break the Channels ↔ Messages circular dependency by adding the
 *    Channels.latestMessageId FOREIGN KEY AFTER Messages is created.
 *  - Ensure table names match models exactly (case-sensitive on many *nix MySQL installs).
 */

module.exports = {
    async up(queryInterface, Sequelize) {
        // 0) Basic lookup tables
        await queryInterface.createTable('Classifications', {
            id: { type: Sequelize.INTEGER(2).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            name: { type: Sequelize.STRING(100), unique: true, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('JobTitles', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            title: { type: Sequelize.STRING, allowNull: false, unique: 'jobTitle_index' },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Permissions', {
            id: { type: Sequelize.INTEGER(4).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false, unique: 'Permission_index' },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        // 1) Org structure
        await queryInterface.createTable('Positions', {
            id: { type: Sequelize.INTEGER(4).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            description: { type: Sequelize.STRING, allowNull: false },
            parentId: {
                type: Sequelize.INTEGER(4).UNSIGNED,
                allowNull: true,
                references: { model: 'Positions', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Positions_JobTitles', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            positionId: {
                type: Sequelize.INTEGER(4).UNSIGNED,
                allowNull: false,
                references: { model: 'Positions', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            jobTitleId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'JobTitles', key: 'id' },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });
        await queryInterface.addConstraint('Positions_JobTitles', {
            fields: ['positionId', 'jobTitleId'],
            type: 'unique',
            name: 'composite_Position_JobTitle_index',
        });

        // 2) Employees + Positions assignment (must exist BEFORE any table that references it)
        await queryInterface.createTable('Employees', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            firstName: { type: Sequelize.STRING(30), allowNull: false },
            middleName: { type: Sequelize.STRING(30), allowNull: true },
            lastName: { type: Sequelize.STRING(30), allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false, unique: true },
            avatar: { type: Sequelize.STRING, allowNull: true },
            phoneNumber: { type: Sequelize.STRING(20), allowNull: false },
            hireDate: { type: Sequelize.DATEONLY, allowNull: false },
            birthDate: { type: Sequelize.DATEONLY, allowNull: false },
            gender: { type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: false },
            maritalStatus: {
                type: Sequelize.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'OTHER'),
                allowNull: false, defaultValue: 'SINGLE'
            },
            city: { type: Sequelize.STRING(255), allowNull: true, defaultValue: 'Tulkarm' },
            userStatus: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'), allowNull: false, defaultValue: 'ACTIVE' },
            role: { type: Sequelize.ENUM('ADMIN', 'MANAGER', 'EMPLOYEE'), allowNull: false, defaultValue: 'EMPLOYEE' },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Employees_Positions', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            employeeId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            positionId: {
                type: Sequelize.INTEGER(4).UNSIGNED,
                allowNull: false,
                references: { model: 'Positions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            classification: {
                type: Sequelize.STRING(100),
                allowNull: false,
                references: { model: 'Classifications', key: 'name' },
                onUpdate: 'CASCADE', onDelete: 'RESTRICT',
            },
            jobTitleId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: true,
                references: { model: 'JobTitles', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            startDate: { type: Sequelize.DATEONLY, allowNull: false },
            endDate: { type: Sequelize.DATEONLY, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        // 3) Now it’s safe to create tables that reference Employees_Positions
        await queryInterface.createTable('Accounts', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            employeeId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            username: { type: Sequelize.STRING, allowNull: false, unique: true },
            password: { type: Sequelize.STRING, allowNull: false },
            lastLoginPositionId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: true,
                references: { model: 'Employees_Positions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            isActivated: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Consignees_Groups', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            name: { type: Sequelize.STRING(50), allowNull: false },
            ownerId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees_Positions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Consignees_Groups_Members', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            memberId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees_Positions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            groupId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Consignees_Groups', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });
        await queryInterface.addConstraint('Consignees_Groups_Members', {
            fields: ['memberId', 'groupId'],
            type: 'unique',
            name: 'unique_memberId_groupId',
        });

        // 4) Channels first (without FK to Messages yet)
        await queryInterface.createTable('Channels', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            name: { type: Sequelize.STRING, allowNull: false },
            isGroup: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            // Will add FK to Messages later (circular break)
            latestMessageId: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        // 5) Messages (now Channels exists)
        await queryInterface.createTable('Messages', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            channelId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Channels', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            senderId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            content: { type: Sequelize.TEXT, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        // 5b) NOW add the FK on Channels.latestMessageId -> Messages.id
        await queryInterface.addConstraint('Channels', {
            fields: ['latestMessageId'],
            type: 'foreign key',
            name: 'fk_channels_latestMessageId_messages_id',
            references: { table: 'Messages', field: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
        });

        // 6) Channel membership (Messages already exists, so lastSeenMessageId FK is fine)
        await queryInterface.createTable('Channels_Members', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            channelId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Channels', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            memberId: {
                // Your current model points to Employees; switch to Employees_Positions if you decide later.
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            isAdmin: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            lastSeenMessageId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: true,
                references: { model: 'Messages', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'SET NULL',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        // 7) Employees_Permissions (simple join)
        await queryInterface.createTable('Employees_Permissions', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            permissionId: {
                type: Sequelize.INTEGER(4).UNSIGNED,
                allowNull: false,
                references: { model: 'Permissions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            employeeId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });
        await queryInterface.addConstraint('Employees_Permissions', {
            fields: ['employeeId', 'permissionId'],
            type: 'unique',
            name: 'composite_Employee_Permission_index',
        });

        // 8) Workflows / Actions / Attachments / Participants
        await queryInterface.createTable('Workflows', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            subject: { type: Sequelize.STRING, allowNull: false },
            workflowType: { type: Sequelize.ENUM('INTERNAL', 'EXTERNAL', 'OTHER'), allowNull: false },
            priority: { type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'), allowNull: false, defaultValue: 'LOW' },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Actions', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            workflowId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Workflows', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            content: { type: Sequelize.TEXT, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            // (model has timestamps false → omit updatedAt)
        });

        await queryInterface.createTable('Action_Attachments', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            actionId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Actions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            fileName: { type: Sequelize.STRING, allowNull: false },
            fileType: { type: Sequelize.STRING, allowNull: false },
            description: { type: Sequelize.STRING, allowNull: true },
            size: { type: Sequelize.INTEGER(11).UNSIGNED, allowNull: true },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });

        await queryInterface.createTable('Workflow_Participants', {
            id: { type: Sequelize.INTEGER(11).UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true },
            workflowId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Workflows', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            actionId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Actions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            empPositionId: {
                type: Sequelize.INTEGER(11).UNSIGNED,
                allowNull: false,
                references: { model: 'Employees_Positions', key: 'id' },
                onUpdate: 'CASCADE', onDelete: 'CASCADE',
            },
            actionType: { type: Sequelize.ENUM('SENDER', 'RECIPIENT', 'CC'), allowNull: false, defaultValue: 'RECIPIENT' },
            isSeen: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            isPinned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            isArchived: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
            updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
        });
        await queryInterface.addConstraint('Workflow_Participants', {
            fields: ['workflowId', 'actionId', 'empPositionId', 'actionType'],
            type: 'unique',
            name: 'uq_workflow_participant_role',
        });
    },

    async down(queryInterface) {
        // reverse dependency order
        await queryInterface.dropTable('Workflow_Participants');
        await queryInterface.dropTable('Action_Attachments');
        await queryInterface.dropTable('Actions');
        await queryInterface.dropTable('Workflows');

        await queryInterface.dropTable('Channels_Members');

        // Remove Channels.latestMessageId FK before dropping Messages/Channels
        try {
            await queryInterface.removeConstraint('Channels', 'fk_channels_latestMessageId_messages_id');
        } catch (e) { /* ignore if not present */ }

        await queryInterface.dropTable('Messages');
        await queryInterface.dropTable('Channels');

        await queryInterface.dropTable('Consignees_Groups_Members');
        await queryInterface.dropTable('Consignees_Groups');

        await queryInterface.dropTable('Employees_Permissions');
        await queryInterface.dropTable('Accounts');
        await queryInterface.dropTable('Employees_Positions');

        await queryInterface.dropTable('Positions_JobTitles');
        await queryInterface.dropTable('Positions');

        await queryInterface.dropTable('Permissions');
        await queryInterface.dropTable('JobTitles');
        await queryInterface.dropTable('Classifications');
    }
};
