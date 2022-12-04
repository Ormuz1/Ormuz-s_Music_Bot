const {
    SlashCommandBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
} = require("discord.js");
const ytsr = require("ytsr");
const {isConnectedToGuild, createMusicQueue, addSongToQueue} = require("../music_player_manager");
const VIDEOS_TO_RETURN = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Reproduce una cancion de YouTube")
        .addStringOption((option) =>
            option
                .setName("cancion")
                .setDescription("La cancion a reproducir.")
                .setRequired(true)
        ),
    async execute(interaction) {
        const searchTerm = interaction.options.getString("cancion");
        const searchResults = await searchYoutubeVideo(
            searchTerm,
            VIDEOS_TO_RETURN
        );
        const videoSelector = new SelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Seleccione la cancion a reproducir.");
        searchResults.forEach((video, index) => {
            videoSelector.addOptions({
                label: video.title,
                value: index.toString(),
            });
        });

        const row = new ActionRowBuilder().addComponents(videoSelector);
        const message = await interaction.reply({ content: `Resultados de "${searchTerm}"`, components: [row], ephemeral:true });
        const selection = await message.awaitMessageComponent()
        const selectedVideo = searchResults[parseInt(selection.values[0])];
        if(!isConnectedToGuild(interaction.guildId))
        {
            createMusicQueue(interaction.member.guild, interaction.member.voice.channel.id, interaction.channelId);
            selection.reply("Reproduciendo " + selectedVideo.url);
        }
        else
        {
            selection.reply(selectedVideo.url + " añadido a la cola de canciones");
        }
        addSongToQueue(interaction.guildId, selectedVideo.url);
    },
};

/**
 *
 * @param {string} searchTerm The search term to query YouTube.
 * @param {int} amountOfVideos The amount of videos to return.
 * @returns An object containing all the information of the found videos.
 */
async function searchYoutubeVideo(searchTerm, amountOfVideos) {
    const search = await ytsr(searchTerm, { limit: amountOfVideos });
    return search.items;
}

