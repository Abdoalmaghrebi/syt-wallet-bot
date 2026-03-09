require('dotenv').config();

const { Telegraf } = require('telegraf');
const axios = require('axios');
const http = require('http');

const bot = new Telegraf(process.env.BOT_TOKEN);

const API_URL = process.env.API_URL; // رابط API
const MINI_APP_URL = process.env.MINI_APP_URL; // رابط Mini App

// Port وهمي للـ Render
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('SYT Wallet Bot is running!');
}).listen(PORT, () => {
  console.log(`🌐 Web server on port ${PORT}`);
});

// /start - تسجيل إحالة + فتح Mini App
bot.start(async (ctx) => {
  const startPayload = ctx.payload; // referral_code
  const telegramId = ctx.from.id;
  
  console.log('📝 Start:', telegramId, 'Payload:', startPayload);
  
  // تسجيل الإحالة إذا وجدت referral_code
  if (startPayload) {
    try {
      await axios.post(`${API_URL}/api/referrals/register`, {
        new_user_id: telegramId,
        referral_code: startPayload
      });
      console.log('✅ Referral registered');
    } catch (error) {
      console.log('❌ Referral error:', error.message);
    }
  }
  
  // إرسال رسالة مع زر Mini App
  await ctx.reply(
    '👋 مرحباً بك في SYT Wallet!\n\n' +
    '💰 اربح العملات من المكافآت اليومية والمهام\n' +
    '👥 ادعو أصدقاءك واحصل على 50 SYT لكل صديق\n\n' +
    'اضغط الزر أدناه لفتح محفظتك:',
    {
      reply_markup: {
        inline_keyboard: [[
          { 
            text: '💼 فتح المحفظة', 
            web_app: { url: MINI_APP_URL } 
          }
        ]]
      }
    }
  );
});

// تشغيل البوت
bot.launch()
  .then(() => console.log('🤖 Bot started'))
  .catch(err => console.error('❌ Bot error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
