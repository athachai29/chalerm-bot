import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";

export function verifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function discordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
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

export async function installGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await discordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function urlConverter(url) {
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
    return null;
  }

  // Construct the desired URL format
  const convertedUrl = `https://play.laibaht.ovh/watch?v=${videoId}`;
  
  return convertedUrl;
}
