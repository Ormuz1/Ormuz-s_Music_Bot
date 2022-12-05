const {SlashCommandBuilder, SelectMenuBuilder, ActionRowBuilder} = require("discord.js");
const {searchYoutubeVideo} = require("../youtube.js");
const VIDEOS_TO_RETURN = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("Busca y reproduce una cancion de YouTube")
        .addStringOption((option) =>
            option
                .setName("cancion")
                .setDescription("La cancion a buscar.")
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
        const response = playSong(interaction.member.guild, interaction.member.voice.channel.id, interaction.channelId, selectedVideo.url);
        await selection.reply(response);
    }
}