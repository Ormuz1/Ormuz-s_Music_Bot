const ytsr = require("ytsr");
const ytdl = require("ytdl-core")

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

    getYoutubeAudioStream(url) {
        return ytdl(url, { filter: "audioonly", dlChunkSize: 0 });
    },

    
}


