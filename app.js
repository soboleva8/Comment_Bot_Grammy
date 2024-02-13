import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Bot } from 'grammy';

dotenv.config();

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello s8');
});

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));

// Получение токена бота из переменных среды
const BOT_TOKEN = '6824209048:AAGjezibRtrTdhbc7sO83RQVNf26bb2yTCA';

// ID вашего канала
const CHANNEL_ID = '@-1002058965646';

const bot = new Bot(BOT_TOKEN);

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

let lastUpdateId = 0;

async function checkChannelForNewPosts() {
    try {
        await bot.init(); // Инициализация информации о боте
        const updates = await sendTelegramRequest('getUpdates', {
            channel_id: CHANNEL_ID,
            offset: lastUpdateId + 1,
        });
        if (updates && updates.ok) {
            const newPosts = updates.result;
            for (const post of newPosts) {
                if (
                    post &&
                    post.channel_post &&
                    post.channel_post.message_id &&
                    post.channel_post.chat &&
                    post.channel_post.chat.id &&
                    post.channel_post.sender_chat &&
                    post.channel_post.sender_chat.id
                ) {
                    // Получение информации о боте
                    const botInfo = await bot.api.getMe();
                    const botId = botInfo.id;

                    // Проверяем, отправлено ли сообщение ботом
                    if (post.channel_post.sender_chat.id !== botId) {
                        // Отправляем первый комментарий под каждым новым постом
                        const messageId = post.channel_post.message_id;
                        const chatId = post.channel_post.chat.id;
                        async function sendCommentToChannel(messageId, chatId, text) {
                            try {
                                await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId });
                                console.log('Комментарий успешно добавлен!');
                            } catch (error) {
                                console.error('Ошибка при добавлении комментария:', error);
                            }
                        }
                        await sendCommentToChannel(messageId, chatId, 'Ваш комментарий здесь');
                    }
                } else {
                    console.error('Некорректные данные о посте:', post);
                }
                lastUpdateId = Math.max(lastUpdateId, post.update_id);
            }
        }
    } catch (error) {
        console.error('Ошибка при проверке канала на новые посты:', error);
    }
}

// Инициализация переменной lastUpdateId
checkChannelForNewPosts();

setInterval(() => checkChannelForNewPosts(), 5000); // Проверяем канал на новые посты каждые 5 секунд

/*async function sendCommentToChannel(messageId, chatId, text) {
    try {
        await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId });
        console.log('Комментарий успешно добавлен!');
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
    }
}
await sendCommentToChannel(messageId, chatId, 'Это первый комментарий!');
*/