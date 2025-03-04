const fs = require('fs')
const readline = require('readline-sync')

const host = readline.question('What is the IP of the server you want to connect to? ')
const port = Number(readline.question('What is the port of the server you want to connect to? '))
const username = readline.question('What is the username of the minecraft (microsoft) account you want to connect with? ')
const whitelistMain = readline.question('What is the in-game name (IGN) of the first player on the whitelist. This player will have the ability to add others using in-game commands. ')
console.log('Set the coordinates of the home point that the bot will idle in. It should be dug into the ground so that the bot cant jump out, one block deep is good.')
const x = readline.question('x: ')
const y = readline.question('y: ')
const z = readline.question('z: ')
const autoReconnect = readline.question('Do you want the bot to auto reconnect if it gets kicked? (Y/N) ').toLowerCase() === 'y'
const discordBot = readline.question('Do you want to use a discord bot? (Y/N) ').toLowerCase() === 'y'
let token
let channelID
if (discordBot) {
    token = readline.question('What is the discord bot token? ')
    channelID = readline.question('What is the channelID of the channel you want to manage the bot in? ')
}

const answers = {
    host: host,
    port: port,
    username: username,
    autoReconnect: autoReconnect,
    whitelistMain: whitelistMain,
    homePoint: {x, y, z},
    discordBot: discordBot,
    token: token,
    channelID: channelID,
}

fs.writeFileSync('config.json', JSON.stringify(answers, null, 2))