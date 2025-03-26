const config = require('./config.json');
let pearls = require('./pearls.json');
let whitelist = require('./whitelist.json');
const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const antiafk = require('mineflayer-antiafk');
const { Vec3 } = require('vec3');
const fs = require('fs');
const { autototem } = require('mineflayer-auto-totem');

// This is to stop the user using !afk on or !afk off if the antiafk is already on/off
let afk = true;
let running = true;

// Only makes a discord bot if the user chooses to enable it
let client;
if (config.discordBot) {
    const { Client, GatewayIntentBits } = require('discord.js');

    // Sets the discord bot intents and logs it in
    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    });
    client.login(config.token);

    client.once('ready', () => {
        console.log('Discord bot running..');
        discordLog('`Discord bot running`');
    });

    client.on('messageCreate', (message) => {
        // Only responds if the message was sent in the correct channel
        if (message.channel.id !== config.channelID) return;
        if (message.content.toLowerCase() === '!stop') {
            // Makes sure the bot is running before trying to stop it
            if (running) {
                message.reply('`Shutting down pearl bot`');
                bot.quit();
                running = false;
            } else
                message.reply('`Bot is already stopped`');
        } else if (message.content.toLowerCase() === '!start') {
            // Makes sure the bot is stopped before trying to start it
            if (!running) {
                message.reply('`Starting pearl bot`');
                spawnBot();
                running = true;
            } else
                message.reply('`Discord bot is already running`');
        }
    });
}

// Declares bot here so it can be accessed globaly
let bot = null;
// Spawns the bot with a function, this allows it to be auto reconnected
function spawnBot() {
    // If there is already a bot instance it is shut down before a new one it made
    if (bot) {
        console.log('Bot instance already exists. Shutting down existing bot..');
        bot.end();
    }

    // Creates a bot
    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        auth: 'microsoft'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(antiafk);
    bot.loadPlugin(autototem);

    // Once the bot spawns in it sets the movement and antiafk rules
    bot.once('spawn', () => {
        console.log('Connected to server.');
        const defaultMove = new Movements(bot);
        defaultMove.canDig = false;
        bot.pathfinder.setMovements(defaultMove);
        bot.afk.setOptions({ actions: ['rotate', 'walk', 'swingArm'], chatMessages: [], fishing: false });
        bot.afk.start();
    });

    // Checks if the bot is disconnected
    bot.on('end', (reason) => {
        console.log(`Bot disconnected. Reason: ${reason}`);

        // Only reconnects if the user enabled auto reconnect. Also makes sure it wasn't shut down intentionally
        if (config.autoReconnect && reason != 'disconnect.quitting') {
            console.log('Reconnecting..');
            setTimeout(spawnBot, 10000);
        } else {
            // If those requirements aren't met, the bot simply ends.
            bot.end();
        }
    });

    // Equip a totem every time it can
    bot.on("physicTick", async () => {
        bot.autototem.equip();
    });

    initCommands();
}

function pearl(username, message) {
    // Split the message up to find the name of the person getting pearled, and check if they are saved in the pearls.json file
    const parts = message.split(' ');
    const lastWord = parts[1];
    if (!pearls[lastWord]) {
        bot.chat(`/w ${username} No stasis coordinates found for ${lastWord}.`);
    }

    bot.chat(`/w ${username} Walking to ${lastWord}'s pearl chamber.`);
    bot.afk.stop();
  
    // Pull the targets coordinates from the pearls.json file
    const target = pearls[lastWord];

    bot.pathfinder.setGoal(new goals.GoalNear(target.x, target.y, target.z, 2));
    bot.once('goal_reached', async () => {
        // Find the middle of the block, this is so that the bot doesn't miss the trapdoor
        const offset = {
            x: parseFloat(`${target.x}.5`),
            y: parseFloat(`${target.y}.5`),
            z: parseFloat(`${target.z}.5`)
        };

        // Click on the trapdoor twice, once to close it, and once to open it
        bot.activateBlock(bot.blockAt(new Vec3(offset.x, offset.y, offset.z)));
        await sleep(1000)
        bot.activateBlock(bot.blockAt(new Vec3(offset.x, offset.y, offset.z)));
        
        // Return to the bots cage
        bot.pathfinder.setGoal(new goals.GoalBlock(config.homePoint.x, config.homePoint.y, config.homePoint.z));
        bot.once('goal_reached', () => {
            bot.chat(`/w ${username} Successfully loaded ${lastWord}'s pearl.`);
            bot.afk.start();
        })
    })
}

function here(username) {
    // Check if the player is in the bots render distance
    const player = bot.players[username];
    if (!player) {
        bot.chat(`/w ${username} I can't see you.`);
        return;
    }

    // Move to the player
    bot.afk.stop();
    bot.pathfinder.setGoal(new goals.GoalBlock(player.entity.position.x, player.entity.position.y, player.entity.position.z));
    bot.once('goal_reached', () => {
        bot.chat(`/w ${username} Arrived.`);
        bot.afk.start();
    })
}

function home(username) {
    bot.pathfinder.setGoal(new goals.GoalBlock(config.homePoint.x, config.homePoint.y, config.homePoint.z));
    bot.once('goal_reached', () => {
        bot.chat(`/w ${username} Returned to home point.`);
    })
}

