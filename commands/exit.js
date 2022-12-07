const { SlashCommandBuilder } = require("discord.js");
const {getPlayerFromGuild} = require("../custom_modules/music_player_manager.js");


module.exports = {
    data: new SlashCommandBuilder()
    .setName("exit")
    .setDescription("Cierra el reproductor de musica que esta activo en el servidor."),
    async execute(interaction) {
        const player = getPlayerFromGuild(interaction.member.guild.id);
        if(typeof(player) === "undefined")
        {
            await interaction.reply("ERROR: No hay ningun reproductor de musica activo en este servidor.");
        }
        player.stopPlaying();
        await interaction.reply("El reproductor se cerro con exito.")
    } 
}