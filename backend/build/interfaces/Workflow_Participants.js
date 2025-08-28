"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsigneeTypes = exports.ActionTypes = void 0;
var ActionTypes;
(function (ActionTypes) {
    ActionTypes["SENDER"] = "SENDER";
    ActionTypes["RECIPIENT"] = "RECIPIENT";
    ActionTypes["CC"] = "CC";
})(ActionTypes = exports.ActionTypes || (exports.ActionTypes = {}));
var ConsigneeTypes;
(function (ConsigneeTypes) {
    ConsigneeTypes["DIRECT_RESPONSIBLE"] = "DIRECT RESPONSIBLE";
    ConsigneeTypes["COLLEAGUE"] = "COLLEAGUES";
    ConsigneeTypes["STAFF"] = "STAFF";
    ConsigneeTypes["CUSTOM_GROUP"] = "MY GROUPS";
    ConsigneeTypes["WORKFLOW_PARTICIPANT"] = "WORKFLOW PARTICIPANT";
})(ConsigneeTypes = exports.ConsigneeTypes || (exports.ConsigneeTypes = {}));
