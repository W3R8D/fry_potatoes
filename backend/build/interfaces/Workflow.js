"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderTypes = exports.EmployeeAs = exports.FilterByOptions = exports.WorkflowPriority = exports.WorkflowType = void 0;
var WorkflowType;
(function (WorkflowType) {
    WorkflowType["INTERNAL_CORRESPONDENCE"] = "Internal Correspondence";
    WorkflowType["EXTERNAL_CORRESPONDENCE_INCOMING"] = "External Correspondence - Incoming";
    WorkflowType["EXTERNAL_CORRESPONDENCE_OUTGOING"] = "External Correspondence - Outgoing";
    WorkflowType["LETTER"] = "Letter";
    WorkflowType["DECISION"] = "Decision";
    WorkflowType["REPORT"] = "Report";
    WorkflowType["INSTRUCTIONS"] = "Instructions";
    WorkflowType["INVITATION"] = "Invitation";
})(WorkflowType = exports.WorkflowType || (exports.WorkflowType = {}));
var WorkflowPriority;
(function (WorkflowPriority) {
    WorkflowPriority["URGENT"] = "Urgent";
    WorkflowPriority["HIGH"] = "High";
    WorkflowPriority["MEDIUM"] = "Medium";
    WorkflowPriority["LOW"] = "Low";
})(WorkflowPriority = exports.WorkflowPriority || (exports.WorkflowPriority = {}));
var FilterByOptions;
(function (FilterByOptions) {
    FilterByOptions["Keyword"] = "keyword";
    FilterByOptions["Employee"] = "employee";
    FilterByOptions["Date"] = "date";
    FilterByOptions["WorkflowType"] = "workflowType";
    FilterByOptions["WorkflowPriority"] = "workflowPriority";
    FilterByOptions["WorkflowSerial"] = "workflowSerial";
})(FilterByOptions = exports.FilterByOptions || (exports.FilterByOptions = {}));
var EmployeeAs;
(function (EmployeeAs) {
    EmployeeAs["Sender"] = "sender";
    EmployeeAs["Consignee"] = "consignee";
    EmployeeAs["Either"] = "either"; // either consignee (recipient/cc) or sender
})(EmployeeAs = exports.EmployeeAs || (exports.EmployeeAs = {}));
var FolderTypes;
(function (FolderTypes) {
    FolderTypes["All"] = "all";
    FolderTypes["Inbox"] = "inbox";
    FolderTypes["FollowUp"] = "follow-up";
    FolderTypes["Cc"] = "cc";
})(FolderTypes = exports.FolderTypes || (exports.FolderTypes = {}));
