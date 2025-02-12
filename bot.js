const config = require('./config.json')
const pearls = require('./pearls.json')
const whitelist = require('./whitelist.json')
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const antiafk = require('mineflayer-antiafk')
const { Vec3 } = require('vec3')
const fs = require('fs')

let bot

function loadPearl(target, username, lastWord) {
    bot.chat(`/w ${username} Walking to ${lastWord}'s pearl chamber.`)
    bot.afk.stop()
    const goal = new goals.GoalBlock(target.x, target.y, target.z)
    bot.pathfinder.setGoal(goal)

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
    
        const defaultMove = new Movements(bot)
        defaultMove.canDig = false
        bot.pathfinder.setMovements(defaultMove)
    
        bot.afk.setOptions({
            actions: ['rotate', 'jump', 'walk', 'swingArm'],
            chatMessages: [],
            fishing: false
        })
        bot.afk.start()
    })

    bot.on('end', (reason) => {
        console.log(`Bot disconnected. Reason: ${reason}`)
        if (config.autoReconnect) {
            console.log('Reconnecting..')
            setTimeout(spawnBot, 5000)
        } else {
            bot.end()
            process.exit()
        }
    })

    initCommands()
}

function initCommands() {
    bot.on('whisper', (username, message) => {
        if (whitelist.includes(username)) {
            if (message.startsWith('!pearl ')) {
                const parts = message.split(' ')
                const lastWord = parts[1]
                
                if (pearls[lastWord]) {
                    const target = pearls[lastWord]
                    loadPearl(target, username, lastWord)
    
                } else
                    bot.chat(`/w ${username} No stasis coordinates found for ${lastWord}.`)
    
            } else if (message.startsWith('!quit')) {
                bot.chat(`/w ${username} Shutting down the pearl bot in 3 seconds..`)
                setTimeout(() => {
                    bot.end()
                    process.exit(0)
                }, 3000)
    
            } else if (message.startsWith('!help')) {
                bot.chat(`/w ${username} Check https://github.com/nova3ris/Pearl-Loading-Bot for a list of commands.`)
    
            } else if (message.startsWith('!here')) {
                const player = bot.players[username]
                if (player) {
                    bot.afk.stop()
    
                    bot.pathfinder.setGoal(new goals.GoalBlock(player.entity.position.x, player.entity.position.y, player.entity.position.z))
                    bot.chat(`/w ${username} Moving to position.`)
                    
                    bot.once('goal_reached', () => {
                        bot.chat(`/w ${username} Arrived.`)
                        bot.afk.start()
                    })
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
                            let players = JSON.parse(fs.readFileSync('pearls.json', 'utf8'))  
                            players[lastWord] = {
                                x: player.entity.position.x >= 0 ? Math.floor(player.entity.position.x) : Math.ceil(player.entity.position.x),
                                y: player.entity.position.y >= 0 ? Math.floor(player.entity.position.y) : Math.ceil(player.entity.position.y),
                                z: player.entity.position.z >= 0 ? Math.floor(player.entity.position.z) : Math.ceil(player.entity.position.z)
                            }
                            fs.writeFileSync('pearls.json', JSON.stringify(players, null, 2), 'utf8')
    
                            bot.chat(`/w ${username} Saved a new pearl chamber called ${lastWord}.`)
    
                        } else
                            bot.chat(`/w ${username} ${lastWord} already has a pearl set.`)
    
                    } else
                        bot.chat(`/w ${username} I can't see you.`)
    
                } else if (mode === 'del') {
                    if (pearls[lastWord]) {
                        let players = JSON.parse(fs.readFileSync('pearls.json', 'utf8'))
                        delete players[lastWord]
                        players = fs.writeFileSync('pearls.json', JSON.stringify(players, null, 2), 'utf8')
    
                        bot.chat(`/w ${username} Deleted pearl coordinates for ${lastWord}`)
    
                    } else
                        bot.chat(`/w ${username} ${lastWord} Does not have a pearl added.`)
    
                } else
                    bot.chat(`/w ${username} Invalid syntax.`)
            
            } else if (message.startsWith('!whitelist')) {
                const parts = message.split(' ')
                const mode = parts[1]
                const lastWord = parts[2]
    
                if (mode === 'add') {
                    if (!whitelist.includes(lastWord)) {
                        let whitelist = JSON.parse(fs.readFileSync('whitelist.json', 'utf8'))
                        whitelist.push(lastWord)
                        whitelist = fs.writeFileSync('whitelist.json', JSON.stringify(whitelist, null, 2), 'utf8')
    
                        bot.chat(`/w ${username} Added ${lastWord} to the whitelist.`)
    
                    } else
                        bot.chat(`/w ${username} ${lastWord} is already on the whitelist.`)
    
                } else if (mode === 'del') {
                    if (whitelist.includes(lastWord)) {
                        let whitelist = JSON.parse(fs.readFileSync('whitelist.json', 'utf8'))
                        whitelist = whitelist = whitelist.filter(user => user !== lastWord)
                        whitelist = fs.writeFileSync('whitelist.json', JSON.stringify(whitelist, null, 2), 'utf8')
    
                        bot.chat(`/w ${username} Removed ${lastWord} from the whitelist.`)
                    } else
                        bot.chat(`/w ${username} ${lastWord} was not on the whitelist.`)
    
                } else
                    bot.chat(`/w ${username} Invalid syntax.`)

            } else if (message.startsWith('!restart')) {
                bot.chat(`/w ${username} Restarting..`)
                bot.end()
            } else
                bot.chat(`/w ${username} That is not a valid command. Use !help for a guide.`)
    
        console.log(`${username} used ${message}`)
        } else if (message.startsWith('!')) 
            bot.chat(`/w ${username} You are not permitted to use the bot.`)
    
        else return
    })
}

spawnBot()