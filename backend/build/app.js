"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); //Cross-Origin Resourse Sharing
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser")); //for parsing req.body json data
const connect_busboy_1 = __importDefault(require("connect-busboy"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); //for parisng the cookie string
require("dotenv/config");
// ======== My defined Error Handlers Middleware Functions: ====================
const errorHandlers_1 = require("./middlewares/errorHandlers");
const colors_1 = __importDefault(require("colors")); //for coloring the console (terminal)
const attachment_1 = __importDefault(require("./config/attachment"));
// ------------------------- Socket.io -------------------------
// import io from "socket.io"; 
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
// Parsing Requests 
const port = process.env.PORT || 5000;
// ---------------- Regarding FileUpload: --------------------------
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path_1 = __importDefault(require("path"));
// FileUpload package acts as a middleware inside ypu application, and parses the files inside req.files
app.use((0, express_fileupload_1.default)({
    useTempFiles: true,
    tempFileDir: path_1.default.join(__dirname, "../", "tmp"),
    createParentPath: true,
    limits: { fileSize: attachment_1.default.MAX_UPLOAD_SIZE },
    // abortOnLimit: false, //Returns a HTTP 413 when the file is bigger than the size limit if true. Otherwise, it will add a truncated = true to the resulting file structure. (default is false)
    // responseOnLimit: `File size limit (${maxFileSize}) has been reached.`,
    // limitHandler: function(req, res, next) {
    //     res.json({
    //         message: `File size limit (${maxFileSize}) has been reached.`,
    //         status: 413,
    //     });
    // }
}));
app.use((0, connect_busboy_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true })); // to decode data sent through html form
app.use(body_parser_1.default.json()); //to decode data which sent as a JSON format
/*
    Built-in middleware functions in Express:
    _________________________________________
    1. urlencoded(): parses incoming requests with urlencoded payloads and is based on body-parser.

    2. bodyParser.json(): parses incoming requests with JSON payloads and is based on body-parser.

    Make sure urlencoded() comes before .json(), bcoz it first encodes the url, then converts it to JSON
*/
app.use("/static", express_1.default.static(path_1.default.join(__dirname, "../public"))); //to serve our `public` folder as the static folder.
// ex: http://localhost:5000/static/actions_attachments/22_24_1649886860601.pdf
app.use((0, cookie_parser_1.default)()); //for parisng the cookie string for all requests
app.use((0, morgan_1.default)('dev')); //create new morgan logger middleware function
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    // methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
})); // Cross-Origin Resource Sharing
const index_1 = __importDefault(require("./models/index")); // our database connection object
const { models } = index_1.default.sequelize;
const config_js_1 = __importDefault(require("./config/config.js")); //our database config file
// ====== IMPORT INDEX ROUTE =====
const index_2 = __importDefault(require("./routes/index")); //the main route that leads to sub-routes
// ====== ROUTING =====
app.use('/api/v1', index_2.default);
// ==== SEEDERS ====
// import { users } from './seeders/users'; //List of users' records
// import { positionsList } from './seeders/Positions';
// import { jobTitlesList } from './seeders/JobTitles';
// import { classificationsList } from './seeders/Classifications';
// import { positionsJobTitlesList } from './seeders/Positions_JobTitles';
const Consignees_Group_1 = require("./seeders/Consignees_Group");
const Consignees_Group_Member_1 = require("./seeders/Consignees_Group_Member");
// const createPositions = () => {
//     positionsList.map(pos => {
//         models.Position.create(pos)
//             .then((result: any) => console.log(result))
//             .catch((error: any) => console.log(error))
//     })
// }
// const createJobTitles = () => {
//     jobTitlesList.map((jobtitle: any) => {
//         models.JobTitle.create(jobtitle)
//             .then((result: any) => console.log(result))
//             .catch((error: any) => console.log(error))
//     })
// }
// const createClassifications = () => {
//     classificationsList.map((classf: any) => {
//         db.Classification.create(classf)
//             .then((result: any) => console.log(result))
//             .catch((error: any) => console.log(error))
//     })
// }
// const populateJunctionTable = () => {
//     positionsJobTitlesList.map((item: any) => {
//         db.Position_JobTitle.create(item)
//             .then((result: any) => console.log(result))
//             .catch((error: any) => console.log(error))
//     })
// }
const createConsigneesGroups = () => {
    Consignees_Group_1.consigneesGroups.map(group => {
        models.Consignees_Group.create(group)
            .then((result) => console.log(result))
            .catch((error) => console.log(error));
    });
};
const createConsigneesGroupsMembers = () => {
    Consignees_Group_Member_1.consigneesGroupsMembers.map(groupMember => {
        models.Consignees_Group_Member.create(groupMember)
            .then((result) => console.log(result))
            .catch((error) => console.log(error));
    });
};
/*
.sync({ force: true })
{ force: true }: This option force Sequelize to create a table, dropping it first if it already existed
*/
index_1.default.sequelize
    .sync()
    .then(() => {
    const server = app.listen(port, () => {
        // A node http.Server is returned and stored in `const server = `
        console.log(colors_1.default.bgYellow.black(`Server running on port ${port}`));
        console.log(colors_1.default.bgGreen.black(`connected to Database: ${config_js_1.default.development.database}`));
        // console.log("Now I will instantiate of Server class");
        const io = new socket_io_1.Server(server, {
            pingTimeout: 20000,
            cors: {
                origin: "http://localhost:3000",
                // methods: ["GET", "POST"],
            }
        });
        // console.log(server);
        // console.log("Now will wait for connection");
        io.on("connection", (socket) => {
            console.log(colors_1.default.bgGreen.black(`CONNECTION: User has connected to socket: ${socket.id}`));
            // This will take the user data from frontend: 👇
            socket.on("setup", (userData) => {
                //create a new room with the id of user data.
                // This room will be exclusive to this user only:
                socket.join(userData.employeeId);
                console.log(colors_1.default.bgWhite.black(`SETUP: Joined user whose id = ${userData.employeeId}`));
                socket.emit("connected"); //inform the frontend side that the user 
            });
            // Now the user will join a specific room/channel/chat with other people
            // Either Direct channel (2 persons) or group channel (more than 2):
            socket.on("join chat", (room) => {
                socket.join(room);
                console.log(colors_1.default.bgBlue.black(`JOIN CHAT: User Joined room: ${room}`));
            });
            // When there is a user typing, inform all channel's members:
            socket.on("typing", (channelId) => socket.in(channelId).emit("typing"));
            socket.on("stop typing", (channelId) => socket.in(channelId).emit("stop typing"));
            socket.on("new message", (data) => {
                let { newMessageReceived, targetChat } = data;
                if (!targetChat.members)
                    return console.log("targetChat.members not defined");
                // Emit the message to all users inside the room:
                targetChat.members.forEach((member) => {
                    // Don't send the message for yourself:
                    if (member.memberId == newMessageReceived.senderId)
                        return;
                    // socket.in(member.memberId) ==> Targets the member's room when broadcasting.
                    socket.in(member.memberId).emit("message received", newMessageReceived);
                });
            });
            socket.off("setup", (userData) => {
                // socket.off() is alias for emitter.removeListener()
                console.log(colors_1.default.red(`User disconnected from socket: ${socket.id}`));
                socket.leave(userData === null || userData === void 0 ? void 0 : userData.employeeId);
            });
            // socket.on("disconnect", () => {
            //     console.log("User Disconnected", socket.id);
            // });
        });
        // ------------ End io.on() -----------------------------
    });
    // createPositions();
    // createJobTitles();
    // createClassifications();
    // populateJunctionTable();
    // createConsigneesGroups();
    // createConsigneesGroupsMembers();
})
    .catch((err) => {
    console.log(err);
});
// The above sequelize method means that before you run the server, go
// to the models folder where we store our tables (models), and check if all tables
// exist in the db, and if not exist, create them then run the server.
// But how does Node know which database we are adding these tables to?
// Answer: in the config/config.json, we write the database name
// ======== My defined Error Handlers Middleware Functions: ====================
// app.use(errorLogger);
// app.use(errorResponder);
// app.use(failSafeHandler);
app.use(errorHandlers_1.myErrorHandler); //Now in catch blocks when I want I can pass the error to this middleware error handler function, by writing: next(error)
