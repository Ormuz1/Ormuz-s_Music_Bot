const client_manager = require("./client_manager.js");
const path = require("path");


client_manager.addSlashCommandsToClient(path.join(__dirname, "commands"));
client_manager.addEventsToClient(path.join(__dirname, "events"));

