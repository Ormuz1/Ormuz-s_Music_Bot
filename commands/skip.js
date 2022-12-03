const {SlashCommandBuilder} = require("discord.js");
const music_player_manager = require("../music_player_manager");
const {getQueueFromGuild, skipSong} = require("../music_player_manager");

module.exports = {
    data:  new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Saltea una cancion de una fila."),
    async execute(interaction) 
    {
        const queueToSkip = getQueueFromGuild(interaction.guildId);
        const skippedSong = queueToSkip.peekFront();
        skipSong(interaction.guildId);
        interaction.reply(`Se ha salteado ${skippedSong}.`)
    }
}