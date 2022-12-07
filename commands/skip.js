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
    .setDescription("Saltea una cancion de una fila."),
  async execute(interaction) {
    const queueToSkip = getPlayerFromGuild(interaction.guildId);
    if (typeof queueToSkip === "undefined") {
      await interaction.reply(
        "No hay ningun reproductor de musica activo en este servidor."
      );
      return;
    }
    const skippedSong = queueToSkip.peekFront();
    queueToSkip.skipSong();
    await interaction.reply(`Se ha salteado ${skippedSong}.`);
  },
};
