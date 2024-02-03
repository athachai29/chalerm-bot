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

    const videoUrl = urlConverter(url);
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
        content: `/play ${videoUrl}`,
      },
    });
  }
}
