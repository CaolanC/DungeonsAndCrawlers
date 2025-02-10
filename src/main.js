import express from 'express';
import { Server } from './DNC/Server.js';

const app = express();
const PORT = process.env.PORT || 5173;

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//app.use(express.static(path.join(__dirname, '../public')));

//app.get('/join', (req, res) => {
//    res.sendFile(path.join(__dirname, '../public', 'game.html'));
//});

//app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname, '../public', 'index.html'));
//});

let server = new Server(app, PORT);
server.start();
