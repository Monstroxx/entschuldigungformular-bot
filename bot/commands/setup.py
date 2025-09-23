"""Setup Command für Initialkonfiguration."""

import discord
from discord import app_commands
from discord.ext import commands
import logging

logger = logging.getLogger(__name__)


class SetupCommand(commands.Cog):
    """Setup Command für die Initialkonfiguration des Bots."""
    
    def __init__(self, bot, db_manager=None):
        self.bot = bot
        self.db_manager = db_manager or bot.db_manager
    
    @app_commands.command(name="setup", description="Initialkonfiguration des Bots")
    async def setup(self, interaction: discord.Interaction):
        """Startet die Initialkonfiguration."""
        try:
            # Erstelle Modal für Setup
            modal = SetupModal(self.bot)
            await interaction.response.send_modal(modal)
        except Exception as e:
            logger.error(f"Fehler beim Setup: {e}")
            if not interaction.response.is_done():
                await interaction.response.send_message(
                    "❌ Fehler beim Starten des Setups. Bitte versuche es erneut.",
                    ephemeral=True
                )
            else:
                await interaction.followup.send(
                    "❌ Fehler beim Starten des Setups. Bitte versuche es erneut.",
                    ephemeral=True
                )


class SetupModal(discord.ui.Modal, title="Bot Setup"):
    """Modal für die Initialkonfiguration."""
    
    def __init__(self, bot):
        super().__init__()
        self.bot = bot
    
    # Deine persönlichen Daten
    first_name = discord.ui.TextInput(
        label="Dein Vorname",
        placeholder="z.B. Max",
        required=True,
        max_length=50
    )
    
    last_name = discord.ui.TextInput(
        label="Dein Nachname", 
        placeholder="z.B. Mustermann",
        required=True,
        max_length=50
    )
    
    # Lehrer-Daten
    teacher_first_name = discord.ui.TextInput(
        label="Vorname deines Klassenlehrers",
        placeholder="z.B. Hans",
        required=True,
        max_length=50
    )
    
    teacher_last_name = discord.ui.TextInput(
        label="Nachname deines Klassenlehrers",
        placeholder="z.B. Müller",
        required=True,
        max_length=50
    )
    
    async def on_submit(self, interaction: discord.Interaction):
        """Wird aufgerufen, wenn das Modal abgesendet wird."""
        try:
            # Speichere Benutzerdaten
            user = self.bot.db_manager.get_user_by_discord_id(str(interaction.user.id))
            
            if not user:
                # Erstelle neuen Benutzer
                user = self.bot.db_manager.create_user(
                    discord_id=str(interaction.user.id),
                    first_name=self.first_name.value,
                    last_name=self.last_name.value
                )
            else:
                # Aktualisiere bestehenden Benutzer
                self.bot.db_manager.update_user(
                    discord_id=str(interaction.user.id),
                    first_name=self.first_name.value,
                    last_name=self.last_name.value,
                    teacher_first_name=self.teacher_first_name.value,
                    teacher_last_name=self.teacher_last_name.value
                )
            
            # Erstelle Embed mit Bestätigung
            embed = discord.Embed(
                title="✅ Setup erfolgreich abgeschlossen!",
                description="Deine Daten wurden gespeichert.",
                color=0x00ff00
            )
            
            embed.add_field(
                name="Deine Daten",
                value=f"**Name:** {self.first_name.value} {self.last_name.value}",
                inline=False
            )
            
            embed.add_field(
                name="Lehrer-Daten", 
                value=f"**Klassenlehrer:** {self.teacher_first_name.value} {self.teacher_last_name.value}",
                inline=False
            )
            
            embed.add_field(
                name="Nächste Schritte",
                value="• Verwende `/import` um deinen Stundenplan hochzuladen\n"
                      "• Verwende `/start` um ein Entschuldigungsformular zu erstellen\n"
                      "• Verwende `/help` für weitere Informationen",
                inline=False
            )
            
            await interaction.response.send_message(embed=embed, ephemeral=True)
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Setup-Daten: {e}")
            await interaction.response.send_message(
                "❌ Fehler beim Speichern der Daten. Bitte versuche es erneut.",
                ephemeral=True
            )


async def setup(bot):
    """Lädt den Setup Command."""
    await bot.add_cog(SetupCommand(bot))
