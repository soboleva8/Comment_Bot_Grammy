import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { Bot } from 'grammy';
import { cleanEnv, str, num} from 'envalid'

// Загружаем переменные среды из файла .env
dotenv.config();

const env = cleanEnv( process.env, {
    TCC_BOT_TOKEN: str(),
    COMMENT_TEXT: str(),
    CHANNEL_ID: num(),
})

// Получение токена бота из переменных среды
const BOT_TOKEN = env.TCC_BOT_TOKEN;

// ID вашего канала
const CHANNEL_ID = env.CHANNEL_ID;

const textMessage = env.COMMENT_TEXT;

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

    // Проверяем, что сообщение пришло из нужного чата
    if (ctx.message.sender_chat.id === CHANNEL_ID && !ctx.message.from.is_bot){

        //полечение значения ID собщения из канала на которое бот отвечает комментарием
        const messageIdFromSC = ctx.message.message_id;
        
        //Отправка комментария 
        await sendCommentToChannel(ctx.chat.id, messageIdFromSC, textMessage);
    } else {
        console.error('сообщение не из того канал или вы бот');
    }
});

bot.start();