# Nuvira Discord Bot

A versatile Discord bot designed to enhance your server experience with moderation tools, radio streaming, and custom commands.

## Features

- **Radio Streaming:** Tune into various radio stations directly from Discord.
  - `!maroc`: Radio Maroc
  - `!aswat`: Aswat Radio
  - `!usa`: USA Radio
  - `!bbc`: BBC Radio
- **Moderation Commands:**
  - `!kick <@user>`: Kicks a mentioned user from the server. (Requires 'KICK_MEMBERS' permission)
  - `!ban <@user>`: Bans a mentioned user from the server. (Requires 'BAN_MEMBERS' permission)
  - `!addrole <@user> <role name>`: Adds a specified role to a mentioned user. (Requires 'MANAGE_ROLES' permission)
  - `!removerole <@user> <role name>`: Removes a specified role from a mentioned user. (Requires 'MANAGE_ROLES' permission)
- **General Commands:**
  - `!ping`: Responds with 'Pong! 🏓'.
  - `!welcome`: Sends a welcome message.
  - `!echo <message>`: Repeats the message you provide.
  - `!help`: Displays a list of all available commands.
- **Auto-Join Voice Channel:** The bot automatically joins a predefined voice channel upon startup.
- **Automatic Reactions:** Reacts to messages in a specified channel with a set of emojis.
- **24/7 Uptime (with Monitoring):** Includes a basic web server to respond to uptime monitoring services (like UptimeRobot) to keep the bot alive on free hosting tiers.

## Getting Started

Follow these instructions to set up and run Nuvira Bot locally or deploy it.

### Prerequisites

- Node.js (v16.x or higher recommended)
- npm (Node Package Manager)
- A Discord Bot Token (from [Discord Developer Portal](https://discord.com/developers/applications))
- A voice channel ID where the bot should auto-join.
- A text channel ID where the bot should add reactions.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    cd YOUR_REPO_NAME/my-discord-bot # Adjust if your bot is in a different subdirectory
    ```
    *(Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the `my-discord-bot` directory, create a file named `.env` and add your Discord bot token:
    ```
    DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
    ```
    Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token.

4.  **Configure Bot Settings (in `index.js`):**
    Open `index.js` and update the following constants:
    ```javascript
    const VOICE_CHANNEL_ID = 'YOUR_VOICE_CHANNEL_ID'; // Replace with your voice channel ID
    const REACTION_CHANNEL_ID = 'YOUR_REACTION_CHANNEL_ID'; // Replace with your reaction channel ID
    // You can also adjust REACTION_EMOJIS or add/change radio streams
    ```

### Running the Bot Locally

```bash
node index.js
```
Your bot should now be online in your Discord server.

## Deployment to Render (24/7)

Render is a great platform for hosting Discord bots 24/7.

1.  **Push your project to GitHub.** (You should have already done this or are in the process).

2.  **Create a new Web Service on Render:**
    - Go to [https://render.com/](https://render.com/) and log in.
    - Click "New" -> "Web Service".
    - Connect your GitHub account and select your bot's repository.
    - **Root Directory:** If `index.js` is in `my-discord-bot/`, set this to `my-discord-bot`. If `index.js` is directly at the repository root, leave it blank.
    - **Runtime:** `Node`
    - **Build Command:** `npm install`
    - **Start Command:** `node index.js`
    - **Environment Variables:** Add `DISCORD_TOKEN` with your bot's token as the value.
    - **Instance Type:** For continuous 24/7 operation, you will need a **paid instance** (e.g., "Starter") on Render. The free tier will automatically spin down your bot after inactivity.

3.  **Set up Uptime Monitoring (for Free Tier):**
    If you're using Render's free tier and want to maximize uptime, use a service like [UptimeRobot](https://uptimerobot.com/):
    - Create an account on UptimeRobot.
    - Add a new `HTTP(s)` monitor.
    - Set the `URL` to your Render service's URL (e.g., `https://your-bot-name.onrender.com/`).
    - Set the `Monitoring Interval` to 5 minutes (or less).
    This will ping your bot periodically, keeping it awake.

## Contributing

Feel free to fork this repository and submit pull requests.

## License

This project is open-source. Please add your desired license here (e.g., MIT, Apache 2.0). #   b o - d s i c r o e 
 
 
