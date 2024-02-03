import { urlConverter } from '../../utils.js';

export class ConvertURLService {
  constructor() {}

  /**
   *
   * @param {import('express').Request} data
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  convert(data, res) {
    const [{ value: url }] = data['options'];

    const { videoUrl } = urlConverter(url);
    if (!videoUrl) {
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `url doesn't support to convert manybath`,
        },
      });
    }

    // Send a message into the channel where command was triggered from
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `<@${userId}> converted successfully`,
        tts: false,
        embeds: [
          {
            type: 'rich',
            title: `response to convert youtube url to manyBaht url`,
            description: 'Y can play song via ManyBaht bot! e.g. /play https://play.laibaht.ovh/watch?v=${youtube_id}',
            color: 0x00ffff,
            fields: [
              {
                name: `ManyBaht`,
                value: `/play ${videoUrl}`,
              },
            ],
          },
        ],
      },
    });
  }
}
