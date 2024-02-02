import 'dotenv/config';
import { installGlobalCommands } from './utils.js';

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
  description: 'List of your favorite songs',
  type: 1,
}


const ADD_FAV_COMMAND = {
  name: 'add',
  description: 'add favourite your favorite songs',
  type: 1,
}

const DEL_FAV_COMMAND = {
   name: 'del',
  description: 'add favourite your favorite songs',
  type: 1,
}

const ALL_COMMANDS = [CONVERT_URL_COMMAND, MY_FAVORITE_COMMAND, MY_LIST_COMMAND];

installGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
