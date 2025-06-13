require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const http = require('http');

const VOICE_CHANNEL_ID = '1382150540166828092'; // Your specified voice channel ID
const RADIO_URL = 'https://vpr.streamguys1.com/vpr64.mp3'; // Radio stream URL

const REACTION_CHANNEL_ID = '1382114401347178546'; // <<< CHANGE THIS to the ID of the channel where you want reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '✨']; // The emojis to react with

const radioStreams = {
  maroc: 'https://stream.zeno.fm/radio/pop-music-morocco',
  aswat: 'http://broadcast.infomaniak.ch/aswat-high.mp3',
  usa: 'http://stream.radioparadise.com/aac-320',
  bbc: 'https://vpr.streamguys1.com/vpr64.mp3'
};

let connection, player; // Declare connection and player globally

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const prefix = '!'; // You can change this to any character or string

async function setupVoice() {
  const targetGuild = client.guilds.cache.first();
  if (!targetGuild) {
    return console.error('Bot is not in any guilds to join a voice channel automatically.');
  }

  const channel = targetGuild.channels.cache.get(VOICE_CHANNEL_ID);
  if (!channel || !channel.isVoiceBased() || !channel.joinable) {
    return console.error(`❌ Cannot join the voice channel with ID ${VOICE_CHANNEL_ID}. Check ID and permissions.`);
  }

  // Check if the bot has permissions to connect to this voice channel
  const permissions = channel.permissionsFor(client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return console.error(`I need the "Connect" and "Speak" permissions in voice channel ${channel.name} to auto-join and play radio!`);
  }

  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      // Attempt to reconnect if disconnected
      await entersState(connection, VoiceConnectionStatus.Signalling, 5_000); // Wait for signalling
    } catch {
      // If signalling fails, destroy connection and try to set up voice again
      connection.destroy();
      console.log('Attempting to re-setup voice connection...');
      setupVoice();
    }
  });

  player = createAudioPlayer();
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('Audio player is idle, restarting stream...');
    playStream(); // Restart stream automatically when idle
  });

  player.on('error', error => {
    console.error('🔊 Player error:', error);
    playStream(); // Attempt to restart stream on error
  });

  playStream(); // Start playing the radio stream

  // Wait for the connection to be fully ready
  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
    console.log(`Successfully connected to voice channel: ${channel.name}!`);
  } catch (error) {
    console.error('Error waiting for voice connection to become ready:', error);
  }
}

