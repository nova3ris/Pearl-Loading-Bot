**This project has come to an end due to the release of ZenithProxy 3.0. It will no longer be updated and I recommend to switch to the Zenith Proxy bot commands if you still want to use a pearl bot.**

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
- A Zenith Proxy to connect to.

### Setup
You need a zenith proxy to connect to, The bot gets confused with 2b2t's separate queue server and I dont know how to fix it.
- ie. You can't connect directly to 2b2t.

Download and unzip the latest release.

To initialise the bot you need to open a terminal and do the following command:

`./launch`

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
  1. Create a [channel to manage the proxy in](https://i.imgur.com/DVeJBpo.png)
* At first launch, the launcher will ask you to configure the token/channel ID's
  * To get the ID's, you must enable [Developer Mode](https://i.imgur.com/qujvmiC.png) in your discord user settings
  * Right-click on the roles/channels you created and [click "Copy ID"](https://i.imgur.com/RDm3Gso.png)

*Credit to https://github.com/rfresh2/ZenithProxy for the text above*

## Usage
To add your pearl chamber to the bot close the trapdoor, stand on top, and message the bot `!chamber add [name]`

To delete a pearl chamber message the bot `!chamber del [name]`

To add someone to the whitelist use `!whitelist add [username]` The username must be their exact IGN.

To delete someone from the whitelist use `whitelist del [username]`

To pearl someone type the command `!pearl` followed by the name that corresponds to that person's stasis chamber.

## In Game Commands
- `!pearl [name]` - Loads the specified pearl stasis chamber.
- `!help` - Displays available commands.
- `!here` - Makes the bot walk to your coordinates.
- `!test` - Simply checks if the bot is running.
- `!chamber add/del [name]` - Adds or deletes someones pearl chamber.
- `!whitelist add/del [username]` - Adds or removes someone from the whitelist.
- `!home` - Makes the bot walk to its home point.
- `!afk on/off` - Turns AntiAFK on or off

## Discord Commands
- `!stop` - Stops the bot until it is started up again.
- `!start` - Starts the bot back up.

## Dependencies
- [`Node.js`](https://nodejs.org/en) - JavaScript runtime environment
- [`mineflayer`](https://github.com/PrismarineJS/mineflayer) - Minecraft bot framework.
- [`mineflayer-pathfinder`](https://github.com/PrismarineJS/mineflayer-pathfinder) - Pathfinding AI.
- [`mineflayer-antiafk`](https://github.com/etiaro/mineflayer-antiafk) - Prevents AFK kicks.
- [`vec3`](https://github.com/PrismarineJS/node-vec3) - Manages block interactions.
