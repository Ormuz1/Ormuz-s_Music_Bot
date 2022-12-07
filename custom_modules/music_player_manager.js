/**
 * A module for handling music players in different discord servers.
 */

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const Denque = require("denque");
const { sendMessageToChannel } = require("./client_manager.js");
const { getYoutubeAudioStream } = require("./youtube.js");
let musicPlayers = {};

module.exports = {
  /**
   * Given the id of a Discord guild, returns the player associated with that
   *  id, or undefined if said guild has no active music player.
   * @param {string} guildId The id of the guild.
   * @returns {MusicPlayer | undefined}
   */
  getPlayerFromGuild(guildId) {
    return musicPlayers[guildId];
  },

  /**
   *
   * @param {string} guild The id of the guild in which to create the music
   *  player.
   * @param {string} voiceChannelId The id of the voice channel in which to
   *  play music.
   * @param {string} textChannelId The id of the text channel in which to
   *  send messages indicating the player's state.
   * @param {string} songUrl The url of the song to play.
   * @returns {string} A string with a response message for the user.
   */
  playSong(guild, voiceChannelId, textChannelId, songUrl) {
    if (!Object.hasOwn(musicPlayers, guild.id)) {
      musicPlayers[guild.id] = new MusicPlayer(
        guild,
        voiceChannelId,
        textChannelId
      );
      musicPlayers[guild.id].addSongToQueue(songUrl);
      return "Reproduciendo " + songUrl;
    } else {
      musicPlayers[guild.id].addSongToQueue(songUrl);
      return songUrl + " añadido a la cola de canciones";
    }
  },
};

/**
 * A class for representing a music player.
 */
class MusicPlayer extends Denque {
  isBeingDestroyed = false;

  constructor(guild, voiceChannel, textChannel) {
    super();
    this.guildId = guild.id;
    this.textChannelId = textChannel;
    this.connection = joinVoiceChannel({
      channelId: voiceChannel,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
    });
    this.connection.on(VoiceConnectionStatus.Destroyed, () => {
      if(!this.isBeingDestroyed) 
        this.stopPlaying();
    }
    );
    this.player = createAudioPlayer();
    this.connection.subscribe(this.player);
  }

  addSongToQueue(songURL) {
    const wasQueueEmpty = this.isEmpty();
    this.push(songURL);
    if(!wasQueueEmpty)
      return;

    this.playNextSong();
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.shift();
      if (typeof this.peekFront() !== "undefined")
        sendMessageToChannel(
          "Reproduciendo " + this.peekFront(),
          this.guildId,
          this.textChannelId
        );
      this.playNextSong();
    });
     }

  async playNextSong() {
    if (this.isEmpty()) {
      sendMessageToChannel(
        "La cola de canciones se termino.",
        this.guildId,
        this.textChannelId
      );
      this.stopPlaying();
      return;
    }
    const source = await getYoutubeAudioStream(this.peekFront())
    const resource = createAudioResource(source.stream, {
      inputType : source.type
 });
    this.player.play(resource);
  }

  stopPlaying() {
    this.isBeingDestroyed = true;
    this.connection.destroy();
    this.player.stop();
    delete this.player;
    delete musicPlayers[this.guildId];
    delete this;
  }

  skipSong(amount = 1) {
    for (let i = 0; i < amount && !this.isEmpty(); i++)
    {
      this.shift();
    }
    if (typeof(this.peekFront()) !== "undefined")
      sendMessageToChannel(
        "Reproduciendo " + this.peekFront(),
        this.guildId,
        this.textChannelId
      );
    this.playNextSong();
  }
}
