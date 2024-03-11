import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Bot } from 'grammy';

// Загружаем переменные среды из файла .env
dotenv.config();

// Получение токена бота из переменных среды
const BOT_TOKEN = process.env.TCC_BOT_TOKEN;

// ID вашего канала
const CHANNEL_ID = +process.env.CHANNEL_ID;
console.log(CHANNEL_ID);

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

//функция отправки комментария
async function sendCommentToChannel(chatId, messageId, text) {
    try {
        // Отправляем сообщение с комментарием, указывая ID сообщения, к которому добавляется комментарий
        await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId, parse_mode: 'HTML' });

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
                    post?.message?.message_id &&
                    post?.message?.sender_chat?.id === CHANNEL_ID
                ) {
                    // Получаем информацию о боте
                    const botInfo = await bot.api.getMe();
                    const botId = botInfo.id;
                    
                    // Проверяем, отправлено ли сообщение ботом
                    if (post.message.sender_chat.id !== botId) {
                        // Отправляем комментарий под каждым новым постом
                        const messageId = post.message.message_id;
                        const chatId = post.message.chat.id;
                        
                        //получение текста комментария из переменной окружения
                        const My_Text_JSON = process.env.COMMENT_TEXT_JSON;
                        //разбор JSON-строки
                        const data = JSON.parse(My_Text_JSON);
                        //получение текста для комментария согласно правилам форматирования
                        const text = data.comment_rules;
                        
                        //проверка
                        console.log(chatId, messageId);

                        sendCommentToChannel(chatId, messageId, text);
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

checkChannelForNewPosts(); // Инициализация переменной lastUpdateId

setInterval(() => checkChannelForNewPosts(), 5000); // Проверяем канал на новые посты каждые 5 секунд