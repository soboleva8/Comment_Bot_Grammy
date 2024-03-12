import express, { text } from 'express';
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

//получение текста комментария из переменной окружения
const My_Text_JSON = process.env.COMMENT_TEXT_JSON;
        
//разбор JSON-строки
const data = JSON.parse(My_Text_JSON);

//получение текста для комментария согласно правилам форматирования
const textMessage = data.comment_rules;

// Создаем экземпляр бота на основе полученного токена
const bot = new Bot(BOT_TOKEN);

async function sendCommentToChannel(chatId, messageId, text) {
    try {
        // Отправляем сообщение с комментарием, указывая ID сообщения, к которому добавляется комментарий
        await bot.api.sendMessage(chatId, text, { reply_to_message_id: messageId, parse_mode: 'HTML' });

        console.log('Комментарий успешно добавлен!');
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
    }
}

bot.on('message', async (ctx) => {
    console.log(ctx.senderChat.id);
    console.dir(ctx.message, { depth: null });

    // Проверяем, что сообщение пришло из нужного чата
    if (ctx.message.sender_chat.id === CHANNEL_ID && !ctx.message.from.is_bot){

        //получение значения ID чата куда бот шлёт комментарий
        const commentChatId = ctx.chat.id;

        //полечение значения ID собщения из канала на которое бот отвечает комментарием
        const messageIdFromSC = ctx.message.message_id;

        //проверка значений
        console.log(ctx.senderChat.id);
        console.dir(ctx.message, { depth: null });
        
        //Отправка комментария 
        await sendCommentToChannel(commentChatId, messageIdFromSC, textMessage);
    }
});

bot.start();