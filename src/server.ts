import dotenv from 'dotenv';
import { App } from './App.js';

dotenv.config();

const app = new App();
app.listen();
