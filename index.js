const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');


const client = createClient(token);
addSlashCommandsToClient(client, path.join(__dirname, "commands"));
addEventsToClient(client, path.join(__dirname, "events"));


/**
 * Creates a discord.js client and logs it in with the given token.
 * @param {string} token 
 * @returns A logged in discord.js client.
 */
 function createClient(token)
 {
	 const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] }); 
	 client.login(token);
	 return client
 }


 /**
  * Adds all the slash commands in the given folder to the given discord.js client.
  * @param {Client} client A discord.js client.
  * @param {string} commandsPath A path to the folder containing the commands.
  */
 function addSlashCommandsToClient(client, commandsPath)
 {
	client.commands = new Collection();

	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles)
	{
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if('data' in command && 'execute' in command)
		{
			client.commands.set(command.data.name, command);
		}
		else
		{
			console.log(`[WARNING] Le falta una propiedad requerida "data" o "execute" al comando en ${filePath}.`);
		}
	}
 }

/**
 * 
 * @param {Client} client A discord.js client.
 * @param {string} eventsPath A path to a directory containing individual .js files with events.
 */
 function addEventsToClient(client, eventsPath)
 {
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles)
	{
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		if(!"execute" in event) 
		{
			console.log(`[WARNING] The event at ${filePath} has no logic to execute when said event is triggered.`)
			continue;
		}
		if(event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else
		{
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
 }