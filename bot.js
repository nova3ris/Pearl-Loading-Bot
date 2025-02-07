const config = require('./config.json')
const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const antiafk = require('mineflayer-antiafk')
const { Vec3 } = require('vec3')

function loadPearl(target, username, lastWord) {
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
                    bot.chat(`/msg ${username} Successfully loaded ${lastWord}'s pearl.`)
                    bot.afk.start()
                })
            }, 1000);
            clearInterval(checkInterval)
        }
    }, 100);
}

const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    //auth: 'microsoft'
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(antiafk)

bot.once('spawn', () => {
    const defaultMove = new Movements(bot)
    defaultMove.canDig = false
    bot.pathfinder.setMovements(defaultMove)

    bot.afk.setOptions({
        actions: ['rotate', 'walk', 'jump', 'swingArm'],
        chatMessages: [],
        fishing: false
    })
    bot.afk.start()
})

bot.on('whisper', (username, message) => {
    if (config.whitelist.includes(username)) {
        if (message.startsWith('!pearl ')) {
            const parts = message.split(' ')
            const lastWord = parts[1]
            
            if (config.stasis[lastWord]) {
                const target = config.stasis[lastWord]
                loadPearl(target, username, lastWord)

            } else
                bot.chat(`/msg ${username} No stasis coordinates found for ${lastWord}.`)

        } else if (message.startsWith('!quit')) {
            bot.chat(`/msg ${username} Shutting down the pearl bot in 3 seconds..`)
            setTimeout(() => {
                bot.quit()
            }, 3000)

        } else if (message.startsWith('!help')) {   
            bot.chat(`/msg ${username} !pearl [name]: Loads the players pearl.`)
            bot.chat(`/msg ${username} !quit: Shuts down the pearl bot only.`)
            bot.chat(`/msg ${username} !help: Displays this menu.`)

        } else
            bot.chat(`/msg ${username} That is not a valid command. Use !help for a list of commands.`)

    } else if (message.startsWith('!')) 
        bot.chat(`/msg ${username} You are not permitted to use the bot.`)

    else return
})