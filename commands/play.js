/**
 * Slash command for playing songs.
 * It can take in the following inputs:
 *  ° A simple string, whose first YouTube search result will be added to the guild's queue.
 *  ° A link to a YouTube video which will be added to the guild's queue.
 *  ° A link to a YouTube playlist, which will have all of it's videos added to the queue.
 */
// For further info on how music queues work, check out the music_player_manager.js docs.
const { SlashCommandBuilder } = require("discord.js");
const { playSong } = require("../custom_modules/music_player_manager");
const {
  searchYoutubeVideo,
  getSongsFromPlaylist,
} = require("../custom_modules/youtube.js");
InputTypes = {
  SearchQuery: "query",
  VideoLink: "video",
  PlaylistLink: "playlist",
};

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
    if (!interaction.member.voice.channel)
    {
      await interaction.reply("ERROR: Debes estar conectado a un canal de voz"
      + " para reproducir musica.");
      return;
    }

    let input = interaction.options.getString("cancion");
    const inputType = determineInputType(input);

    switch (inputType) {
      case InputTypes.PlaylistLink:
        await playFromPlaylist(input, interaction);
        return;

      case InputTypes.VideoLink:
        break;

      case InputTypes.SearchQuery:
        input = await getFirstYouTubeResult(input);
        break;

      default:
        await interaction.reply("ERROR: El parametro dado es invalido.");
        return;
    }

    await interaction.reply(
      playSong(
        interaction.member.guild,
        interaction.member.voice.channel.id,
        interaction.channelId,
        input
      )
    );
  },
};

async function getFirstYouTubeResult(song) {
  return (await searchYoutubeVideo(song, 1))[0].url;
}

async function playFromPlaylist(song, interaction) {
  const songs = await getSongsFromPlaylist(song);
  songs.forEach((item) =>
    playSong(
      interaction.member.guild,
      interaction.member.voice.channel.id,
      interaction.channelId,
      item
    )
  );
  await interaction.reply(`Añadidas ${songs.length} canciones a la cola.`);
}

function determineInputType(input) {
  try {
    songUrl = new URL(input);
    if (songUrl.searchParams.get("list") !== null) {
      return InputTypes.PlaylistLink;
    }
    return InputTypes.VideoLink;
  } catch (error) {
    if (error.code === "ERR_INVALID_URL") {
      return InputTypes.SearchQuery;
    }
    throw error;
  }
}
