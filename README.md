# Pearl Bot

## Description
The Pearl Bot is a Mineflayer-based Minecraft bot designed to automate Ender Pearl stasis chambers. The bot listens to whispers from authorized users and executes commands to load stasis pearls, or other commands.

## Features
- **Ender Pearl Stasis Management**: Moves to a specified stasis chamber location and loads an Ender Pearl.
- **Anti-AFK System**: Prevents the bot from being kicked for inactivity.
- **Pathfinding**: Uses the `mineflayer-pathfinder` plugin to navigate the world.
- **Command Handling**: Processes commands received via whisper messages from whitelisted users.
- **Auto Reconnect**: If the bot gets disconnected it will automatically reconnect.

## Installation
### Requirements
- Node.js (latest stable version recommended) - https://nodejs.org/en/download
- A Minecraft account (Microsoft authentication supported)

### Setup
1. Download and extract the zip file.
2. Install dependencies:
   ```sh
   npm install
   ```
    *OR* run install.bat

## Configuration (`config.json`)
Edit `config.json` with your server details.

By default most servers port will be 25565.

Replace `username` with the IGN of the account that you want to connect to the server with.

Set `homePoint` to where you want the bot to afk at.

If you want the bot stay disconnected if it disconnects, then change `autoReconnect` to false. (default true).

Replace `"person1"` in `whitelist.json` with one whitelisted person. This person can then add everyone else through bot commands.

## Usage
Start the bot with:
```sh
node bot.js
```
*OR* run launch.bat

The first time you run the code you will be prompted to sign into your microsoft account.

To add your pearl chamber to the bot close the trapdoor, stand on top, and message the bot `!chamber add [name]`

To delete a pearl chamber message the bot `!chamber del [name]`

To add someone to the whitelist, the person sending the command needs to be whitelisted (replace `firstPerson` with their IGN), then use `!whitelist add [username]` The username must be their exact IGN.

To delete someone from the whitelist use `whitelist del [username]`

**Important:**
You must restart the bot after making changes to the whitelist or pearl list in order for `!pearl` to work. (`!restart` doesn't work for this, you must restart fully)

To pearl someone type the command `!pearl` followed by the name that corresponds to that person's stasis chamber.

## Commands
- `!pearl [name]` - Loads the specified pearl stasis chamber.
- `!quit` - Shuts down the bot.
- `!help` - Displays available commands.
- `!here` - Makes the bot walk to the position you are standing in.
- `!test` - Simply checks if the bot is running.
- `!chamber add/del [name]` - Adds or deletes pearl chamber coordinates for someone.
- `!whitelist add/del [username]` - Adds or removes someone from the whitelist.
- `!restart` - Restarts the bot.

## Dependencies
- [`Node.js`](https://nodejs.org/en) - JavaScript runtime environment
- [`mineflayer`](https://github.com/PrismarineJS/mineflayer) - Minecraft bot framework.
- [`mineflayer-pathfinder`](https://github.com/PrismarineJS/mineflayer-pathfinder) - Pathfinding AI.
- [`mineflayer-antiafk`](https://github.com/etiaro/mineflayer-antiafk) - Prevents AFK kicks.
- [`vec3`](https://github.com/PrismarineJS/node-vec3) - Manages block interactions
