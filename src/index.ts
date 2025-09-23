import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import { setupCommands, handleSetupModal } from './commands/setup';
import { startCommand, handleStartModal } from './commands/start';
import { importCommand } from './commands/import';
import { helpCommand } from './commands/help';
import { infoCommand, handleInfoCommand } from './commands/info';
import { prisma } from './database/client';
import { HealthCheck } from './utils/health';

// Load environment variables
config();

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Command collection
(client as any).commands = new Collection();

// Health check server - start immediately for Railway
const healthCheck = new HealthCheck(parseInt(process.env.PORT || '8000'));
healthCheck.start();

// Bot ready event
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot ist online als ${readyClient.user.tag}!`);
  
  // Test database connection and create tables if needed
  try {
    await prisma.$connect();
    console.log('✅ Datenbank verbunden');
    
    // Try to create tables if they don't exist (only in production)
    if (process.env.NODE_ENV === 'production') {
      try {
        await prisma.user.findFirst();
        console.log('✅ Datenbank-Tabellen existieren');
      } catch (error: any) {
        if (error.code === 'P2021') {
          console.log('⚠️ Datenbank-Tabellen existieren nicht. Führe Migration aus...');
          // This will be handled by the start script on Railway
          console.log('Bitte führe "npm run db:push" aus, um die Tabellen zu erstellen.');
        } else {
          throw error;
        }
      }
    } else {
      console.log('⚠️ Lokale Entwicklung - Datenbank-Prüfung übersprungen');
    }

    // Set RPC status with generated forms count
    await updateBotStatus(readyClient);
  } catch (error) {
    console.error('❌ Datenbank-Verbindungsfehler:', error);
  }
});

// Function to update bot status with form count
async function updateBotStatus(client: Client) {
  try {
    const formCount = await prisma.excuseForm.count();
    const statusText = `📋 ${formCount} Krankmeldungen generiert`;
    
    client.user?.setPresence({
      activities: [{
        name: statusText,
        type: 3, // WATCHING
      }],
      status: 'online',
    });
    
    console.log(`✅ Bot Status gesetzt: ${statusText}`);
  } catch (error) {
    console.error('❌ Fehler beim Setzen des Bot-Status:', error);
  }
}

// Register commands
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const { commandName } = interaction;

      switch (commandName) {
        case 'setup':
          await setupCommands(interaction);
          break;
        case 'start':
          await startCommand(interaction);
          break;
        case 'import':
          await importCommand(interaction);
          break;
        case 'help':
          await helpCommand(interaction);
          break;
        case 'info':
          await handleInfoCommand(interaction);
          break;
        default:
          await interaction.reply({
            content: '❌ Unbekannter Command!',
            ephemeral: true,
          });
      }
    } else if (interaction.isModalSubmit()) {
      // Handle modal submissions
      if (interaction.customId === 'setup_modal') {
        await handleSetupModal(interaction);
      } else if (interaction.customId === 'start_form_modal') {
        await handleStartModal(interaction);
      }
    }
  } catch (error) {
    console.error('Fehler beim Verarbeiten der Interaktion:', error);
    
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ Ein Fehler ist aufgetreten!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ Ein Fehler ist aufgetreten!',
          ephemeral: true,
        });
      }
    }
  }
});

// Error handling
client.on('error', (error) => {
  console.error('Discord Client Error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
