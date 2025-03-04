const config = require('./config.json')
const pearls = require('./pearls.json')
let whitelist = require('./whitelist.json')
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const antiafk = require('mineflayer-antiafk')
const { Vec3 } = require('vec3')
const fs = require('fs')

let client
if (config.discordBot) {
    const { Client, GatewayIntentBits } = require('discord.js')

    client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
    })
    client.login(config.token)

    client.once('ready', () => {
        console.log('Discord bot running..')
        discordLog('`Discord bot running`')
    })

    client.on('messageCreate', (message) => {
        if (message.content === '!stop') {
            message.reply('`Shutting down pearl bot`')
            bot.quit()
        } else if (message.content === '!start') {
            message.reply('`Starting pearl bot`')
            spawnBot()
        }
    })
}

function discordLog(content) {
    if (config.discordBot) {
        const channel = client.channels.cache.get(config.channelID)
        if (channel) {
            channel.send(`\`${content}\``)
        } else
            console.log('Could not find a discord channel to send messages to.')
    }
}

let bot

function savePearls() {
    fs.writeFileSync('pearls.json', JSON.stringify(pearls, null, 2), 'utf-8')
}

function saveWhitelist() {
    fs.writeFileSync('whitelist.json', JSON.stringify(whitelist, null, 2), 'utf-8')
}

function loadPearl(target, username, lastWord) {
    bot.chat(`/w ${username} Walking to ${lastWord}'s pearl chamber.`)
    bot.afk.stop()
    const goal = new goals.GoalBlock(target.x, target.y, target.z)
    bot.pathfinder.setGoal(goal)

    if (typeof checkInterval !== 'undefined') clearInterval(checkInterval)

    checkInterval = setInterval(() => {
        if (bot.entity.position.distanceTo(goal) <= 2) {
            bot.pathfinder.setGoal(null)
            const offset = {
                x: parseFloat(`${target.x}.5`),
                y: parseFloat(`${target.y}.5`),
                z: parseFloat(`${target.z}.5`)
            }
            const block = bot.blockAt(new Vec3(offset.x, offset.y, offset.z))
            bot.activateBlock(block)
            setTimeout(() => {
                bot.activateBlock(block)
                bot.pathfinder.setGoal(new goals.GoalBlock(config.homePoint.x, config.homePoint.y, config.homePoint.z))
                bot.once('goal_reached', () => {
                    bot.chat(`/w ${username} Successfully loaded ${lastWord}'s pearl.`)
                    bot.afk.start()
                })
            }, 1000);
            clearInterval(checkInterval)
        }
    }, 100);
}

function spawnBot() {
    if (bot) {
        console.log('Bot instance already exists. Shutting down existing bot..')
        bot.end()
    }

    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        auth: 'microsoft'
    })

    bot.loadPlugin(pathfinder)
    bot.loadPlugin(antiafk)

    bot.once('spawn', () => {
        console.log('Connected to server.')
        discordLog('Connected to server.')
        const defaultMove = new Movements(bot)
        defaultMove.canDig = false
        bot.pathfinder.setMovements(defaultMove)
        bot.afk.setOptions({ actions: ['rotate', 'jump', 'walk', 'swingArm'], chatMessages: [], fishing: false })
        bot.afk.start()
    })

    bot.on('end', (reason) => {
        console.log(`Bot disconnected. Reason: ${reason}`)
        if (config.autoReconnect && reason != 'disconnect.quitting') {
            console.log('Reconnecting..')
            setTimeout(spawnBot, 20000)
        } else {
            bot.end()
        }
    })
    initCommands()
}

function initCommands() {
    bot.on('whisper', (username, message) => {
        if (whitelist.includes(username) || username === config.whitelistMain) {
            if (message.startsWith('!pearl ')) {
                const parts = message.split(' ')
                const lastWord = parts[1]
                if (pearls[lastWord]) loadPearl(pearls[lastWord], username, lastWord)
                else bot.chat(`/w ${username} No stasis coordinates found for ${lastWord}.`)

            } else if (message.startsWith('!help')) {
                bot.chat(`/w ${username} Check https://github.com/nova3ris/Pearl-Loading-Bot for a list of commands.`)

            } else if (message.startsWith('!here')) {
                const player = bot.players[username]
                if (player) {
                    bot.afk.stop()
                    bot.pathfinder.setGoal(new goals.GoalBlock(player.entity.position.x, player.entity.position.y, player.entity.position.z))
                    bot.chat(`/w ${username} Moving to position.`)
                    bot.once('goal_reached', () => { bot.chat(`/w ${username} Arrived.`); bot.afk.start() })
                } else bot.chat(`/w ${username} I can't see you.`)

            } else if (message.startsWith('!test')) {
                bot.chat(`/w ${username} The pearl bot is running.`)

            } else if (message.startsWith('!chamber')) {
                const parts = message.split(' ')
                const mode = parts[1]
                const lastWord = parts[2]
                if (mode === 'add') {
                    const player = bot.players[username]
                    if (player) {
                        if (!pearls[lastWord]) {  
                            pearls[lastWord] = {
                                x: Math[ player.entity.position.x >= 0 ? 'floor' : 'ceil'](player.entity.position.x),
                                y: Math[ player.entity.position.y >= 0 ? 'floor' : 'ceil'](player.entity.position.y),
                                z: Math[ player.entity.position.z >= 0 ? 'floor' : 'ceil'](player.entity.position.z)
                            }
                            savePearls()
                            bot.chat(`/w ${username} Saved a new pearl chamber called ${lastWord}.`)
                        } else bot.chat(`/w ${username} ${lastWord} already has a pearl set.`)
                    } else bot.chat(`/w ${username} I can't see you.`)

                } else if (mode === 'del') {
                    if (pearls[lastWord]) {
                        delete pearls[lastWord]
                        savePearls()
                        bot.chat(`/w ${username} Deleted pearl coordinates for ${lastWord}`)
                    } else bot.chat(`/w ${username} ${lastWord} Does not have a pearl added.`)
                } else bot.chat(`/w ${username} Invalid syntax.`)

            } else if (message.startsWith('!whitelist')) {
                const parts = message.split(' ')
                const mode = parts[1]
                const lastWord = parts[2]
                if (mode === 'add') {
                    if (!whitelist.includes(lastWord)) {
                        whitelist.push(lastWord)
                        saveWhitelist()
                        bot.chat(`/w ${username} Added ${lastWord} to the whitelist.`)
                    } else bot.chat(`/w ${username} ${lastWord} is already on the whitelist.`)
                    
                } else if (mode === 'del') {
                    if (whitelist.includes(lastWord)) {
                        whitelist = whitelist.filter(user => user !== lastWord)
                        saveWhitelist()
                        bot.chat(`/w ${username} Removed ${lastWord} from the whitelist.`)
                    } else bot.chat(`/w ${username} ${lastWord} was not on the whitelist.`)
                } else bot.chat(`/w ${username} Invalid syntax.`)
            } else bot.chat(`/w ${username} That is not a valid command. Use !help for a guide.`)
            const content = `${username} used [${message}]`
            console.log(content)
            discordLog(content)

        } else if (message.startsWith('!')) bot.chat(`/w ${username} You are not permitted to use the bot.`)
        else return
    })
}
spawnBot()