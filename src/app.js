import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { verifyDiscordRequest, urlConverter } from './utils.js';
import { favoriteOurSongs } from './fav-songs.js';
import { readFile, writeFile } from 'fs/promises';
import { InteractType } from './enum.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  console.log(data, type);

  switch (type) {
    case InteractionType.PING:
      return res.send({ type: InteractionResponseType.PONG });
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      switch (name) {
        case InteractType.URL:
          const url = data['options'][0]['value'];

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
        case InteractType.FAV:
          try {
            const json = await readFile(`${__dirname}/data/stores.json`);
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
          const userFavSongsConverted = userFavSongs?.songs?.map((item) => `/play ${item.url}`);
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
            console.error(err)
            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: "got some problem for get favorites",
              },
            })
          }
        
        case InteractType.ADD:
          try {
            const json = await readFile(`${__dirname}/data/stores.json`);
            const dataStore = JSON.parse(json);
            const options = data['options'];
            const [url, title] = options;
            const userId = member.user.id;
            const convertUrl = urlConverter(url.value)

            if (!convertUrl) {
              return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  content: 'cannot convert url to add a new favorite songs',
                },
              })
            }

            dataStore.favorites[userId].songs.push({
              id: crypto.randomUUID(),
              title: title.value,
              url: convertUrl
            })
           
            await writeFile(`${__dirname}/data/stores.json`, JSON.stringify(dataStore, undefined, 2))

            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                content: `@${member.user.global_name} /play ${convertUrl}`,
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
