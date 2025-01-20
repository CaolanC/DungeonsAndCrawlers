import express from 'express';
const app = express();
const PORT = process.env.PORT || 5173;

import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/join', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'game.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

