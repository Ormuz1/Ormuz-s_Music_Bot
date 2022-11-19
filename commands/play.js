const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require("@discordjs/voice");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una cancion de YouTube'),
    async execute (interaction)
    {
        const resource = createAudioResource("C:\\Users\\PC\\Downloads\\test.mp3")
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })
        player.play(resource);
        connection.subscribe(player);
        interaction.reply("Exito!");
    },
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}