import express from 'express';

const app = express()
const PORT = 3000

app.get('/', (req, res) => {
    res.send('Hello s8')
})

app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))

import { Bot, GrammyError } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();

// Получение токена бота из переменных среды
const BOT_TOKEN = process.env.TCC_BOT_TOKEN;

// ID вашего канала
const CHANNEL_ID = '@-1002058965646';

// Создание экземпляра бота
const bot = new Bot(BOT_TOKEN);

// Обработка ошибок
bot.catch((err) => {
    if (err instanceof GrammyError) {
        console.error(`Ошибка в Telegram API: ${err.description}`);
    } else {
        console.error('Необработанная ошибка:', err);
    }
});

// Обработка новых сообщений из определенного канала
bot.on('message', async (ctx) => {
    // Если сообщение пришло из вашего канала
    if (ctx.chat.id === CHANNEL_ID) {
        console.log(`Новое сообщение в вашем канале: ${ctx.message.text}`);
        
        // Здесь вы можете добавить свой код для реагирования на сообщение из канала
        // Например, можно отправить комментарий в ответ на сообщение
        try {
            await ctx.reply('Привет! Это мой ответ на ваше сообщение.');
        } catch (error) {
            console.error('Ошибка при отправке ответа:', error);
        }
    }
});

// Установка вебхука для получения обновлений
bot.start({
    webhook: {
        domain: process.env.WEBHOOK_DOMAIN,
        port: parseInt(process.env.WEBHOOK_PORT),
        path: process.env.WEBHOOK_PATH,
    },
});