function playStream() {
  const resource = createAudioResource(RADIO_URL, { inlineVolume: true });
  resource.volume.setVolume(0.2); // Set initial volume (0.2 = 20%)
  player.play(resource);
}

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  setupVoice(); // Call setupVoice on bot ready

  // Start the HTTP server to keep the bot alive
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Discord bot is alive!');
  }).listen(process.env.PORT || 3000, () => {
    console.log(`HTTP server listening on port ${process.env.PORT || 3000}`);
  });
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  // Check if the message is in the specific channel for reactions
  if (message.channel.id === REACTION_CHANNEL_ID) {
    for (const emoji of REACTION_EMOJIS) {
      message.react(emoji).catch(console.error);
    }
  }

  // Check if the message starts with the prefix
  if (!message.content.startsWith(prefix)) return;

  const cmd = message.content.slice(prefix.length).toLowerCase().trim();

  if (cmd in radioStreams) {
    if (!player) return message.reply('🔊 Audio player not ready yet.');
    player.stop();

    const resource = createAudioResource(radioStreams[cmd], { inlineVolume: true });
    resource.volume.setVolume(0.2);
    player.play(resource);

    return message.reply(`📻 Now playing **${cmd.toUpperCase()}** radio.`);
  }

  // Extract the command and arguments
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Command handling
  if (command === 'ping') {
    message.reply('Pong! 🏓');
  } else if (command === 'welcome') {
    message.reply('welcome to Nuvira serve!');
  } else if (command === 'echo') {
    // Joins all arguments back into a single string for the echo command
    const echoMessage = args.join(' ');
    if (echoMessage) {
      message.channel.send(echoMessage);
    } else {
      message.reply('What do you want me to echo? Usage: `!echo <your message>`');
    }
  } else if (command === 'kick') {
    // Check if the user has permission to kick members
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('You don\'t have permission to kick members!');
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply('Please mention the user you want to kick.');
    }

    if (!member.kickable) {
      return message.reply('I cannot kick this user. Check my permissions or their role hierarchy.');
    }

    member.kick()
      .then(() => message.reply(`${member.user.tag} has been kicked.`))
      .catch(error => {
        console.error('Error kicking member:', error);
        message.reply('There was an error trying to kick the member.');
      });
  } else if (command === 'ban') {
    // Check if the user has permission to ban members
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You don\'t have permission to ban members!');
    }

    const member = message.mentions.members.first();

    if (!member) {
      return message.reply('Please mention the user you want to ban.');
    }

    if (!member.bannable) {
      return message.reply('I cannot ban this user. Check my permissions or their role hierarchy.');
    }

    member.ban()
      .then(() => message.reply(`${member.user.tag} has been banned.`))
      .catch(error => {
        console.error('Error banning member:', error);
        message.reply('There was an error trying to ban the member.');
      });
  } else if (command === 'addrole') {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You don\'t have permission to manage roles!');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to add the role to.');
    }

    const roleName = args.slice(1).join(' ');
    if (!roleName) {
      return message.reply('Please provide the role name.');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      return message.reply(`Role \`${roleName}\` not found.`);
    }

    if (member.roles.cache.has(role.id)) {
      return message.reply(`${member.user.tag} already has the \`${roleName}\` role.`);
    }

    member.roles.add(role)
      .then(() => message.reply(`Added \`${roleName}\` to ${member.user.tag}.`))
      .catch(error => {
        console.error('Error adding role:', error);
        message.reply('There was an error trying to add the role.');
      });
  } else if (command === 'removerole') {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('You don\'t have permission to manage roles!');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to remove the role from.');
    }

    const roleName = args.slice(1).join(' ');
    if (!roleName) {
      return message.reply('Please provide the role name.');
    }

    const role = message.guild.roles.cache.find(r => r.name === roleName);

    if (!role) {
      return message.reply(`Role \`${roleName}\` not found.`);
    }

    if (!member.roles.cache.has(role.id)) {
      return message.reply(`${member.user.tag} does not have the \`${roleName}\` role.`);
    }

    member.roles.remove(role)
      .then(() => message.reply(`Removed \`${roleName}\` from ${member.user.tag}.`))
      .catch(error => {
        console.error('Error removing role:', error);
        message.reply('There was an error trying to remove the role.');
      });
  } else if (command === 'help') {
    const helpEmbed = {
      color: 0x0099ff, // A nice blue color
      title: 'Nuvira Bot Commands',
      description: 'Hey there! I\'m Nuvira, your friendly bot. Here\'s what I can do:',
      image: {
        url: 'https://i.ibb.co/dCLQtfq/Nuvira-banner.png',
      },
      fields: [
        {
          name: 'General Commands',
          value: `
**${prefix}ping**: See if I'm awake and responsive! (I'll reply with 'Pong! 🏓')
**${prefix}welcome**: Get a warm greeting to the Nuvira server.
**${prefix}echo <your message>**: I'll repeat whatever you say after the command.
          `,
          inline: false,
        },
        {
          name: 'Radio Commands',
          value: `
**${prefix}maroc**: Tune into Radio Maroc.
**${prefix}aswat**: Listen to Aswat Radio.
**${prefix}usa**: Enjoy tunes from USA Radio.
**${prefix}bbc**: Catch the BBC Radio stream.
          `,
          inline: false,
        },
        {
          name: 'Voice Commands',
          value: `
**${prefix}stop**: Stop the currently playing radio stream.
**${prefix}leave**: Make the bot leave the voice channel.
          `,
          inline: false,
        },
        {
          name: 'Moderation Commands (Admin permissions required)',
          value: `
**${prefix}kick <@user>**: Remove a problematic user from the server.
**${prefix}ban <@user>**: Permanently ban a user from the server.
**${prefix}addrole <@user> <role name>**: Grant a specific role to a user.
**${prefix}removerole <@user> <role name>**: Take away a specific role from a user.
          `,
          inline: false,
        },
        {
          name: 'Need More Help?',
          value: `
**${prefix}help**: You're looking at it! Displays this handy guide.
          `,
          inline: false,
        },
      ],
      timestamp: new Date(),
      footer: {
        text: 'Nuvira Bot',
      },
    };
    message.channel.send({ embeds: [helpEmbed] });
  } else if (command === 'stop') {
    if (player && player.state.status !== AudioPlayerStatus.Idle) {
      player.stop();
      message.reply('Radio stream stopped. 🔇');
    } else {
      message.reply('No radio stream is currently playing.');
    }
  } else if (command === 'leave') {
    if (connection) {
      connection.destroy();
      connection = null; // Clear the connection variable
      message.reply('Left the voice channel. 👋');
    } else {
      message.reply('I am not currently in a voice channel.');
    }
  }
  // You can add more 'else if' blocks for new commands here
});

client.on('guildCreate', guild => {
  console.log(`Joined a new guild: ${guild.name} (ID: ${guild.id}). Member count: ${guild.memberCount}`);
  // You could also send a welcome message to a specific channel in the guild here
});

client.on('guildDelete', guild => {
  console.log(`Left a guild: ${guild.name} (ID: ${guild.id})`);
});

client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error("Failed to login to Discord:", error);
});