require('dotenv/config');
const axios = require('axios');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const messageFormat = (data) => {
  const { city_name, timezone, temp, aqi, pres, weather, error } = data;

  error && `${error}`;

  return `
      WEATHER TODAY! ✅
      Cidade: ${city_name}
      Timezone: ${timezone}
      Tempo: ${weather.description}
      Temperatura: ${temp}°
      Índice de qualidade do Ar: ${aqi}
      Pressão: ${pres}
    `;
};

const getWeatherData = async (queryParam) => {
  try {
    const response = await axios
      .get(`https://api.weatherbit.io/v2.0/current?key=${process.env.API_TOKEN}&lang=pt&${queryParam}`);
      
    const data = response.data.data[0];

    return data;
  } catch (error) {
    console.log(error);
    return formatResponse({ error: 'Localidade não encontrada ❌' });
  }
};

bot.command('cidade', async (ctx) => {
  ctx.reply('Informe-nos o nome da CIDADE e o ESTADO separado por vírgula (Ex: Fortaleza, CE):');

  bot.on('text', async (ctx) => {
    const queryParam = `city=${ctx.message.text}`;

    const data = await getWeatherData(queryParam);

    const messageFinal = messageFormat(data);
    
    ctx.reply(messageFinal);
  });
});

bot.command('coordenadas', async (ctx) => {
  ctx.reply('Informe-nos a LATITUDE e a LONGITUDE separadas por vírgula (Ex: 38.123, -78.543');

  bot.on('text', async (ctx) => {
    const [lat, lon] = ctx.message.text.split(',');
      
    const queryParam = `lat=${lat}&lon=${lon.trim()}`;

    const data = await getWeatherData(queryParam);

    const messageFinal = messageFormat(data);

    ctx.reply(messageFinal);
  });
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));