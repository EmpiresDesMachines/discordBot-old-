const Discord    = require('discord.js');
const { token }  = require('./token.json');
const { prefix } = require('./config.json');
const bot        = new Discord.Client( {disableEveryone: true} );
const fs         = require('fs');
const fetch      = require('node-fetch');

let userData = JSON.parse(fs.readFileSync('logs/userData.json', 'utf8'));
let commands = fs.readFileSync('helpers/commands.txt', 'utf8');


bot.on('ready', () => {
    console.log('Bot Launched...');
    bot.user.setActivity('his sister', {type: 'LISTENING'} );
    bot.user.setStatus('online'); // It can be 'online', 'idle', 'invisible', 'dnd'
});

bot.on('message', message => {
    
    const time = timestampToDate(message.author.lastMessage.createdTimestamp);
    const userId = message.author.id;
    const userName = message.author.username;
    const content = message.author.lastMessage.content;
    const discriminator = message.author.discriminator;
    const log = `${time} ${userId} ${discriminator} ${userName}: ${content}\n`;

    fs.appendFile('logs/chatLog.txt', log, err => {
        if (err) throw err;
    });

    if (!userData[message.author.id]) {
        userData[message.author.id] = {
            username: message.author.username,
            discriminator: message.author.discriminator,
            messagesSent: 0
        }
    }
    userData[message.author.id].messagesSent++;

    fs.writeFile('logs/userData.json', JSON.stringify(userData), err => {
        if (err) throw err;
    });


    if (message.content === prefix + 'команды' || message.content === prefix + 'help' || message.content === prefix + 'commands') {
        message.channel.send(commands);
    }


    if (message.content.indexOf(prefix) !== 0) {
        return;
    } else if (message.content.startsWith(prefix + 'погода')) {
        let target = encodeURIComponent(message.content.split(' ').slice(1).join(' '));
        weather(target);
    } else if (message.content.startsWith(prefix + '8ball')) {
        message.reply(ball());
    } else if (message.content.startsWith(prefix + 'картинка')) {
        getRandomImage();
    } else if (message.content.startsWith(prefix + 'коуб')) {
        getRandomCoub();
    }

    function getRandomCoub() {
        let pageCount = 19;
        fetch(`https://coub.com/api/v2/timeline/community/animals-pets/monthly?page=${Math.round(Math.random() * pageCount)}`)
        .then(response => {
            return response.json();
        })
        .then(response => {
            const currentPageCoub = Math.round(Math.random() * 9);
            const rez = response.coubs[currentPageCoub].file_versions.share.default;
            // message.channel.send(rez);
            message.channel.send({files: [rez]});
        })
    }

    function getRandomImage() {
        fetch('https://picsum.photos/480/258')
        .then(response => {
            message.channel.send({files: [response.url]});
        });
    }

    function weather(city) {
        const addId ='2c9989571c4c28ed722708c0c32180b0';
        const units = 'metric';
        const lang = 'ru';
        fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${addId}&units=${units}&=lang=${lang}`)
        .then(result => {
            return result.json();
        })
        .then(result => {
            if (result.cod === 200) {
                message.reply(`**Погода в ${result.name}:**\n Сейчас температура **${(result.main.temp).toFixed(1)} ℃**, ветер ${translateWindDirection(result.wind.deg)} **${result.wind.speed} м/с**, **${weatherDecription(result.weather[0].description)}** облачность[**${result.clouds.all}%**], влажность **${result.main.humidity}%**, давление **${(result.main.pressure / 1.333).toFixed(0)} мм**`);
            } else {
                message.reply(`[${result.cod}] ${result.message}`);
            }
        });
    }

});

function translateWindDirection(deg) {
    if(deg > 337.5 && deg <= 22.5) {
        return ':arrow_down: северный';
    } else if(deg > 22.5 && deg <= 67.5) {
        return ':arrow_lower_left: северо-восточный';
    } else if(deg > 67.5 && deg <= 112.5){
        return ':arrow_left: восточный';
    } else if(deg > 112.5 && deg <= 157.5) {
        return ':arrow_upper_left: юго-восточный';
    } else if(deg > 157.5 && deg <= 202.5) {
        return ':arrow_up: южный';
    } else if(deg > 202.5 && deg <= 236.5) {
        return ':arrow_upper_right: юго-западный';
    } else if(deg > 236.5 && deg <= 292.5) {
        return ':arrow_right: **западный**';
    } else if(deg > 292.5 && deg <= 337.5) {
        return 'arrow_lower_right: северо-западный';
    }
}

function weatherDecription(val) {
    const data = {
        'clear sky': 'чистое небо :blue_circle:',

        'few clouds': 'малооблачно :white_sun_small_cloud:',
        'scattered clouds': 'переменная облачность :white_sun_small_cloud:',
        'broken clouds': 'облачно :white_sun_cloud:',
        'overcast clouds': 'повышенная облачность :cloud:',

        mist: 'слабый туман :fog:',
        fog: 'туман :fog:',
        smoke: 'дым :fog:',
        haze: 'мгла :fog:',

        'light rain': 'лёгкий дождь :white_sun_rain_cloud:',
        'moderate rain': 'меренный дождь :white_sun_rain_cloud:',
        'light intensity shower rain': 'лёгкий ливень :cloud_rain:',
        'shower rain': 'ливень :cloud_rain:',
        'heavy intensity rain': 'сильный ливень :cloud_rain:',

        'thunderstorm with light rain': 'гроза :thunder_cloud_rain:',
        'thunderstorm with rain': 'гроза :thunder_cloud_rain:',
        'thunderstorm with heavy rain': 'гроза :thunder_cloud_rain:',
        'thunderstorm': 'гроза :thunder_cloud_rain:',

        'rain and snow': 'снег с дождем :cloud_rain:/:cloud_snow: ',
        'light snow': 'слабый снег :cloud_snow:',
        snow: 'снег :cloud_snow:',
        'heavy snow': 'снегопад :cloud_snow:',
        'light shower snow': 'лёгкая метель :cloud_snow:',
        'shower snow': 'метель :cloud_snow:',
        'heavy shower snow': 'сильная метель :cloud_snow:',
    };
    if(data[val]) {
        return data[val];
    } else {
        return val;
    }
}

function ball() {
    const answers = [
    'Бесспорно', 'Предрешено', 'Никаких сомнений', 'Определённо да', 'Можешь быть уверен в этом',
    'Мне кажется — да', 'Вероятнее всего', 'Хорошие перспективы', 'Знаки говорят — да', 'Да',
    'Пока не ясно, попробуй снова', 'Спроси позже', 'Лучше не рассказывать', 'Сейчас нельзя предсказать', 'Сконцентрируйся и спроси опять',
    'Даже не думай', 'Мой ответ — нет', 'Перспективы не очень хорошие', 'Весьма сомнительно'
    ];
    const num = Math.floor(Math.random() * answers.length);
    return answers[num];
}

function addLeadingZero(number) {
    return number < 10 ? `0${number}` : `${number}`;
}

function timestampToDate(unixTimestamp) {
    const a = new Date(unixTimestamp);
    const year = a.getUTCFullYear();
    const month = addLeadingZero(a.getUTCMonth() + 1); // +1, because returns month from 0
    const date = a.getUTCDate();
    const hour = a.getUTCHours();
    const min = addLeadingZero(a.getUTCMinutes());
    const sec = addLeadingZero(a.getUTCSeconds());
    return `${date}.${month}.${year} ${hour}:${min}:${sec}`;
}

bot.login(token);