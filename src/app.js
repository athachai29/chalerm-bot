<<<<<<< HEAD
import "dotenv/config";
import express from "express";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { VerifyDiscordRequest } from "./utils.js";
=======
import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

<<<<<<< HEAD
app.get("/", (req, res) => {
  res.send("Server is up and running!");
=======
app.get('/', (req, res) => {
    res.send('Server is up and running!');
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
});

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
<<<<<<< HEAD
app.post("/api/interactions", async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  switch (type) {
    case InteractionType.PING:
      return res.send({ type: InteractionResponseType.PONG });
    case InteractionType.APPLICATION_COMMAND:
      const { name } = data;
      switch (name) {
        case "url":
          const url = data["options"][0]["value"];

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
  console.log("Listening on port", PORT);
=======
app.post('/api/interactions', async function (req, res) {
    // Interaction type and data
    const { type, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;

        // "url" command
        if (name === 'url') {
            const url = data['options'][0]['value'];

            // Extract video ID from the input URL
            let videoId;
            const regex1 = /youtu\.be\/([a-zA-Z0-9_-]+)/;
            const regex2 = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;

            if (regex1.test(url)) {
                videoId = url.match(regex1)[1];
            } else if (regex2.test(url)) {
                videoId = url.match(regex2)[1];
            } else {
                // Invalid YouTube URL
                videoId = null;
            }

            // Construct the desired URL format
            const convertedUrl = videoId ? `https://play.laibaht.ovh/watch?v=${videoId}` : url;

            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `/play <${convertedUrl}>`,
                },
            });
        }
    }
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
});
