/**
 * A module for interacting with the discord.js client.
 */

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { token } = require("../config.json");
const fs = require("node:fs");
const path = require("path");

const client = createClient(token);
module.exports = {
  /**
   * Adds all the slash commands in the given folder to the given discord.js client.
   * @param {Client} client A discord.js client.
   * @param {string} commandsPath A path to the folder containing the commands.
   */
  addSlashCommandsToClient(commandsPath) {
    client.commands = new Collection();

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.log(
          `[WARNING] Le falta una propiedad requerida "data" o "execute" al comando en ${filePath}.`
        );
      }
    }
  },
  /**
   *
   * @param {Client} client A discord.js client.
   * @param {string} eventsPath A path to a directory containing individual .js files with events.
   */
  addEventsToClient(eventsPath) {
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (!"execute" in event) {
        console.log(
          `[WARNING] The event at ${filePath} has no logic to execute when said event is triggered.`
        );
        continue;
      }
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    }
  },
  sendMessageToChannel(message, guildId, channelId) {
    const channel = client.guilds.cache
      .get(guildId)
      .channels.cache.get(channelId);
    channel.send(message);
  },
};

/**
 * Creates a discord.js client and logs it in with the given token.
 * @param {string} token
 * @returns A logged in discord.js client.
 */
function createClient(token) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });
  client.login(token);
  return client;
}
