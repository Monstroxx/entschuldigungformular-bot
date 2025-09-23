"""Haupt-Bot-Datei für den Entschuldigungsformular Discord Bot."""

import os
import logging
from datetime import datetime
from discord.ext import commands
from discord import Intents, Activity, ActivityType
import asyncio

from .database import DatabaseManager
from .form import FormFiller
from .commands import StartCommand, ImportCommand, HelpCommand
from .utils import HealthCheck

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('bot.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class EntschuldigungsformularBot(commands.Bot):
    """Haupt-Bot-Klasse für den Entschuldigungsformular Bot."""
    
    def __init__(self):
        """Initialisiert den Bot."""
        intents = Intents.default()
        intents.message_content = True
        
        super().__init__(
            command_prefix='?',
            intents=intents,
            help_command=None  # Deaktiviere Standard-Hilfe
        )
        
        # Initialisiere Komponenten
        self.db_manager = DatabaseManager()
        self.form_filler = FormFiller(self.db_manager)
        self.health_check = HealthCheck(self)
        
        # Bot-Informationen
        self.start_time = datetime.now()
    
    async def setup_hook(self):
        """Wird beim Start des Bots aufgerufen."""
        logger.info("Bot wird gestartet...")
        
        # Lade Commands
        await self.load_commands()
        
        # Sync Commands
        try:
            synced = await self.tree.sync()
            logger.info(f"Synced {len(synced)} command(s)")
        except Exception as e:
            logger.error(f"Failed to sync commands: {e}")
    
    async def load_commands(self):
        """Lädt alle Commands."""
        try:
            # Importiere und lade Commands
            from .commands.start import StartCommand
            from .commands.help import HelpCommand
            from .commands.import_cmd import ImportCommand
            from .commands.setup import SetupCommand
            
            # Füge Commands hinzu
            await self.add_cog(StartCommand(self, self.db_manager, self.form_filler))
            await self.add_cog(HelpCommand(self))
            await self.add_cog(ImportCommand(self, self.db_manager))
            await self.add_cog(SetupCommand(self))
            
            logger.info("Commands erfolgreich geladen")
        except Exception as e:
            logger.error(f"Fehler beim Laden der Commands: {e}")
    
    async def on_guild_join(self, guild):
        """Wird aufgerufen wenn der Bot einem Server beitritt."""
        logger.info(f"Bot beigetreten zu Server: {guild.name} (ID: {guild.id})")
        
        # Sync Commands für neuen Server
        try:
            synced = await self.tree.sync(guild=guild)
            logger.info(f"Synced {len(synced)} command(s) für Server {guild.name}")
        except Exception as e:
            logger.error(f"Failed to sync commands for guild {guild.name}: {e}")
    
    async def load_commands(self):
        """Lädt alle Bot-Commands."""
        try:
            # Lade Command Cogs
            await self.add_cog(StartCommand(self, self.db_manager, self.form_filler))
            await self.add_cog(ImportCommand(self, self.db_manager))
            await self.add_cog(HelpCommand(self))
            
            logger.info("Commands erfolgreich geladen")
        except Exception as e:
            logger.error(f"Fehler beim Laden der Commands: {e}")
    
    async def on_ready(self):
        """Wird aufgerufen wenn der Bot bereit ist."""
        logger.info(f"Bot ist online als {self.user} (ID: {self.user.id})")
        logger.info(f"Bot ist in {len(self.guilds)} Server(n) aktiv")
        
        # Setze Bot-Status
        await self.change_presence(
            activity=Activity(
                type=ActivityType.watching,
                name="/help für Hilfe"
            )
        )
        
        # Starte Health Check Server für Railway (nicht-blockierend)
        port = int(os.getenv("PORT", 8000))
        try:
            await self.health_check.start_server(port)
            logger.info(f"Health check server started on port {port}")
        except Exception as e:
            logger.warning(f"Failed to start health check server: {e}")
    
    async def on_command_error(self, ctx, error):
        """Error Handler für Commands."""
        logger.error(f"Command Error: {error}")
        
        if isinstance(error, commands.CommandNotFound):
            return  # Ignoriere unbekannte Commands
        
        await ctx.send(
            "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut oder verwende `/help` für Hilfe.",
            ephemeral=True
        )
    
    async def on_app_command_error(self, interaction, error):
        """Error Handler für Slash Commands."""
        logger.error(f"Slash Command Error: {error}")
        
        if not interaction.response.is_done():
            await interaction.response.send_message(
                "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
                ephemeral=True
            )
        else:
            await interaction.followup.send(
                "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
                ephemeral=True
            )
    
    def get_uptime(self) -> str:
        """Gibt die Uptime des Bots zurück."""
        uptime = datetime.now() - self.start_time
        days = uptime.days
        hours, remainder = divmod(uptime.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        return f"{days}d {hours}h {minutes}m {seconds}s"


async def main():
    """Hauptfunktion zum Starten des Bots."""
    # Lade Umgebungsvariablen
    from dotenv import load_dotenv
    load_dotenv()
    
    # Hole Bot Token
    token = os.getenv("DISCORD_TOKEN")
    if not token:
        logger.error("DISCORD_TOKEN nicht gefunden! Bitte setze die Umgebungsvariable.")
        return
    
    # Erstelle und starte Bot
    bot = EntschuldigungsformularBot()
    
    try:
        await bot.start(token)
    except KeyboardInterrupt:
        logger.info("Bot wird beendet...")
    except Exception as e:
        logger.error(f"Fehler beim Starten des Bots: {e}")
    finally:
        await bot.close()


if __name__ == "__main__":
    asyncio.run(main())
