const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require("@discordjs/voice");
const Denque = require("denque");
const {sendMessageToChannel} = require("./client_manager.js");
const {getYoutubeAudioStream} = require("./youtube.js");
let musicQueues = {};

module.exports = {
    createMusicQueue(guild, voiceChannel, textChannel)
    {
        musicQueues[guild.id] = new MusicQueue(guild, voiceChannel, textChannel);
    },
    addSongToQueue(guildId, songURL)
    {
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
    },
    MusicQueueEvents: {
        Play: "play",
        Stop: "stop",
        AddToQueue: "addToQueue",
        Skip: "skip"
    },
    playSong(guild, voiceChannelId, textChannelId, songUrl) {
        if(!Object.hasOwn(musicQueues, guild.id))
        {
            musicQueues[guild.id] = new MusicQueue(guild, voiceChannelId, textChannelId);
            musicQueues[guild.id].addSongToQueue(songUrl);
            return "Reproduciendo " + songUrl;
        }
        else
        {
            musicQueues[guild.id].addSongToQueue(songUrl);
            return songUrl + " añadido a la cola de canciones";
        }
    }
}


class MusicQueue extends Denque {
    
    constructor(guild, voiceChannel, textChannel)
    {
        super()
        this.guildId = guild.id;
        this.textChannelId = textChannel;
        this.connection = joinVoiceChannel({
            channelId: voiceChannel,
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
                sendMessageToChannel("Reproduciendo " + this.peekFront(), this.guildId, this.textChannelId)
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
        sendMessageToChannel("La cola de canciones se termino.", this.guildId, this.textChannelId);
        this.connection.destroy();
        this.player.stop();
        delete this.player;
        delete musicQueues[this.guildId];
        delete this;
    }

    skipSong()
    {
        this.shift();
        if (typeof(this.peekFront()) !== 'undefined')
            sendMessageToChannel("Reproduciendo " + this.peekFront(), this.guildId, this.textChannelId)
        this.playNextSong();
    }
}