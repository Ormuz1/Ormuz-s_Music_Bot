/**
 * A small module to handle interactions with YouTube.
 */
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const play_dl = require("play-dl");
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
  async getYoutubeAudioStream(url) {
    return await play_dl.stream(url);
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