function manageChamber(username, message) {
    // Find the name of the chamber to add/delete from pearls.json
    const parts = message.split(' ');
    const mode = parts[1];
    const lastWord = parts[2];
    if (mode === 'add') {
        // Check if the player is in render distance
        const player = bot.players[username];
        if (player) {
            // Checks if there is already a chamber set with that name
            if (!pearls[lastWord]) {  
                // Saves the players coordinates, rounded to the base coordinates, to the pearls.json file
                pearls[lastWord] = {
                    x: Math[ player.entity.position.x >= 0 ? 'floor' : 'ceil'](player.entity.position.x),
                    y: Math[ player.entity.position.y >= 0 ? 'floor' : 'ceil'](player.entity.position.y),
                    z: Math[ player.entity.position.z >= 0 ? 'floor' : 'ceil'](player.entity.position.z)
                };
                savePearls();
                bot.chat(`/w ${username} Saved a new pearl chamber called ${lastWord}.`);
            } else bot.chat(`/w ${username} ${lastWord} already has a pearl set.`);
        } else bot.chat(`/w ${username} I can't see you.`);

    } else if (mode === 'del') {
        // Checks if a chamber with that name exists
        if (pearls[lastWord]) {
            delete pearls[lastWord];
            savePearls();
            bot.chat(`/w ${username} Deleted pearl coordinates for ${lastWord}`);
        } else bot.chat(`/w ${username} ${lastWord} Does not have a pearl added.`);
    } else bot.chat(`/w ${username} Invalid syntax.`);
}

function manageWhitelist(username, message) {
    // Find the name if the person to add/delete from the whitelist
    const parts = message.split(' ');
    const mode = parts[1];
    const lastWord = parts[2];
    if (mode === 'add') {
        // Checks if the person is already on the whitelist
        if (!whitelist.includes(lastWord)) {
            whitelist.push(lastWord);
            saveWhitelist();
            bot.chat(`/w ${username} Added ${lastWord} to the whitelist.`);
        } else bot.chat(`/w ${username} ${lastWord} is already on the whitelist.`);
        
    } else if (mode === 'del') {
        // Checks if the person is on the whitelist
        if (whitelist.includes(lastWord)) {
            whitelist = whitelist.filter(user => user !== lastWord);
            saveWhitelist();
            bot.chat(`/w ${username} Removed ${lastWord} from the whitelist.`);

        } else bot.chat(`/w ${username} ${lastWord} was not on the whitelist.`);
    } else bot.chat(`/w ${username} Invalid syntax.`);
}

// Helper commands
function savePearls() {
    fs.writeFileSync('pearls.json', JSON.stringify(pearls, null, 2), 'utf-8');
}

function saveWhitelist() {
    fs.writeFileSync('whitelist.json', JSON.stringify(whitelist, null, 2), 'utf-8');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function discordLog(content) {
    // Only logs messages if the discord bot is enabled
    if (config.discordBot) {
        // Sends the message in the specified channel
        const channel = client.channels.cache.get(config.channelID);
        if (channel) {
            try {
                channel.send(`\`${content}\``);
            } catch (error) {
                console.log(`Could not send message: ${error}`);
            }
        } else
            console.log('Could not find a discord channel to send messages to.');
    }
}

function initCommands() {
    bot.on('whisper', (username, message) => {
        if (whitelist.includes(username)) {
            if (message.startsWith('!pearl')) {
                pearl(username, message);

            } else if (message.startsWith('!help')) {
                bot.chat(`/w ${username} Check https://github.com/nova3ris/Pearl-Loading-Bot for a list of commands.`);

            } else if (message.startsWith('!here')) {
                here(username);

            } else if (message.startsWith('!test')) {
                bot.chat(`/w ${username} The pearl bot is running.`);

            } else if (message.startsWith('!chamber')) {
                manageChamber(username, message);

            } else if (message.startsWith('!home')) {
                home(username);

            } else if (message.startsWith('!whitelist')) {
                manageWhitelist(username, message);

            } else if (message.startsWith('!afk')) {
                
                // Split the message up
                const parts = message.split();
                const lastWord = parts[1];

                // Check if the user wants to turn it on or off
                if (lastWord === 'on') {
                    // Only turns it on if afk is off
                    if (!afk) {
                        bot.afk.start();
                        afk = true;
                    } else
                        bot.chat(`/w ${username} AntiAFK is already running.`);
                } else if (lastWord === 'off') {
                    // Only turns it off if afk is on
                    if (afk) {
                        bot.afk.stop();
                        afk = false;
                    } else
                        bot.chat(`/w ${username} AntiAFK is already stopped.`);
                }

            } else bot.chat(`/w ${username} That is not a valid command. Use !help for a guide.`);

            // Logs the command to the console and discord (If the bot is enabled)
            const content = `${username} used [${message}]`;
            console.log(content);
            discordLog(content);

        } else if (message.startsWith('!')) bot.chat(`/w ${username} You are not permitted to use the bot.`);
        else return;
    });
}
spawnBot();