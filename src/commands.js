import 'dotenv/config';
import { installGlobalCommands } from './utils.js';
import { InteractParamType, InteractType } from './enum.js';

const CONVERT_URL_COMMAND = {
  name: InteractType.URL,
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
  name: InteractType.FAV,
  description: 'List of your favorite songs',
  type: 1,
};

const ADD_FAV_COMMAND = {
  name: InteractType.ADD,
  description: 'add favourite your favorite songs',
  options: [
    {
      type: 3,
      name: InteractParamType.URL,
      description: 'URL to convert',
      required: true,
    },
    {
      type: 3,
      name: InteractParamType.TITLE,
      description: 'Title to convert',
      required: true,
    },
  ],
  type: 2,
};

const DEL_FAV_COMMAND = {
  name: 'del',
  description: 'add favourite your favorite songs',
  options: [
    {
      type: 3,
      name: InteractParamType.ID,
      description: 'delete favorite song by id',
      required: true,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [CONVERT_URL_COMMAND, MY_FAVORITE_COMMAND, ADD_FAV_COMMAND, DEL_FAV_COMMAND];

installGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
