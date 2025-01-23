require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

//webhook and url replacement 

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_TOKEN);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore bots
  
    // Replace URLs
    const urlMap = {
      'twitter.com': 'fxtwitter.com',
      'x.com': 'fxtwitter.com',
      'instagram.com': 'ddinstagram.com',
      'pixiv.net': 'phixiv.net',
    };
  
    let modifiedContent = message.content;
    for (const [original, replacement] of Object.entries(urlMap)) {
      modifiedContent = modifiedContent.replace(
        new RegExp(original, 'gi'),
        replacement
      );
    }
  
    // If urls modified proceed
    if (modifiedContent !== message.content) {
      // Delete original message
      await message.delete().catch(console.error);
  
      // Resend via webhook
      const webhook = await message.channel.createWebhook({
        name: message.author.username,
        avatar: message.author.displayAvatarURL(),
      });
  
      await webhook.send({
        content: modifiedContent,
      });
  
      // Delete the webhook after use
      await webhook.delete();
  
      // Add a reaction for deletion
      const sentMessage = await message.channel.send('Fixed embed!');
      await sentMessage.react('❌');
    }
    // nsfw filtering
    if (
        modifiedContent.includes('phixiv.net') &&
        !message.channel.nsfw
      ) {
        await message.channel.send('R-18 content is blocked in non-NSFW channels!');
        return;
      }
  });
  
  //reaction listnere
  client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.emoji.name === '❌' && !user.bot) {
      await reaction.message.delete().catch(console.error);
    }
  });

  const db = require('./database.js');

  // Example: Disable a channel
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
  
    if (interaction.commandName === 'disable') {
      const guildId = interaction.guild.id;
      const channelId = interaction.channel.id;
  
      // Fetch current disabled channels
      const settings = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId);
      let disabledChannels = settings ? JSON.parse(settings.disabled_channels) : [];
  
      // Add channel to disabled list
      disabledChannels.push(channelId);
      db.prepare('INSERT OR REPLACE INTO guild_settings (guild_id, disabled_channels) VALUES (?, ?)')
        .run(guildId, JSON.stringify(disabledChannels));
  
      await interaction.reply(`Embed fixing disabled in this channel.`);
    }
  });
  