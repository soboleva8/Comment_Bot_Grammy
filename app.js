import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello s8');
});

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));

import { Bot, GrammyError } from 'grammy';

// Получение токена бота из переменных среды
const BOT_TOKEN = process.env.TCC_BOT_TOKEN;

// ID вашего канала
const CHANNEL_ID = '-1002058965646';

// Функция для отправки запросов к Telegram Bot API
async function sendTelegramRequest(method, data = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}

// Функция для получения истории сообщений из канала
async function getChannelMessages() {
    const messages = await sendTelegramRequest('getChatHistory', {
        chat_id: CHANNEL_ID,
    });
    // Обработка полученных сообщений
    console.log('Получена история сообщений из канала:', messages);
}

// Запуск получения истории сообщений из канала
getChannelMessages();