import { InteractionResponseType } from 'discord-interactions';

import { searchVideos } from '../../youtube.js';

export class SearchService {
    constructor() { }

    /**
     *
     * @param {object} data
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async search(data, res) {
        try {
            const [{ value: query }] = data['options'];

            const videos = await searchVideos(query);

            const embeds = videos.map((video) => ({
                type: 'rich',
                title: video.title,
                description: `https://www.youtube.com/watch?v=${video.videoId}`,
                color: 0x00ffff,
            }));

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'search result',
                    tts: false,
                    embeds,
                },
            });
        } catch (err) {
            console.error(err);
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'got some problem for search',
                },
            });
        }
    }
}
