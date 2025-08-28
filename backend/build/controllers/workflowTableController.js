"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBy = exports.moveToOrFromArchive = exports.toggleRecordPin = exports.populateTable = void 0;
// ----------------- Regarding Database -----------------------
const sequelize_1 = __importDefault(require("sequelize"));
const models_1 = __importDefault(require("../models")); // our database connection object
// ----------- Types & Interfaces --------------------
const Workflow_Participants_1 = require("../interfaces/Workflow_Participants");
const Workflow_1 = require("../interfaces/Workflow");
// ------------------- Done Importing -------------------------------
const { models } = models_1.default.sequelize; // returns object with all our models.
const sequelize_2 = require("sequelize");
const populateTable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filterBy, folder, isArchived } = req.query;
    console.log("*** isArchived: ", isArchived);
    if (filterBy && filterBy !== "") {
        console.log("----------- WILL CALL searchBy() -----------");
        return (0, exports.searchBy)(req, res, next);
    }
    // const { employeePositionId } = req.user; //from the middleware function 
    const employeePositionId = req.header("employeeCurrentPositionId");
    let page = Number(req.query.page);
    let rowsPerPage = Number(req.query.rowsPerPage);
    let wantedActionType = "";
    // ------------------------- Search By Folder -------------------------
    let wantedFolders = [];
    if (!folder) {
        wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
    }
    else {
        switch (folder === null || folder === void 0 ? void 0 : folder.toString().toLowerCase()) {
            case Workflow_1.FolderTypes.All:
                wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
                break;
            case Workflow_1.FolderTypes.Inbox:
                wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT];
                break;
            case Workflow_1.FolderTypes.FollowUp:
                wantedFolders = [Workflow_Participants_1.ActionTypes.SENDER];
                break;
            case Workflow_1.FolderTypes.Cc:
                wantedFolders = [Workflow_Participants_1.ActionTypes.CC];
                break;
            default:
                wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
        }
    }
    let workflowsList;
    let allMatchedWorkflowsCount;
    // console.log("PAGE: ", page);
    // console.log("ROWS_PER_PAGE: ", rowsPerPage);
    if (!page) {
        page = 0;
    }
    if (!rowsPerPage) {
        rowsPerPage = 20;
    }
    console.log("-------------------------------");
    console.log("PAGE: ", page);
    console.log("ROWS_PER_PAGE: ", rowsPerPage);
    console.log("FOLDER: ", folder);
    console.log("Wanted Folders: ", wantedFolders);
    // console.log("wantedActionType: ", wantedActionType);
    console.log("-------------------------------");
    try {
        // const getInbox1 = `SELECT * FROM workflows as W JOIN workflow_participants as P on W.id = P.workflowId 
        //                    WHERE P.actionType = "RECIPIENT" AND P.empPositionId = ${employeePositionId}
        //                    ORDER BY P.createdAt DESC`;
        // const inbox1 = await db.sequelize.query(getInbox1, {
        //     type: QueryTypes.SELECT,
        //     logging: console.log,
        // });
        let whereConditions = {
            empPositionId: employeePositionId,
            actionType: { [sequelize_2.Op.in]: wantedFolders },
        };
        if (isArchived) {
            // then the requested page is the ARCHIVE
            whereConditions = Object.assign(Object.assign({}, whereConditions), { isArchived: true });
        }
        let objResultAndCount = yield models.Workflow.findAndCountAll({
            include: [{
                    model: models.Workflow_Participant,
                    // as: 'Workflow_Participants',
                    required: true,
                    where: whereConditions,
                    attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                }],
            order: [
                [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
            ],
            attributes: ["id", "subject", "workflowType", "priority"],
            raw: true,
            limit: rowsPerPage,
            offset: page * rowsPerPage,
            subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
        });
        // I used method `findAndCountAll` because it's usually preferred when dealing with queries related to pagination where you want to retrieve data with a limit and offset but also need to know the total number of records that match the query.
        // It returns an object with two properties:
        /*
            count: an integer - the total number records matching the query
            rows: an array of objects - the obtained records
        */
        workflowsList = objResultAndCount.rows;
        allMatchedWorkflowsCount = objResultAndCount.count;
        // read more about `findAndCountAll`: https://sequelize.org/docs/v6/core-concepts/model-querying-finders/#findandcountall
        // I really need to change the name of the `workflow_participants` columns,
        // ex: instead of the long name: `WorkflowParticipants.isSeen`, transform it to `isSeen`:
        // I tried to do that using sequelize { model: , as: } but didn't allow me 🤯
        // --- The following loop will change the keys names in the objects of `workflowsList`:
        workflowsList.forEach((o) => {
            delete Object.assign(o, { ["empPositionId"]: o["Workflow_Participants.empPositionId"] })["Workflow_Participants.empPositionId"];
            delete Object.assign(o, { ["isSeen"]: o["Workflow_Participants.isSeen"] })["Workflow_Participants.isSeen"];
            delete Object.assign(o, { ["isPinned"]: o["Workflow_Participants.isPinned"] })["Workflow_Participants.isPinned"];
            delete Object.assign(o, { ["createdAt"]: o["Workflow_Participants.createdAt"] })["Workflow_Participants.createdAt"];
            delete Object.assign(o, { ["actionId"]: o["Workflow_Participants.actionId"] })["Workflow_Participants.actionId"];
        });
        // ------------ Adding some information to the workflowsList: ------------
        // such as: sender's name, and count of attachment on each action:
        for (let a = 0; a < workflowsList.length; a++) {
            const workflow = workflowsList[a];
            let senderEmpPositionId;
            if (folder === Workflow_1.FolderTypes.FollowUp) {
                // no need to make queries to get info about the action sender,
                // because simply you are the sender of all actions in the follow-up table
                senderEmpPositionId = workflow.empPositionId;
            }
            else {
                // ---- I need the empPositionId of the sender of each action: ----
                const senderWParticipantRecord = yield models.Workflow_Participant.findOne({
                    where: { actionId: workflow.actionId, actionType: Workflow_Participants_1.ActionTypes.SENDER },
                });
                // -----
                senderEmpPositionId = senderWParticipantRecord.empPositionId;
            }
            workflow.senderEmpPositionId = senderEmpPositionId;
            // -----
            const senderEmployeePositionRecord = yield models.Employee_Position.findByPk(senderEmpPositionId);
            const senderEmployeeId = senderEmployeePositionRecord.employeeId;
            const { positionId, jobTitleId } = senderEmployeePositionRecord;
            workflow.senderEmployeeId = senderEmployeeId;
            // -----
            const senderPositionRecord = yield models.Position.findByPk(positionId);
            workflow.senderPosition = senderPositionRecord.description;
            // -----
            const senderJobTitleRecord = yield models.JobTitle.findByPk(jobTitleId);
            workflow.senderJobTitle = senderJobTitleRecord.title;
            // -----
            const senderEmployeeRecord = yield models.Employee.findByPk(senderEmployeeId);
            const { firstName, middleName, lastName, avatar } = senderEmployeeRecord;
            workflow.senderFullName = `${firstName} ${middleName.charAt(0)}. ${lastName}`;
            if (avatar) {
                workflow.senderAvatar = avatar;
            }
            // else {
            //     workflow.senderAvatar = "https://images.pexels.com/photos/6386956/pexels-photo-6386956.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
            // }
            const attachments = yield models.Action_Attachment.findOne({
                where: { actionId: workflow.actionId },
                attributes: [[sequelize_1.default.fn('count', sequelize_1.default.col('actionId')), 'count']],
                raw: true,
            });
            console.log(attachments);
            workflow.attachmentsCount = attachments.count;
            // -----
        } // end for loop
        res.json({ workflowsList, myEmpPositionId: employeePositionId, allMatchedWorkflowsCount });
    }
    catch (error) {
        next(error);
    }
});
exports.populateTable = populateTable;
const toggleRecordPin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { actionId, empPositionId } = req.body;
        const clickedRecord = yield models.Workflow_Participant.findOne({
            where: { actionId, empPositionId }
        });
        if (clickedRecord) {
            // then the record is found, update its pin status:
            const isCurrentlyPinned = clickedRecord.isPinned;
            yield clickedRecord.update({ isPinned: !isCurrentlyPinned });
            return res.json({
                message: `${isCurrentlyPinned ? `unpinned` : `pinned`} successfully`,
                type: "success",
                actionId,
                empPositionId,
                clickedRecordUpdated: clickedRecord,
            });
        }
        return res.json({
            message: `record not found`,
            type: "error",
            actionId,
            empPositionId,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.toggleRecordPin = toggleRecordPin;
const moveToOrFromArchive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { actionsIds, empPositionId } = req.body;
        let { isMoveTo } = req.query;
        yield models.Workflow_Participant.update({
            isArchived: isMoveTo == "true" ? true : false
        }, {
            where: {
                actionId: { [sequelize_2.Op.in]: actionsIds },
                empPositionId: req.user.employeePositionId
            }
        });
        res.json({
            message: `${isMoveTo == "true" ? `moved to archive` : `removed from archive`}`,
            type: "success",
            actionsIds: actionsIds,
            empPositionId,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.moveToOrFromArchive = moveToOrFromArchive;
const searchBy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    /*
        0. Folder [Inbox, CC, Follow-Up, or All] ✅ (wantedFolders)
        1. Keyword
        2. Workflow's Serial
        3. Workflow's Type
        4. Workflow's Priority
        5. Employee (Sender, Consignee, or Either) ✅ (wantedActionsIds)
        6. Date From and/or To
    */
    try {
        // const { employeePositionId } = req.user; //from the middleware function 
        const employeePositionId = req.header("employeeCurrentPositionId");
        let page = Number(req.query.page);
        let rowsPerPage = Number(req.query.rowsPerPage);
        if (!page) {
            page = 0;
        }
        if (!rowsPerPage) {
            rowsPerPage = 20;
        }
        let workflowsList = [];
        let allMatchedWorkflowsCount = 0;
        const { filterBy, folder } = req.query;
        console.log("--------- FILTER BY ----------:  ", filterBy);
        console.log("😈😈😈😈 Folder: ", folder);
        // ------------------------- Search By Folder -------------------------
        let wantedFolders = [];
        if (!folder) {
            wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
        }
        else {
            switch (folder === null || folder === void 0 ? void 0 : folder.toString().toLowerCase()) {
                case Workflow_1.FolderTypes.All:
                    wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
                    break;
                case Workflow_1.FolderTypes.Inbox:
                    wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT];
                    break;
                case Workflow_1.FolderTypes.FollowUp:
                    wantedFolders = [Workflow_Participants_1.ActionTypes.SENDER];
                    break;
                case Workflow_1.FolderTypes.Cc:
                    wantedFolders = [Workflow_Participants_1.ActionTypes.CC];
                    break;
                default:
                    wantedFolders = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC, Workflow_Participants_1.ActionTypes.SENDER];
            }
        }
        console.log("_______ wantedFolders: ______ ", wantedFolders);
        // ---------------------------------------------------------------------
        let objResultAndCount = { rows: [], count: -1 };
        switch (filterBy) {
            // ------------------------- Search By Keyword -------------------------
            case Workflow_1.FilterByOptions.Keyword:
                let { keyword } = req.query;
                console.log("ENTERED KEYWORD: ", keyword);
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                empPositionId: employeePositionId,
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"],
                        }],
                    where: {
                        subject: { [sequelize_2.Op.like]: `%${keyword}%` }
                    },
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
            // ------------------------- Search By Employee -------------------------
            case Workflow_1.FilterByOptions.Employee:
                let allowedActionTypes = [];
                let { employeeAs, wantedEmpPosId } = req.query;
                console.log("employeeAs: ", employeeAs);
                console.log("wantedEmpPosId: ", wantedEmpPosId);
                if (!employeeAs) {
                    employeeAs = Workflow_1.EmployeeAs.Either;
                }
                switch (employeeAs) {
                    case Workflow_1.EmployeeAs.Sender:
                        allowedActionTypes = [Workflow_Participants_1.ActionTypes.SENDER];
                        break;
                    case Workflow_1.EmployeeAs.Consignee:
                        allowedActionTypes = [Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC];
                        break;
                    case Workflow_1.EmployeeAs.Either:
                        allowedActionTypes = [Workflow_Participants_1.ActionTypes.SENDER, Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC];
                        break;
                    default:
                        allowedActionTypes = [Workflow_Participants_1.ActionTypes.SENDER, Workflow_Participants_1.ActionTypes.RECIPIENT, Workflow_Participants_1.ActionTypes.CC];
                }
                const allActionsRegardingTheWantedEmployee = yield models.Workflow_Participant.findAll({
                    where: {
                        empPositionId: wantedEmpPosId,
                        actionType: { [sequelize_2.Op.in]: allowedActionTypes }
                    }
                });
                const wantedActionsIds = allActionsRegardingTheWantedEmployee.map((elem) => elem.actionId);
                console.log("wantedActionsIds: ", wantedActionsIds);
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                // actionType: ActionTypes.RECIPIENT,
                                empPositionId: employeePositionId,
                                actionId: { [sequelize_2.Op.in]: wantedActionsIds },
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                        }],
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
            // ------------------------- Search By Date -------------------------
            case Workflow_1.FilterByOptions.Date:
                let { fromDate, toDate } = req.query;
                if (!fromDate || fromDate === "") {
                    fromDate = "1970-01-01";
                }
                else {
                    fromDate = new Date(fromDate.toString()).toISOString().split("T")[0];
                }
                if (!toDate || toDate === "") {
                    toDate = new Date().toISOString().split("T")[0];
                    // ISOString is always in this format: YYYY-MM-DD
                    // ex: 2022-04-21
                }
                else {
                    toDate = new Date(toDate.toString()).toISOString().split("T")[0];
                }
                console.log("------ FromDate: ", fromDate);
                console.log("------ toDate: ", toDate);
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                empPositionId: employeePositionId,
                                [sequelize_2.Op.and]: [
                                    sequelize_1.default.where(sequelize_1.default.fn('date', sequelize_1.default.col('Workflow_Participants.createdAt')), '>=', fromDate),
                                    sequelize_1.default.where(sequelize_1.default.fn('date', sequelize_1.default.col('Workflow_Participants.createdAt')), '<=', toDate),
                                ]
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                        }],
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
            // ------------------------- Search By Workflow's Type -------------------------
            case Workflow_1.FilterByOptions.WorkflowType:
                let { workflowType } = req.query;
                if (!workflowType || workflowType === "") {
                    workflowType = Workflow_1.WorkflowType.INTERNAL_CORRESPONDENCE;
                }
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                empPositionId: employeePositionId,
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                        }],
                    where: {
                        workflowType,
                    },
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
            // ------------------------- Search By Workflow's Priority -------------------------
            case Workflow_1.FilterByOptions.WorkflowPriority:
                let { priority } = req.query;
                console.log("-----------------priority: ", priority);
                if (!priority || priority === "") {
                    priority = Workflow_1.WorkflowPriority.MEDIUM;
                }
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                empPositionId: employeePositionId,
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                        }],
                    where: { priority },
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
            // ------------------------- Search By Workflow's Serial -------------------------
            case Workflow_1.FilterByOptions.WorkflowSerial:
                let { workflowSerial } = req.query;
                objResultAndCount = yield models.Workflow.findAndCountAll({
                    include: [{
                            model: models.Workflow_Participant,
                            // as: 'Workflow_Participants',
                            required: true,
                            where: {
                                actionType: { [sequelize_2.Op.in]: wantedFolders },
                                empPositionId: employeePositionId,
                            },
                            attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"]
                        }],
                    where: { id: workflowSerial },
                    order: [
                        [sequelize_1.default.col('Workflow_Participants.isPinned'), "DESC"],
                        [sequelize_1.default.col('Workflow_Participants.createdAt'), "DESC"],
                    ],
                    attributes: ["id", "subject", "workflowType", "priority"],
                    raw: true,
                    limit: rowsPerPage,
                    offset: page * rowsPerPage,
                    subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
                });
                break;
        } //end switch
        workflowsList = objResultAndCount.rows;
        allMatchedWorkflowsCount = objResultAndCount.count;
        // I really need to change the name of the `workflow_participants` columns,
        // ex: instead of the long name: `WorkflowParticipants.isSeen`, transform it to `isSeen`:
        // I tried to do that using sequelize { model: , as: } but didn't allow me 🤯
        // --- The following loop will change the keys names in the objects of `workflowsList`:
        workflowsList.forEach((o) => {
            delete Object.assign(o, { ["empPositionId"]: o["Workflow_Participants.empPositionId"] })["Workflow_Participants.empPositionId"];
            delete Object.assign(o, { ["isSeen"]: o["Workflow_Participants.isSeen"] })["Workflow_Participants.isSeen"];
            delete Object.assign(o, { ["isPinned"]: o["Workflow_Participants.isPinned"] })["Workflow_Participants.isPinned"];
            delete Object.assign(o, { ["createdAt"]: o["Workflow_Participants.createdAt"] })["Workflow_Participants.createdAt"];
            delete Object.assign(o, { ["actionId"]: o["Workflow_Participants.actionId"] })["Workflow_Participants.actionId"];
        });
        // ------------ Adding some information to the workflowsList: ------------
        // such as: sender's name, and count of attachment on each action:
        for (let a = 0; a < workflowsList.length; a++) {
            const workflow = workflowsList[a];
            // ---- I need the empPositionId of the sender of each action: ----
            const senderWParticipantRecord = yield models.Workflow_Participant.findOne({
                where: { actionId: workflow.actionId, actionType: Workflow_Participants_1.ActionTypes.SENDER },
            });
            // -----
            const senderEmpPositionId = senderWParticipantRecord.empPositionId;
            workflow.senderEmpPositionId = senderEmpPositionId;
            // -----
            const senderEmployeePositionRecord = yield models.Employee_Position.findByPk(senderEmpPositionId);
            const senderEmployeeId = senderEmployeePositionRecord.employeeId;
            const { positionId, jobTitleId } = senderEmployeePositionRecord;
            workflow.senderEmployeeId = senderEmployeeId;
            // -----
            const senderPositionRecord = yield models.Position.findByPk(positionId);
            workflow.senderPosition = senderPositionRecord.description;
            // -----
            const senderJobTitleRecord = yield models.JobTitle.findByPk(jobTitleId);
            workflow.senderJobTitle = senderJobTitleRecord.title;
            // -----
            const senderEmployeeRecord = yield models.Employee.findByPk(senderEmployeeId);
            const { firstName, middleName, lastName, avatar } = senderEmployeeRecord;
            workflow.senderFullName = `${firstName} ${middleName}. ${lastName}`;
            if (avatar) {
                workflow.senderAvatar = avatar;
            }
            // else {
            //     workflow.senderAvatar = "https://images.pexels.com/photos/6386956/pexels-photo-6386956.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
            // }
            const attachments = yield models.Action_Attachment.findOne({
                where: { actionId: workflow.actionId },
                attributes: [[sequelize_1.default.fn('count', sequelize_1.default.col('actionId')), 'count']],
                raw: true,
            });
            console.log(attachments);
            workflow.attachmentsCount = attachments.count;
            // -----
        } // end for loop
        res.json({
            workflowsList, myEmpPositionId: employeePositionId, allMatchedWorkflowsCount
        });
    }
    catch (error) {
        next(error);
    }
});
exports.searchBy = searchBy;
// export const multiJoin = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { employeePositionId } = req.user; //from the middleware function
//         let page: number = Number(req.query.page);
//         let rowsPerPage: number = Number(req.query.rowsPerPage);
//         if (!page) { page = 0 }
//         if (!rowsPerPage) { rowsPerPage = 20; }
//         let workflowsList: Array<any> = [];
//         let allMatchedWorkflowsCount: number = 0;
//         type resultSetType = {
//             rows: Array<any>;
//             count: number;
//         }
//         const objResultAndCount = await models.Workflow.findAndCountAll({
//             include: [{
//                 model: models.Workflow_Participant,
//                 // as: 'Workflow_Participants',
//                 required: true, //will make it INNER JOIN instead of LEFT OUTER
//                 where: {
//                     actionType: "RECIPIENT",
//                     empPositionId: employeePositionId,
//                 },
//                 attributes: ["empPositionId", "isSeen", "isPinned", "createdAt", "actionId"],
//                 include: [{
//                     model: models.Employee_Position,
//                     required: true,
//                     attributes: ["empPositionId"]
//                     // association: new Sequelize.HasOne(models.Workflow_Participant, models.Employee_Position, {})
//                 }]
//             }],
//             order: [
//                 [Sequelize.col('Workflow_Participants.isPinned'), "DESC"],
//                 [Sequelize.col('Workflow_Participants.createdAt'), "DESC"],
//             ],
//             attributes: ["id", "subject", "workflowType", "priority"],
//             raw: true, //this will make the result not nested 😁
//             limit: rowsPerPage,
//             offset: page * rowsPerPage,
//             subQuery: false, //visit: https://localcoder.org/sequelize-limit-and-offset-incorrect-placement-in-query
//         });
//         const rows = objResultAndCount.rows;
//         const count = objResultAndCount.count;
//         return res.json({
//             rows, count
//         });
//     }
//     catch (error) {
//         next(error);
//     }
// }
