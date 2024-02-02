import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { verifyDiscordRequest, urlConverter } from './utils.js';
import { favoriteOurSongs } from './fav-songs.js';
import { readFile, writeFile } from 'fs/promises';
import { InteractType } from './enum.js';

const listMes = [];

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: verifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.get('/', (_, res) => {
  res.send('Server is up and running!');
});

app.get('/health', (_, res) => {
  res.send({
    version: process.env.npm_package_version,
  });
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/api/interactions', async (req, res) => {
  // Interaction type and data
  const { type, data, member } = req.body;

  switch (type) {
    case InteractionType.PING:
      return res.send({ type: InteractionResponseType.PONG });
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      switch (name) {
        case InteractType.URL:
          const url = data['options'][0]['value'];

          // Extract video ID from the input URL
          let videoId = undefined;
          const regex1 = /youtu\.be\/([a-zA-Z0-9_-]+)/;
          const regex2 = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

          if (regex1.test(url)) {
            videoId = url.match(regex1)?.[1];
          }

          if (regex2.test(url)) {
            videoId = url.match(regex2)?.[1];
          }

          if (!videoId) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `url doesn't support to convert manybath`,
              },
            });
          }

          // Construct the desired URL format
          const convertedUrl = `https://play.laibaht.ovh/watch?v=${videoId}`;

          // Send a message into the channel where command was triggered from
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `/play ${convertedUrl}`,
            },
          });
        case InteractType.FAV:
          // 1. get user id
          const userId = member.user.id;

          // 2. get fav songs from favSongs for that user
          const userFavSongs = favoriteOurSongs.get(userId);
          if (!userFavSongs) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "your account doesn't setup for favorite song, please contact ppppp313 or _jiw",
              },
            });
          }

          // 3. convert url for ready to play
          const userFavSongsConverted = userFavSongs?.songs?.map((item) => `/play ${urlConverter(item.url)}`);
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

        case InteractType.ADD:
          try {
            listMes.push(member.user.id);
            const json = await readFile('./data/stores.json');
            const favorites = JSON.parse(json);

            console.log(favorites, data);

            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: listMes.join('\n'),
              },
            });
          } catch (err) {
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: 'cannot add new favorite song, please check args',
              },
            });
          }

        case InteractType.DEL:
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '',
            },
          });
        default:
          res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `doesn't support this commands`,
            },
          });
      }

    default:
      res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `doesn't support this commands`,
        },
      });
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
