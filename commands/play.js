const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus} = require("@discordjs/voice");
const { SlashCommandBuilder } = require("discord.js");
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una cancion de YouTube')
        .addStringOption(option =>
            option
                .setName("cancion")
                .setDescription("La cancion a reproducir.")
                .setRequired(true)
            ),
    async execute (interaction)
    {
        const ytVideo = await searchYoutubeVideo(interaction.options.getString('cancion'));
        const resource = createAudioResource(getYoutubeVideoStream(ytVideo.url));
        console.log(ytVideo);
        const player = createAudioPlayer();
        const connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })
        player.play(resource);
        connection.subscribe(player);
        interaction.reply("Reproduciendo: " + ytVideo.title);
    },
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

 async function searchYoutubeVideo (searchTerm) {
    const search = await ytsr(searchTerm, {limit: 1} );
    return search.items[0];
 }

function getYoutubeVideoStream (url) {
    return ytdl(url, {filter: 'audioonly', dlChunkSize: 0});
}