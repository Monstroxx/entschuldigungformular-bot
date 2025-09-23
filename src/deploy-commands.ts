import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

// Load environment variables
config();

const commands = [
  {
    name: 'setup',
    description: 'Initialkonfiguration des Bots',
  },
  {
    name: 'start',
    description: 'Erstelle ein neues Entschuldigungsformular',
  },
  {
    name: 'import',
    description: 'Lade deinen Stundenplan hoch',
    options: [
      {
        name: 'file',
        description: 'CSV-Datei mit deinem Stundenplan',
        type: 11, // Attachment
        required: true,
      },
    ],
  },
  {
    name: 'help',
    description: 'Zeige Hilfe und verfügbare Befehle',
  },
  {
    name: 'info',
    description: 'Zeigt Bot-Informationen und Statistiken',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('🔄 Registriere Slash Commands...');

    if (process.env.DISCORD_GUILD_ID) {
      // Guild-specific commands (faster for development)
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
        { body: commands }
      );
      console.log('✅ Guild Commands erfolgreich registriert!');
    } else {
      // Global commands (takes up to 1 hour to propagate)
      await rest.put(
        Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commands }
      );
      console.log('✅ Global Commands erfolgreich registriert!');
    }
  } catch (error) {
    console.error('❌ Fehler beim Registrieren der Commands:', error);
  }
})();
