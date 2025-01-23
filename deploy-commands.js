require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('@discordjs/builders');

// Define the slash command with DM support
const commands = [
  new SlashCommandBuilder()
    .setName('fix')
    .setDescription('Fix social media links to show embeds')
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('Twitter/Instagram/Pixiv URL')
        .setRequired(true)
    )

    .toJSON()
];

// Initialize REST client
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Deploy commands globally
(async () => {
  try {
    console.log('🔃 Deploying commands...');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    
    console.log('✅ Commands deployed successfully!');
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
})();