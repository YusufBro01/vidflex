const { Telegraf, Markup } = require("telegraf");
const axios = require("axios");
const express = require("express");

const API_KEY = "7818528843:AAEZkfklzXFmduGmeRu-Jsg1OiB3_NUjxrY";
const bot = new Telegraf(API_KEY);
const app = express();

// Webhook qo‘shish (lokal ishlatish uchun kerak emas)
app.use(express.json());

// Start buyrug‘ini qabul qilish
bot.start((ctx) => {
    ctx.replyWithHTML(
        `🔥 Assalomu alaykum. @Vid_flex_bot ga Xush kelibsiz. Bot orqali quyidagilarni yuklab olishingiz mumkin:

• Instagram - post va IGTV + audio bilan;
• TikTok - suv belgisiz video + audio bilan;
• YouTube - videolar va shorts + audio bilan;
• Snapchat - suv belgisiz video + audio bilan;
• Likee - suv belgisiz video + audio bilan;
• Pinterest - suv belgisiz video va rasmlar + audio bilan;

Shazam funksiya:
• Qo‘shiq nomi yoki ijrochi ismi
• Qo‘shiq matni
• Ovozli xabar
• Video
• Audio
• Video xabar

🚀 Yuklab olmoqchi bo'lgan videoga havolani yuboring!
😎 Bot guruhlarda ham ishlay oladi!`
    );
});

// Qo‘shiq izlash
bot.on("text", async (ctx) => {
    try {
        const text = ctx.message.text;
        const searchUrl = `https://music.yandex.uz/handlers/music-search.jsx?text=${encodeURIComponent(text)}&type=tracks`;
        const response = await axios.get(searchUrl);
        const tracks = response.data.tracks?.items || [];

        if (tracks.length === 0) {
            return ctx.reply("❌ Qo‘shiq topilmadi, boshqa nomni kiriting.");
        }

        let message = "<b>Topilgan qo‘shiqlar:</b>\n\n";
        const buttons = [];

        tracks.slice(0, 10).forEach((track, index) => {
            const trackId = track.id;
            const title = track.title || "Noma'lum";
            const artist = track.artists[0]?.name || "Noma'lum";
            const duration = new Date(track.durationMs).toISOString().substr(14, 5);

            message += `${index + 1}. <b>${title}</b> - ${artist} (${duration})\n`;
            buttons.push([Markup.button.callback(`${index + 1}`, `download-${trackId}`)]);
        });

        ctx.replyWithHTML(message, Markup.inlineKeyboard(buttons));
    } catch (error) {
        console.error("Xatolik:", error);
        ctx.reply("❌ Xatolik yuz berdi, keyinroq urinib ko‘ring.");
    }
});

// Qo‘shiq yuklab olish
bot.action(/^download-(.+)$/, async (ctx) => {
    try {
        const trackId = ctx.match[1];
        const trackUrl = `https://music.yandex.uz/handlers/track.jsx?track=${trackId}`;
        const response = await axios.get(trackUrl);
        const track = response.data.track;

        if (!track) {
            return ctx.reply("❌ Qo‘shiq yuklab bo‘lmadi.");
        }

        const title = track.title || "Noma'lum";
        const artist = track.artists[0]?.name || "Noma'lum";

        // TODO: Aslida bu yerdan haqiqiy qo‘shiq URL sini olish kerak
        const musicUrl = `https://example.com/path-to-music-file.mp3`;

        ctx.replyWithAudio({ url: musicUrl }, { 
            title, 
            performer: artist, 
            caption: `🎵 <b>${title}</b> - ${artist}`, 
            parse_mode: "HTML" 
        });
    } catch (error) {
        console.error("Xatolik:", error);
        ctx.reply("❌ Qo‘shiq yuklab bo‘lmadi.");
    }
});

// Botni ishga tushirish
bot.launch();
console.log("🤖 Bot ishga tushdi...");

// Express server orqali webhook ishlatish (Agar kerak bo'lsa)
app.post(`/bot${API_KEY}`, (req, res) => {
    bot.handleUpdate(req.body);
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});
