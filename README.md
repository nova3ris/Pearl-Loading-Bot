# Pearl Bot

## Description
The Pearl Bot is a Mineflayer-based Minecraft bot designed to automate Ender Pearl stasis chambers. The bot listens to whispers from authorized users and executes commands to load stasis pearls, or other commands.

## Features
- **Ender Pearl Stasis Management**: Moves to a specified stasis chamber location and loads an Ender Pearl.
- **Anti-AFK System**: Prevents the bot from being kicked for inactivity.
- **Pathfinding**: Uses the `mineflayer-pathfinder` plugin to navigate the world.
- **Command Handling**: Processes commands received via whisper messages from whitelisted users.
- **Auto Reconnect**: If the bot gets disconnected it will automatically reconnect.
- **Discord Bot**: It can be partially controlled by a discord bot, it also logs commands from users.

## Installation
### Requirements
- Node.js (latest stable version recommended) - https://nodejs.org/en/download
- A Minecraft account (Microsoft authentication supported)

### Setup
To initialise the bot you need to open a terminal and do the following command:
- If you are on linux do `bash launch.sh`
- If you are on windows do `./launch.bat`
You will be prompted with a series of questions to answer.

The first time you run it you need to sign in with a microsoft account.

To run the bot again do the same command, this time you wont need to answer the questions.

If you ever need to reset the config, manually delete `config.json` as well as `node_modules`

## Discord Bot Setup
* Create a discord bot here: https://discord.com/developers/
  * [Screenshots and how to get the bot's token](https://discordpy.readthedocs.io/en/stable/discord.html)
* Enable `Message Content Intent` under the "Bot" tab. [Example](https://i.imgur.com/iznLeDV.png)
* Invite the discord bot to a server:
  1. In the "OAuth2" tab, [generate an invite link with these permissions](https://imgur.com/rSn10ZN)
  2. Open the invite link in a web browser and select the server to invite the bot to
* Now in your discord server:
  1. In the [discord server settings](https://i.imgur.com/q8YQMJT.png), create [a role for users to manage the bot.](https://i.imgur.com/aJwE1Y8.png) Assign the role to yourself and any other users who should be able to manage the bot.
  1. Create a [channel to manage the proxy in](https://i.imgur.com/DVeJBpo.png)
  1. (Optional) create another channel for the chat relay
* At first launch, the launcher will ask you to configure the token/role/channel ID's (or you can use `discord` command after)
  * To get the ID's, you must enable [Developer Mode](https://i.imgur.com/qujvmiC.png) in your discord user settings
  * Right-click on the roles/channels you created and [click "Copy ID"](https://i.imgur.com/RDm3Gso.png)

*Credit to https://github.com/rfresh2/ZenithProxy for the text above*

## Usage
To add your pearl chamber to the bot close the trapdoor, stand on top, and message the bot `!chamber add [name]`

To delete a pearl chamber message the bot `!chamber del [name]`

To add someone to the whitelist, the person sending the command needs to be whitelisted (replace `firstPerson` with their IGN), then use `!whitelist add [username]` The username must be their exact IGN.

To delete someone from the whitelist use `whitelist del [username]`

To pearl someone type the command `!pearl` followed by the name that corresponds to that person's stasis chamber.

## In Game Commands
- `!pearl [name]` - Loads the specified pearl stasis chamber.
- `!help` - Displays available commands.
- `!here` - Makes the bot walk to the position you are standing in.
- `!test` - Simply checks if the bot is running.
- `!chamber add/del [name]` - Adds or deletes pearl chamber coordinates for someone.
- `!whitelist add/del [username]` - Adds or removes someone from the whitelist.

## Discord Commands
- `!stop` - Stops the bot until it is started up again.
- `!start` - Starts the bot back up.

## Dependencies
- [`Node.js`](https://nodejs.org/en) - JavaScript runtime environment
- [`mineflayer`](https://github.com/PrismarineJS/mineflayer) - Minecraft bot framework.
- [`mineflayer-pathfinder`](https://github.com/PrismarineJS/mineflayer-pathfinder) - Pathfinding AI.
- [`mineflayer-antiafk`](https://github.com/etiaro/mineflayer-antiafk) - Prevents AFK kicks.
- [`vec3`](https://github.com/PrismarineJS/node-vec3) - Manages block interactions.
