require('dotenv').config();
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionReplyBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
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

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      if (interaction.commandName === 'fix') {
        await interaction.deferReply(); // No ephemeral property
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
      }
    } else if (interaction.isButton()) {
      const [action, userId] = interaction.customId.split('_');
      if (action === 'delete') {
        if (interaction.user.id === userId || interaction.member?.permissions.has('Administrator')) {
          await interaction.message.delete();
        } else {
          await interaction.reply({
            content: 'Only the original user or admins can delete this!',
            flags: [InteractionReplyBits.Ephemeral] // ✅ Use flags for ephemeral
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: '❌ An error occurred!',
        flags: [InteractionReplyBits.Ephemeral] // ✅
      });
    } else {
      await interaction.reply({
        content: '❌ An error occurred!',
        flags: [InteractionReplyBits.Ephemeral] // ✅
      });
    }
  }
});

client.on('ready', () => {
  console.log(`✅ ${client.user.tag} is online!`);
});

client.login(process.env.DISCORD_TOKEN);