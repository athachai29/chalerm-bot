import { InteractionResponseType } from 'discord-interactions';

import { urlConverter } from '../../utils.js';

import { searchVideos } from '../../youtube.js';

export class SearchService {
    constructor() { }

    /**
     *
     * @param {object} data
    * @param {member} member
     * @param {import('express').Response} res
     * @returns {Promise<void>}
     */
    async search(data, member, res) {
        try {
            const [{ value: query }] = data['options'];
            const { id: userId } = member.user;

            const videos = await searchVideos(query);

            const embeds = videos.map((video) => {
                return ({
                    type: 'rich',
                    author: {
                        name: video.title,
                        url: `https://www.youtube.com/watch?v=${video.videoId}`
                    },
                    title: `/play https://play.laibaht.ovh/watch?v=${video.videoId}`,
                    description: video.description,
                    thumbnail: {
                        url: video.thumbnailURL
                    },
                })
            });

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `<@${userId}> search result`,
                    tts: false,
                    embeds: [
                        ...embeds,
                    ],
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
