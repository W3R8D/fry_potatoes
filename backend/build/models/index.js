'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {}; //We are trusting Sequelize, so make the type 'any'
let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
}
else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}
fs_1.default
    .readdirSync(__dirname) //will return array of all files inside the /modles directory
    .filter((file) => {
    // Filter the array to only return files with .ts and exclude the basename file (index.ts):
    // __dirname returns the directory path of the currently executing file, 
    // So, in our case: __dirname will return:
    // D:\development\graduation-project-correspondence\backend\src\models.
    // and basename will be: index.ts
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.ts');
})
    .forEach((file) => {
    // Iterate over the files and for each file, call the function that creates the model:
    // const model = require(path.join(__dirname, file)); //returns function
    // model(sequelize, Sequelize.DataTypes); //invoke the function.
    // == Now all our models are included inside object called: db.sequelize.models
    //     db[model.name] = model;
    //     console.log(db);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    // ==== Now all our models are found inside sub-object called: sequelize.models in the sequelize object.  
    // console.log(model); // will print the model's name (ex: Employee)
    // Now, for easy access to our models, reference each model with its name as a key in our "db" object:
    // db[model.name] = model;
    // db[model] = model; 
    // console.log(model.name);
    //     // const model = path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    //     // console.log(model);
});
db.sequelize = sequelize; // sequelize (our instance of Sequelize class),
// ===== For Assocations: ==========
const { models } = db.sequelize; // returns object with all our models.
for (var modelName in models) {
    // iterate over the keys of the `models` object.
    // So in each iteration, the `modelName` stores on of the keys of the `models` object.
    // And I know that the keys of the `models` object are the models' names:
    if (models[modelName].associate) {
        models[modelName].associate(models); //pass the `models` object to the associate() function
    }
}
// module.exports = db   //
/* since the file is now index.ts instead of index.js,
the file is no longer considered as a module, so don't use module.exports */
// db.Sequelize = Sequelize;
// console.log("db.sequelize: ", db.sequelize);
exports.default = db;
