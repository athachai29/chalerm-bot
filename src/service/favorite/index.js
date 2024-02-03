import { readFile, writeFile } from 'fs/promises';
import { InteractionResponseType } from 'discord-interactions';

import { urlConverter } from '../../utils.js';

export class FavoriteService {
  constructor() {}

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
      const userId = member.user.id;

      // 2. get fav songs from favSongs for that user
      const userFavSongs = dataStore.favorites[userId];
      if (!userFavSongs) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "your account doesn't setup for favorite song, please contact ppppp313 or _jiw",
          },
        });
      }

      // 3. convert url for ready to play
      const userFavSongsConverted = userFavSongs?.songs?.map(
        (item) => `/play ${item.url} \t title: ${item.title} \t id: ${item.id}`,
      );
      if (!userFavSongsConverted?.length) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'favorite songs is not found, please contact ppppp313 or _jiw',
          },
        });
      }

      // 4. return a list of fav song
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: userFavSongsConverted.join('\n'),
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
  async add(dbPath, member, data, res) {
    try {
      const json = await readFile(dbPath);
      const dataStore = JSON.parse(json);
      const options = data['options'];
      const [{ value: url }, { value: title }] = options;
      const userId = member.user.id;
      const { url: convertUrl, videoId } = urlConverter(url);

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
   * @param {member} member
   * @param {data} data
   * @param {import('express').Response} res
   * @returns {Promise<void>}
   */
  async del(dbPath, member, data, res) {
    try {
      const options = data['options'];
      const [{ value: songId }] = options;
      const json = await readFile(dbPath);
      const dataStore = JSON.parse(json);
      const userId = member.user.id;
      if (!dataStore.favorites[userId] || !dataStore.favorites[userId]?.songs?.length) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `user ${member.user.global_name} doesn't exist favorite song, could you please add new favorite`,
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
