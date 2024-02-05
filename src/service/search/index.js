import { InteractionResponseType } from 'discord-interactions';

import { urlConverter } from '../../utils.js';

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

            const fields = videos.map((video) => {    
                return ({
                    name:  `${video.title}`,
                    value: `/play https://play.laibaht.ovh/watch?v=${video.videoId}`,
                })
            });

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: '<@${userId}> search result',
                    tts: false,
                    embeds: {
                        type: 'rich',
                        title: `results your youtube search`,
                        description: '',
                        color: 0x00ffff,
                        fields: [
                            ...fields,
                        ],
                    },
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
