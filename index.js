require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required to read message content
    GatewayIntentBits.DirectMessages,
  ],
});

// URL replacement logic
const fixUrl = (url) => {
  const replacements = {
    'twitter.com': 'fxtwitter.com',
    'x.com': 'fxtwitter.com',
    'instagram.com': 'ddinstagram.com',
    'pixiv.net': 'phixiv.net',
  };
  return url.replace(
    new RegExp(Object.keys(replacements).join('|'), 'gi'),
    (match) => replacements[match.toLowerCase()]
  );
};

// Auto-detect links in messages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages

  // Regex to detect supported URLs
  const urlRegex = /(https?:\/\/(?:twitter\.com|x\.com|instagram\.com|pixiv\.net)\/\S+)/gi;
  const matches = message.content.match(urlRegex);

  if (matches) {
    try {
      // Delete original message
      await message.delete();

      // Fix all URLs in the message
      let fixedContent = message.content;
      matches.forEach(url => {
        fixedContent = fixedContent.replace(url, fixUrl(url));
      });

      // Create delete button
      const deleteButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`delete_${message.author.id}`)
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger)
      );

      // Send fixed message with button
      const sentMessage = await message.channel.send({
        content: fixedContent,
        components: [deleteButton]
      });

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }
});

// Handle button clicks (for both slash commands and auto-detected messages)
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  const [action, userId] = interaction.customId.split('_');
  if (action === 'delete') {
    if (interaction.user.id === userId || interaction.member?.permissions.has('Administrator')) {
      await interaction.message.delete();
    } else {
      await interaction.reply({
        content: 'Only the original poster or admins can delete this!',
        ephemeral: true
      });
    }
  }
});

// Existing slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'fix') {
    try {
      await interaction.deferReply();
      const url = interaction.options.getString('url');
      const fixedUrl = fixUrl(url);

      const deleteButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`delete_${interaction.user.id}`)
          .setLabel('Delete')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({
        content: fixedUrl,
        components: [deleteButton],
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply('❌ Failed to process the URL.');
    }
  }
});

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

client.login(process.env.DISCORD_TOKEN);