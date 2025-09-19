"""Import Command für den Entschuldigungsformular Bot."""

import discord
from discord import app_commands
from discord.ext import commands
import pandas as pd
import io
from typing import Optional
import logging

from ..database import DatabaseManager

logger = logging.getLogger(__name__)


class ImportCommand(commands.Cog):
    """Import Command Cog für Stundenplan-Upload."""
    
    def __init__(self, bot: commands.Bot, db_manager: DatabaseManager):
        self.bot = bot
        self.db_manager = db_manager
    
    @app_commands.command(name="import", description="Lade deinen Stundenplan hoch")
    async def import_schedule(self, interaction: discord.Interaction, file: discord.Attachment):
        """Importiert einen Stundenplan aus einer CSV/Excel Datei."""
        
        # Validiere Dateityp
        if not file.filename.lower().endswith(('.csv', '.xlsx', '.xls')):
            await interaction.response.send_message(
                "❌ Ungültiger Dateityp! Bitte lade eine CSV oder Excel Datei hoch.",
                ephemeral=True
            )
            return
        
        # Validiere Dateigröße (max 1MB)
        if file.size > 1024 * 1024:
            await interaction.response.send_message(
                "❌ Datei ist zu groß! Maximum: 1MB",
                ephemeral=True
            )
            return
        
        await interaction.response.defer(ephemeral=True)
        
        try:
            # Lade Datei herunter
            file_content = await file.read()
            
            # Parse Datei basierend auf Typ
            if file.filename.lower().endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content), encoding='utf-8')
            else:  # Excel
                df = pd.read_excel(io.BytesIO(file_content))
            
            # Validiere Format
            if len(df.columns) < 2:
                await interaction.followup.send(
                    "❌ Ungültiges Format! Die Datei muss mindestens 2 Spalten haben (Stunde, Fach).",
                    ephemeral=True
                )
                return
            
            if len(df) > 8:
                await interaction.followup.send(
                    "❌ Zu viele Zeilen! Maximum: 8 Zeilen.",
                    ephemeral=True
                )
                return
            
            # Konvertiere zu Schedule Format
            schedule_data = []
            for _, row in df.iterrows():
                hour = str(row.iloc[0]).strip()
                subject = str(row.iloc[1]).strip()
                
                if hour and subject and hour != 'nan' and subject != 'nan':
                    schedule_data.append({
                        "hour": hour,
                        "subject": subject
                    })
            
            if not schedule_data:
                await interaction.followup.send(
                    "❌ Keine gültigen Daten gefunden! Bitte überprüfe deine Datei.",
                    ephemeral=True
                )
                return
            
            # Speichere in Datenbank
            success = self.db_manager.save_schedule(
                str(interaction.user.id),
                schedule_data
            )
            
            if success:
                embed = discord.Embed(
                    title="✅ Stundenplan erfolgreich importiert!",
                    description=f"Dein Stundenplan wurde mit {len(schedule_data)} Einträgen gespeichert.",
                    color=0x00ff00
                )
                
                # Zeige importierte Daten
                schedule_text = "\n".join([f"• {item['hour']}: {item['subject']}" for item in schedule_data])
                embed.add_field(
                    name="Importierte Stunden",
                    value=schedule_text[:1024],  # Discord Limit
                    inline=False
                )
                
                embed.add_field(
                    name="Nächste Schritte",
                    value="Verwende `/start` um ein Entschuldigungsformular zu erstellen. Dein Stundenplan wird automatisch eingefügt!",
                    inline=False
                )
                
                await interaction.followup.send(embed=embed, ephemeral=True)
            else:
                await interaction.followup.send(
                    "❌ Fehler beim Speichern des Stundenplans. Bitte versuche es erneut.",
                    ephemeral=True
                )
        
        except Exception as e:
            logger.error(f"Fehler beim Importieren des Stundenplans: {e}")
            await interaction.followup.send(
                "❌ Fehler beim Verarbeiten der Datei. Bitte überprüfe das Format und versuche es erneut.",
                ephemeral=True
            )
    
    @import_schedule.error
    async def import_schedule_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        """Error Handler für Import Command."""
        logger.error(f"Import Command Error: {error}")
        await interaction.response.send_message(
            "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
            ephemeral=True
        )
