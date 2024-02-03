import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { verifyDiscordRequest, existDataStore } from './utils.js';

import { InteractType } from './enum.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { FavoriteService } from './service/favorite/index.js';
import { ConvertURLService } from './service/convert/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = `${__dirname}/data/stores.json`;
// Check if the file exists
existDataStore(dbPath);

const convertService = new ConvertURLService();

const favoriteService = new FavoriteService();

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
          return convertService.convert(data, res);
        case InteractType.FAV:
          return favoriteService.favorite(dbPath, member, res);
        case InteractType.ADD:
          return favoriteService.add(dbPath, member, data, res);
        case InteractType.DEL:
          return favoriteService.del(dbPath, member, data, res);
        default:
          return res.send({
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
