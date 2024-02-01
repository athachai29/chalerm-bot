import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};

const PLAY_COMMAND = {
  name: 'play',
  description: 'Play a song',
  options: [
    {
      type: 3,
      name: 'song',
      description: 'Name of the song',
      required: true,
    },
  ],
  type: 1,
};

const CONVERT_URL_COMMAND = {
  name: 'url',
  description: 'Convert a URL to a manybaht link',
  options: [
    {
      type: 3,
      name: 'url',
      description: 'URL to convert',
      required: true,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [CONVERT_URL_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
