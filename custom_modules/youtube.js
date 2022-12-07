/**
 * A small module to handle interactions with YouTube.
 */
const ytsr = require("ytsr");
const ytdl = require("ytdl-core");
const ytpl = require("ytpl");

module.exports = {
  /**
   *
   * @param {string} searchTerm The search term to query YouTube.
   * @param {int} amountOfVideos The amount of videos to return.
   * @returns An object containing all the information of the found videos.
   */
  async searchYoutubeVideo(searchTerm, amountOfVideos) {
    const search = await ytsr(searchTerm, { limit: amountOfVideos });
    return search.items;
  },
  /**
   * Gets the audio from a YouTube video.
   * @param {string} url A YouTube video URL.
   * @returns {ReadableStream} The audio stream.
   */
  getYoutubeAudioStream(url) {
    return ytdl(url, { filter: "audioonly", dlChunkSize: 0 });
  },

  /**
   * Returns the URLs of all the videos inside a YouTube playlist.
   * @param {string} url A YouTube playlist URL.
   * @returns {string[]} An array containing all the URLs of the videos in the playlist.
   */
  async getSongsFromPlaylist(url) {
    const videos = await ytpl(url, { limit: Infinity });
    return videos.items.map((i) => i.url);
  },
};
