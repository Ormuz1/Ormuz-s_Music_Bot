const {
    SlashCommandBuilder,

} = require("discord.js");
const {playSong} = require("../music_player_manager");
const {searchYoutubeVideo} = require("../youtube.js")

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
        const song = interaction.options.getString("cancion");
        let songUrl;
        try {
            songUrl = new URL(song);
            if (songUrl.searchParams.get("list") !== null)
            {
                // handle playlist
                await interaction.reply("El bot no da soporte para playlists por el momento.");
                return;
            }
            else {
                songUrl = song;
            }
        } catch (error) {
            if(error.code === "ERR_INVALID_URL")
            {

                songUrl = (await searchYoutubeVideo(song, 1))[0].url;
            }
            else
            {
                throw error
            }
        } 

        response = playSong(interaction.member.guild, interaction.member.voice.channel.id, interaction.channelId, songUrl);
        await interaction.reply(response);
    },
};

