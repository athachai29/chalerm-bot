import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';
import { writeFile, access } from 'fs/promises';
import { constants } from 'fs';

const youtubeSharedRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;

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
 * @returns {
 * url: string
 * videoId: string
 * }
 */
export function urlConverter(url) {
  if (youtubeSharedRegex.test(url)) {
    const videoId = url.match(youtubeSharedRegex)?.[1];

    return { videoId, url: `https://play.laibaht.ovh/watch?v=${videoId}` }
  }

  try {
    const urlObj = new URL(url)
    if (!urlObj) {
      return null
    }
  
    const videoId = urlObj.searchParams.get('v')
    if (!videoId) {
      return null
    }
  
    return { videoId, url: `https://play.laibaht.ovh/watch${urlObj.search}` };
  } catch (err) {
    console.error(err)

    return null
  }


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

/**
 * 
 * @param {*} str 
 * @param {*} wordCount 
 * @param {*} ending 
 * @returns {string}
 */
export function truncateWords(str, wordCount, ending = ' ...') {
  const words = str.split('\n');
  if (words.length <= wordCount) return str; // No truncation needed
  return words.slice(0, wordCount).join(' ') + ending;
}
