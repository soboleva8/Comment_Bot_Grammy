import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Bot } from 'grammy';

// Загружаем переменные среды из файла .env
dotenv.config();

// Создаем экземпляр приложения Express
const app = express();
const PORT = 3000;

// Определяем маршрут для корневого URL
app.get('/', (req, res) => {
    res.send('Hello s8');
});

// Запускаем сервер Express на порту 3000
app.listen(PORT, () => console.log(`My server is running on port ${PORT}`));

// Получение токена бота из переменных среды
const BOT_TOKEN = process.env.TCC_BOT_TOKEN;

// ID вашего канала
const CHANNEL_ID = '@-1002058965646';

// Создаем экземпляр бота на основе полученного токена
const bot = new Bot(BOT_TOKEN);

// Функция для отправки запросов к API Telegram
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

async function sendCommentToChannel(chatId, messageId, text) {
    try {
        // Отправляем сообщение с комментарием, указывая ID сообщения, к которому добавляется комментарий
        await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId });

        console.log('Комментарий успешно добавлен!');
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
    }
}

// Инициализация переменной для отслеживания последнего обновления
let lastUpdateId = 0;

async function checkChannelForNewPosts() {
    try {
        // Инициализируем информацию о боте
        await bot.init();

        // Получаем обновления из канала Telegram
        const updates = await sendTelegramRequest('getUpdates', {
            channel_id: CHANNEL_ID,
            offset: lastUpdateId + 1,
        });
        
        // Проверяем, что обновления получены успешно
        if (updates && updates.ok) {
            const newPosts = updates.result;
            
            // Обрабатываем каждый новый пост
            for (const post of newPosts) {
                if (
                    post &&
                    post.message &&
                    post.message.message_id &&
                    post.message.forward_from_chat &&
                    post.message.forward_from_chat.type === 'channel'
                ) {
                    // Получаем информацию о боте
                    const botInfo = await bot.api.getMe();
                    const botId = botInfo.id;
                    
                    // Проверяем, отправлено ли сообщение ботом
                    if (post.message.sender_chat.id !== botId) {
                        // Отправляем комментарий под каждым новым постом
                        
                        const messageId = post.message.message_id;
                        const chatId = post.message.chat.id;

                        const text = 'Привет, это Бот. Кто не курит и не пьёт, тот здоровеньким умрёт';
                        console.log(chatId, messageId);

                        sendCommentToChannel(chatId, messageId, text);

                        /*try {
                            await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId });
                            console.log('Комментарий успешно добавлен!');
                        } catch (error) {
                            console.error('Ошибка при добавлении комментария:', error);
                        }*/
                    }
                
                } else {
                    console.error('Некорректные данные о посте:', post);
                }
                // Обновляем lastUpdateId
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