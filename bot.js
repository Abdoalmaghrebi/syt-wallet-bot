require('dotenv').config();

const { Telegraf } = require('telegraf');
const axios = require('axios');
const http = require('http');

// ✅ Debug: طباعة المتغيرات
console.log('🔍 BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
console.log('🔍 API_URL:', process.env.API_URL);
console.log('🔍 MINI_APP_URL:', process.env.MINI_APP_URL);

const bot = new Telegraf(process.env.BOT_TOKEN);

const API_URL = process.env.API_URL;
const MINI_APP_URL = process.env.MINI_APP_URL;

// التحقق من المتغيرات
if (!API_URL || !MINI_APP_URL) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

// Port وهمي
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('SYT Wallet Bot is running!');
}).listen(PORT, () => {
  console.log(`🌐 Web server on port ${PORT}`);
});

// /start
bot.start(async (ctx) => {
  console.log('📝 /start received');
  console.log('👤 User:', ctx.from.id);
  console.log('🔗 Payload:', ctx.payload);
  
  const startPayload = ctx.payload;
  const telegramId = ctx.from.id;
  
  try {
    // تسجيل الإحالة
    if (startPayload) {
      console.log('📤 Sending referral...');
      
      try {
        const response = await axios.post(`${API_URL}/api/referrals/register`, {
          new_user_id: telegramId,
          referral_code: startPayload
        }, { timeout: 5000 });
        
        console.log('✅ Referral success:', response.data);
      } catch (apiError) {
        console.log('❌ API error:', apiError.message);
        // لا نوقف البوت إذا فشلت الإحالة
      }
    }
    
    // إرسال الرسالة
    console.log('📤 Sending welcome message...');
    
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
    
    console.log('✅ Message sent');
    
  } catch (error) {
    console.error('❌ Error in /start:', error);
    await ctx.reply('❌ حدث خطأ. جرب مرة أخرى.');
  }
});

// معالجة الأخطاء
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
});

// تشغيل
bot.launch()
  .then(() => console.log('🤖 Bot started'))
  .catch(err => console.error('❌ Launch error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
