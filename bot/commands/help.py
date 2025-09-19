"""Help Command für den Entschuldigungsformular Bot."""

import discord
from discord import app_commands
from discord.ext import commands
from typing import Optional


class HelpCommand(commands.Cog):
    """Help Command Cog."""
    
    def __init__(self, bot: commands.Bot):
        self.bot = bot
    
    @app_commands.command(name="help", description="Zeigt Hilfe und Anweisungen an")
    async def help_command(self, interaction: discord.Interaction):
        """Zeigt Hilfe und Anweisungen an."""
        
        embed = discord.Embed(
            title="📋 Entschuldigungsformular Bot - Hilfe",
            description="Hier findest du alle verfügbaren Befehle und Anweisungen:",
            color=0x00ff00
        )
        
        # Commands Section
        embed.add_field(
            name="🔧 Verfügbare Befehle",
            value="""
            `/start` - Erstelle ein neues Entschuldigungsformular
            `/import` - Lade deinen Stundenplan hoch
            `/help` - Zeige diese Hilfe an
            """,
            inline=False
        )
        
        # Start Command Help
        embed.add_field(
            name="📝 /start - Formular erstellen",
            value="""
            Mit diesem Befehl kannst du ein neues Entschuldigungsformular erstellen:
            1. Gib deinen Vor- und Nachnamen ein
            2. Wähle den Grund für deine Abwesenheit
            3. Wähle das Datum und die Uhrzeit deiner Fehlzeiten
            4. Das Formular wird automatisch mit deinen Daten ausgefüllt
            """,
            inline=False
        )
        
        # Import Command Help
        embed.add_field(
            name="📊 /import - Stundenplan hochladen",
            value="""
            Lade deinen Stundenplan hoch, damit er automatisch in das Formular eingefügt wird:
            
            **Format:**
            - CSV oder Excel Datei (.csv, .xlsx)
            - Maximal 8 Zeilen
            - 2 Spalten: Stunde | Fach
            - Beispiel:
            ```
            1. Stunde | Mathematik
            2. Stunde | Deutsch
            3. Stunde | Englisch
            ```
            """,
            inline=False
        )
        
        # Tips
        embed.add_field(
            name="💡 Tipps",
            value="""
            • Dein Stundenplan wird automatisch in das Formular eingefügt
            • Ort wird automatisch auf "Bergisch Gladbach" gesetzt
            • Das aktuelle Datum wird automatisch eingefügt
            • Du kannst mehrere Fehlzeiten in einem Formular erfassen
            """,
            inline=False
        )
        
        embed.set_footer(text="Bei Problemen wende dich an den Bot-Administrator")
        
        await interaction.response.send_message(embed=embed, ephemeral=True)
