"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaritalStatus = exports.Role = exports.EmployeeStatus = void 0;
var EmployeeStatus;
(function (EmployeeStatus) {
    EmployeeStatus["REGULAR"] = "regular";
    EmployeeStatus["IN_VACATION"] = "in-vacation";
    EmployeeStatus["RETIRED"] = "retired";
    EmployeeStatus["FIRED"] = "fired";
    EmployeeStatus["RESIGNED"] = "resigned";
})(EmployeeStatus = exports.EmployeeStatus || (exports.EmployeeStatus = {}));
// export enum PrivilegeGroup {
//     // FULL_TIME_EMPLOYEE = "full-time-employee",
//     // PART_TIME_EMPLOYEE = "part-time-employee",
//     EMPLOYEE = "employee",
//     ADMIN = "admin",
//     MODERATOR = "moderator",
// }
var Role;
(function (Role) {
    // FULL_TIME_EMPLOYEE = "full-time-employee",
    // PART_TIME_EMPLOYEE = "part-time-employee",
    Role["EMPLOYEE"] = "employee";
    Role["ADMIN"] = "admin";
    Role["MODERATOR"] = "moderator";
})(Role = exports.Role || (exports.Role = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "single";
    MaritalStatus["MARRIED"] = "married";
    MaritalStatus["DIVORCED"] = "divorced";
    MaritalStatus["WIDOWED"] = "widowed";
    MaritalStatus["OTHER"] = "other";
})(MaritalStatus = exports.MaritalStatus || (exports.MaritalStatus = {}));
