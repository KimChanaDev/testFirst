import dotenv from 'dotenv';
import { App } from './App.js';
import { GameController } from './Controller/GameController.js';
import { UserController } from './Controller/UserController.js';

dotenv.config();
const app = new App([new GameController, new UserController]);
app.listen();
