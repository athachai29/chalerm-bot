import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import { writeFile, access } from 'fs/promises';
import { constants } from 'fs';

/**
 *
 * @param {string} clientKey
 * @returns {void}
 */
export function verifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');

      throw new Error('Bad request signature');
    }
  };
}

/**
 *
 * @param {string} endpoint
 * @param {object} options
 * @returns {object}
 */
export async function discordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

/**
 *
 * @param {string} appId
 * @param {object} commands
 * @returns {Promise<void>}
 */
export async function installGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {string} url
 * @returns {{
 * url: string
 * videoId: string
 * }}
 */
export function urlConverter(url) {
  // Extract video ID from the input URL
  let videoId = undefined;
  const youtubeSharedRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
  const youtubeLinkRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
  const moneyBahtPlayRegex = /play\.laibaht\.ovh\/watch\?v=([a-zA-Z0-9_-]+)/;

  if (youtubeSharedRegex.test(url)) {
    videoId = url.match(youtubeSharedRegex)?.[1];
  }

  if (youtubeLinkRegex.test(url)) {
    videoId = url.match(youtubeLinkRegex)?.[1];
  }

  if (moneyBahtPlayRegex.test(url)) {
    videoId = url;
  }

  if (!videoId) {
    return null;
  }

  // Construct the desired URL format
  return { videoId, url: `https://play.laibaht.ovh/watch?v=${videoId}` };
}

/**
 *
 * @param {string} dbPath
 * @returns {Promise<void>}
 */
export async function existDataStore(dbPath) {
  try {
    await access(dbPath, constants.F_OK);
  } catch (err) {
    console.error(JSON.stringify(err, undefined, 2));

    await writeFile(dbPath, JSON.stringify({ favorites: {} }, undefined, 2));

    console.log('create data store successfully');
  }
}
