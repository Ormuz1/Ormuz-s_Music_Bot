const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const Denque = require("denque");
const ytdl = require("ytdl-core");
musicQueues = {};
module.exports = {
    createMusicQueue(guild, channel)
    {
        musicQueues[guild.id] = new MusicQueue(guild, channel);
    },
    addSongToQueue(guildId, songURL)
    {
        musicQueues[guildId].addSongToQueue(songURL);
    },
    skipSong(guildId)
    {
        musicQueues[guildId].skipSong();
    },
    isConnectedToGuild(guildId)
    {
        return Object.hasOwn(musicQueues, guildId);
    },
    getQueueFromGuild(guildId)
    {
        return musicQueues[guildId];
    }
}



function getYoutubeAudioStream(url) {
    return ytdl(url, { filter: "audioonly", dlChunkSize: 0 });
}

class MusicQueue extends Denque {
    constructor(guild, channel)
    {
        super()
        this.guildId = guild.id;
        this.connection = joinVoiceChannel({
            channelId: channel,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
        });
        this.player = createAudioPlayer();
        this.connection.subscribe(this.player);
    }

    addSongToQueue(songURL)
    {
        const wasQueueEmpty = this.isEmpty();
        this.push(songURL);
        if (wasQueueEmpty)
        {
            this.playNextSong();
            this.player.on(AudioPlayerStatus.Idle, () => {
                this.shift();
                this.playNextSong();
            })
        }
    }

    playNextSong()
    {
        if(this.isEmpty()) {
            this.stopPlaying();
            return;
        } 
            
        const resource = createAudioResource(getYoutubeAudioStream(this.peekFront()));
        this.player.play(resource);
    }

    stopPlaying()
    {
        this.connection.destroy();
        this.player.stop();
        delete this.player;
        delete musicQueues[this.guildId];
        delete this;
    }

    skipSong()
    {
        this.shift();
        this.playNextSong();
    }
}