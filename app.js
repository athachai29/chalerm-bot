import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import { Manager } from 'erela.js';
import Spotify from 'erela.js-spotify';
import { LavalinkManager } from "lavalink-client";
import { Client, GatewayIntentBits } from "discord.js";
import fetch from 'node-fetch';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

app.get('/', (req, res) => {
    res.send('Server is up and running!');
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/api/interactions', async function (req, res) {
    // Interaction type and data
    const { type, id, data, guild_id, channel_id } = req.body;
    // console.log({ type, id, data });
    const { client } = req;
    // console.log('client', client);

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        // "test" command
        if (name === 'test') {
            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: 'hello world ' + getRandomEmoji(),
                },
            });
        }

        // "play" command
        if (name === 'play') {
            // erele.js
            // const manager = new Manager({
            //     plugins: [
            //         // Initiate the plugin and pass the two required options.
            //         new Spotify({
            //             clientID: process.env.SPOTIFY_CLIENT_ID,
            //             clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            //         }),
            //     ],
            //     send(id, payload) {
            //         console.log({ id, payload });
            //     },
            // });

            // const resSearch = await manager.search("https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC");
            // console.log(resSearch);


            // lavalink-client.js
            // // create bot client
            const client = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildVoiceStates
                ]
            });

            // // create lavalink client
            client.lavalink = new LavalinkManager({
                nodes: [
                    { // Important to have at least 1 node
                        authorization: "youshallnotpass",
                        host: "localhost",
                        port: 2333,
                        id: "testnode"
                    }
                ],
                sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
                // client: {
                //     id: process.env.CLIENT_ID, username: "TESTBOT",
                // },
                // everything down below is optional
                autoSkip: true,
                playerOptions: {
                    clientBasedPositionUpdateInterval: 150,
                    defaultSearchPlatform: "ytmsearch",
                    volumeDecrementer: 0.75,
                    //requesterTransformer: requesterTransformer,
                    onDisconnect: {
                        autoReconnect: true,
                        destroyPlayer: false
                    },
                    onEmptyQueue: {
                        destroyAfterMs: 30_000,
                        //autoPlayFunction: autoPlayFunction,
                    }
                },
                queueOptions: {
                    maxPreviousTracks: 25
                },
            });

            // // above the lavalinkManager + client were created
            client.on("raw", d => client.lavalink.sendRawData(d));
            client.on("ready", async () => {
                console.log("Discord Bot is ready to be Used!");
                await client.lavalink.init({ ...client.user });
            });

            // // create player
            const player = await client.lavalink.createPlayer({
                guildId: guild_id,
                voiceChannelId: channel_id,
                textChannelId: channel_id,
                // optional configurations:
                selfDeaf: true,
                selfMute: false,
                volume: 100,
                node: "testnode",
            });

            // connect the player to it's vc
            await player.connect();

            // search a query (query-search, url search, identifier search, etc.)
            const res = await player.search({
                query: `Elton John`, // source: `soundcloud`,
            }, '643244907615485955');

            // // add the first result
            // await player.queue.add(res.tracks[0]);

            // // only play if the player isn't playing something, 
            // if (!player.playing) await player.play(); // you can provide specific track, or let the manager choose the track from the queue!

            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: 'Song is playing',
                },
            });
        }

        // "url" command
        if (name === 'url') {
            const youtubeUrl = data['options'][0]['value'];

            // Extract video ID from the input URL
            let videoId;
            const regex1 = /youtu\.be\/([a-zA-Z0-9_-]+)/;
            const regex2 = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

            if (regex1.test(youtubeUrl)) {
                videoId = youtubeUrl.match(regex1)[1];
            } else if (regex2.test(youtubeUrl)) {
                videoId = youtubeUrl.match(regex2)[1];
            } else {
                // Invalid YouTube URL
                videoId = null;
            }

            // Construct the desired URL format
            const convertedUrl = videoId ? `https://play.laibaht.ovh/watch?v=${videoId}` : youtubeUrl;

            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `/play <${convertedUrl}>`,
                },
            });
        }
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
