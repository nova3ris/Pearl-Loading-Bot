const fs = require('fs');
const readline = require('readline-sync');

// Asks all the questions and saves them in constants
const host = readline.question('What is the IP of the server you want to connect to? ');
const port = Number(readline.question('What is the port of the server you want to connect to? '));
const username = readline.question('What is the username of the minecraft (microsoft) account you want to connect with? ');
const whitelistMain = readline.question('What is the in-game name (IGN) of the first player on the whitelist. This player will have the ability to add others using in-game commands. ');
console.log('Set the coordinates of the home point that the bot will idle in. It should be dug into the ground so that the bot cant jump out, one block deep is good.');
const x = readline.question('x: ');
const y = readline.question('y: ');
const z = readline.question('z: ');
const autoReconnect = readline.question('Do you want the bot to auto reconnect if it gets kicked? (Y/N) ').toLowerCase() === 'y';
const discordBot = readline.question('Do you want to use a discord bot? (Y/N) ').toLowerCase() === 'y';

// Only asks these questions if the user enables the discord bot
let token;
let channelID;
if (discordBot) {
    token = readline.question('What is the discord bot token? ');
    channelID = readline.question('What is the channel ID of the channel you want to manage the bot in? ');
}

// Saves the answers to a new config.json file
const answers = {
    host: host,
    port: port,
    username: username,
    autoReconnect: autoReconnect,
    homePoint: {x, y, z},
    discordBot: discordBot,
    token: token,
    channelID: channelID,
};
fs.writeFileSync('config.json', JSON.stringify(answers, null, 2));

// Creates empty pearls.json and whitelist.json files
const pearls = {};
const whitelist = [whitelistMain];
fs.writeFileSync('pearls.json', JSON.stringify(pearls, null, 2));
fs.writeFileSync('whitelist.json', JSON.stringify(whitelist, null, 2));