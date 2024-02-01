<<<<<<< HEAD
import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
=======
import 'dotenv/config';
import fetch from 'node-fetch';
import { verifyKey } from 'discord-interactions';

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send('Bad request signature');
      throw new Error('Bad request signature');
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
<<<<<<< HEAD
  const url = "https://discord.com/api/v10/" + endpoint;
=======
  const url = 'https://discord.com/api/v10/' + endpoint;
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
<<<<<<< HEAD
      "Content-Type": "application/json; charset=UTF-8",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
=======
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
<<<<<<< HEAD
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}
=======
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}
>>>>>>> 48509bb2377d9155bd686a38f49b817a78d89df4
