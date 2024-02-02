import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

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

const MY_FAVORITE_COMMAND = {
  name: 'fav',
  description: 'Convert a URL to a manybaht link',
  type: 1,
}

const ALL_COMMANDS = [CONVERT_URL_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
