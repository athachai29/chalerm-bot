import { InteractionResponseType } from 'discord-interactions';
import { readFile, writeFile } from 'fs/promises';

import { urlConverter } from '../../utils.js';

import { getVideoInfo } from '../../youtube.js';

export class FavoriteService {
  constructor() { }

  /**
   *
   * @param {string} dbPath
   * @param {member} member
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async favorite(dbPath, member, res) {
    try {
      const json = await readFile(dbPath);
      const dataStore = JSON.parse(json);

      // 1. get user id
      const { id: userId } = member.user;

      // 2. get fav songs from favSongs for that user
      const userFavSongs = dataStore.favorites[userId];
      if (!userFavSongs) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "your account doesn't setup for favorite song, please add yours song again!",
          },
        });
      }

      if (!userFavSongs?.songs?.length) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'favorite songs is not found, please add yours song again!',
          },
        });
      }

      // 4. return a list of fav song
      const embeds = userFavSongs?.songs?.map((song) => {
        return ({
          type: 'rich',
          author: {
            name: song.title,
            url: `https://www.youtube.com/watch?v=${song.id}`,
          },
          title: `/play https://play.laibaht.ovh/watch?v=${song.id}`,
          description: song?.description || 'You can play song via ManyBaht bot! e.g. /play https://play.laibaht.ovh/watch?v=${youtube_id}',
          color: 0x00ffff,
          ...(song?.photoURL && {
            thumbnail: {
              url: song?.photoURL
            },
          }),
        });
      });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `Hey <@!${userId}>! This of list your favorite songs:`,
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
          content: 'got some problem for get favorites',
        },
      });
    }
  }

  /**
   *
   * @param {string} dbPath
   * @param {member} member
   * @param {data} data
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async addFavoriteSong(dbPath, member, data, res) {
    try {
      const { id: userId } = member.user;

      const json = await readFile(dbPath);
      const dataStore = JSON.parse(json);

      const options = data['options'];
      const [{ value: url }] = options;
      const { url: convertUrl, videoId } = urlConverter(url);
      const { title, photoURL, description } = await getVideoInfo(videoId);

      if (!convertUrl) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'cannot convert url to add a new favorite songs',
          },
        });
      }

      if (dataStore?.favorites?.[userId]) {
        dataStore?.favorites?.[userId].songs.push({
          title,
          photoURL,
          description,
          id: videoId,
          url: convertUrl,
        });
      } else {
        Object.assign(dataStore.favorites, {
          [userId]: {
            name: member.user.global_name,
            songs: [
              {
                title,
                photoURL,
                description,
                id: videoId,
                url: convertUrl,
              },
            ],
          },
        });
      }

      await writeFile(dbPath, JSON.stringify(dataStore, undefined, 2));

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> /play ${convertUrl}`,
          tts: false,
          embeds: [
            {
              type: 'rich',
              title: `Your added song`,
              description: '',
              color: 0x00ffff,
              fields: [
                {
                  name: `title: ${title}, \t ID: ${videoId}`,
                  value: `/play ${convertUrl}`,
                },
              ],
            },
          ],
        },
      });
    } catch (err) {
      console.error(err);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'cannot add new favorite song, please check args',
        },
      });
    }
  }

  /**
   *
   * @param {string} dbPath
   * @param {object} member
   * @param {object} data
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async deleteFavoriteSong(dbPath, member, data, res) {
    try {
      const { id: userId, global_name } = member.user;

      const options = data['options'];
      const [{ value: songId }] = options;
      const json = await readFile(dbPath);
      const dataStore = JSON.parse(json);

      if (!dataStore.favorites[userId] || !dataStore.favorites[userId]?.songs?.length) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `user ${global_name} doesn't exist favorite song, could you please add new favorite`,
          },
        });
      }

      const song = dataStore.favorites[userId]?.songs?.find((song) => song.id === songId);
      const leastSongs = dataStore.favorites[userId]?.songs?.filter((song) => song.id !== songId);
      dataStore.favorites[userId].songs = leastSongs;

      await writeFile(dbPath, JSON.stringify(dataStore, undefined, 2));

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `<@${userId}> delete ${song?.title || songId} successfully`,
        },
      });
    } catch (err) {
      console.error(err);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `bad request for delete favorite songs,please contact ppppp313 or _jiw`,
        },
      });
    }
  }
}
