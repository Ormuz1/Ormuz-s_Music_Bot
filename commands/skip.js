/**
 * A slash command for skipping a song in the music player associated to the
 *  guild the command was called in.
 */

const { SlashCommandBuilder } = require("discord.js");
const {
  getPlayerFromGuild,
} = require("../custom_modules/music_player_manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Saltea una cancion de una fila.")
    .addIntegerOption(option =>
      option.setName('cantidad')
      .setDescription("La cantidad de canciones a saltear. (Por defecto 1)")
      ),
  async execute(interaction) {
    const amount = interaction.options.getInteger("cantidad") ?? 1;

    if (amount <= 0)
    {
      await interaction.reply("ERROR: La cantidad de canciones a saltear debe ser mayor a 0.")
      return;
    }

    const queueToSkip = getPlayerFromGuild(interaction.guildId);
    if (typeof queueToSkip === "undefined") {
      await interaction.reply(
        "ERROR: No hay ningun reproductor de musica activo en este servidor."
      );
      return;
    }

    queueToSkip.skipSong(amount);
    if(amount === 1)
    {
      await interaction.reply(`Se ha salteado la cancion actual.`);
      return;
    }
    await interaction.reply(`Se han salteado ${amount} canciones.`);
  },
};
