"""Start Command für den Entschuldigungsformular Bot."""

import discord
from discord import app_commands, ui
from discord.ext import commands
from datetime import datetime, timedelta
from typing import Optional, List
import logging

from ..database import DatabaseManager
from ..form import FormFiller
from ..utils import PDFConverter

logger = logging.getLogger(__name__)


class ExcuseFormModal(ui.Modal, title="Entschuldigungsformular erstellen"):
    """Modal für die Eingabe der Grunddaten."""
    
    def __init__(self, db_manager: DatabaseManager, form_filler: FormFiller):
        super().__init__()
        self.db_manager = db_manager
        self.form_filler = form_filler
        self.pdf_converter = PDFConverter()
    
    first_name = ui.TextInput(
        label="Vorname",
        placeholder="Dein Vorname",
        required=True,
        max_length=50
    )
    
    last_name = ui.TextInput(
        label="Nachname", 
        placeholder="Dein Nachname",
        required=True,
        max_length=50
    )
    
    reason = ui.TextInput(
        label="Grund der Abwesenheit",
        placeholder="z.B. Krankheit, Arzttermin, etc.",
        required=True,
        max_length=500,
        style=discord.TextStyle.paragraph
    )
    
    async def on_submit(self, interaction: discord.Interaction):
        """Wird aufgerufen wenn das Modal abgesendet wird."""
        await interaction.response.defer(ephemeral=True)
        
        # Speichere Benutzerdaten
        self.db_manager.update_user(
            str(interaction.user.id),
            first_name=self.first_name.value,
            last_name=self.last_name.value
        )
        
        # Erstelle Datum/Zeit Auswahl View
        view = DateTimeSelectionView(
            self.db_manager,
            self.form_filler,
            self.first_name.value,
            self.last_name.value,
            self.reason.value
        )
        
        embed = discord.Embed(
            title="📅 Wähle deine Fehlzeiten",
            description="Wähle das Datum und die Uhrzeit deiner Abwesenheit:",
            color=0x0099ff
        )
        
        await interaction.followup.send(embed=embed, view=view, ephemeral=True)


class DateTimeSelectionView(ui.View):
    """View für die Datum/Zeit Auswahl."""
    
    def __init__(self, db_manager: DatabaseManager, form_filler: FormFiller, 
                 first_name: str, last_name: str, reason: str):
        super().__init__(timeout=300)  # 5 Minuten Timeout
        self.db_manager = db_manager
        self.form_filler = form_filler
        self.first_name = first_name
        self.last_name = last_name
        self.reason = reason
        self.absence_periods = []
    
    @ui.button(label="Heute hinzufügen", style=discord.ButtonStyle.primary, emoji="📅")
    async def add_today(self, interaction: discord.Interaction, button: ui.Button):
        """Fügt heute als Fehlzeit hinzu."""
        today = datetime.now().date()
        self.absence_periods.append({
            "start": today,
            "end": today,
            "start_time": "08:00",
            "end_time": "15:00"
        })
        
        await self.update_embed(interaction)
    
    @ui.button(label="Gestern hinzufügen", style=discord.ButtonStyle.secondary, emoji="📅")
    async def add_yesterday(self, interaction: discord.Interaction, button: ui.Button):
        """Fügt gestern als Fehlzeit hinzu."""
        yesterday = (datetime.now() - timedelta(days=1)).date()
        self.absence_periods.append({
            "start": yesterday,
            "end": yesterday,
            "start_time": "08:00",
            "end_time": "15:00"
        })
        
        await self.update_embed(interaction)
    
    @ui.button(label="Benutzerdefiniert", style=discord.ButtonStyle.secondary, emoji="⚙️")
    async def add_custom(self, interaction: discord.Interaction, button: ui.Button):
        """Öffnet Modal für benutzerdefinierte Datum/Zeit."""
        modal = CustomDateTimeModal(self)
        await interaction.response.send_modal(modal)
    
    @ui.button(label="Formular erstellen", style=discord.ButtonStyle.success, emoji="✅")
    async def create_form(self, interaction: discord.Interaction, button: ui.Button):
        """Erstellt das finale Formular."""
        if not self.absence_periods:
            await interaction.response.send_message(
                "❌ Bitte füge mindestens eine Fehlzeit hinzu!",
                ephemeral=True
            )
            return
        
        await interaction.response.defer(ephemeral=True)
        
        try:
            # Erstelle Formular
            file_path = await self.form_filler.create_excuse_form(
                discord_id=str(interaction.user.id),
                first_name=self.first_name,
                last_name=self.last_name,
                reason=self.reason,
                absence_periods=self.absence_periods
            )
            
            if file_path:
                # Konvertiere zu PDF
                pdf_path = self.pdf_converter.convert_docx_to_pdf(file_path)
                
                if pdf_path:
                    # Sende PDF als Datei
                    file = discord.File(pdf_path, filename="Entschuldigungsformular.pdf")
                    file_type = "PDF"
                else:
                    # Fallback: Sende DOCX
                    file = discord.File(file_path, filename="Entschuldigungsformular.docx")
                    file_type = "DOCX"
                
                embed = discord.Embed(
                    title="✅ Formular erfolgreich erstellt!",
                    description=f"Dein Entschuldigungsformular wurde als {file_type} generiert und ist bereit zum Download.",
                    color=0x00ff00
                )
                
                embed.add_field(
                    name="Details",
                    value=f"**Name:** {self.first_name} {self.last_name}\n"
                          f"**Grund:** {self.reason}\n"
                          f"**Fehlzeiten:** {len(self.absence_periods)}\n"
                          f"**Format:** {file_type}",
                    inline=False
                )
                
                await interaction.followup.send(embed=embed, file=file, ephemeral=True)
                
                # Lösche temporäre Dateien
                self.pdf_converter.cleanup_temp_files(file_path)
                if pdf_path and pdf_path != file_path:
                    self.pdf_converter.cleanup_temp_files(pdf_path)
            else:
                await interaction.followup.send(
                    "❌ Fehler beim Erstellen des Formulars. Bitte versuche es erneut.",
                    ephemeral=True
                )
        
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Formulars: {e}")
            await interaction.followup.send(
                "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
                ephemeral=True
            )
    
    @ui.button(label="Abbrechen", style=discord.ButtonStyle.danger, emoji="❌")
    async def cancel(self, interaction: discord.Interaction, button: ui.Button):
        """Bricht die Formular-Erstellung ab."""
        await interaction.response.send_message(
            "❌ Formular-Erstellung abgebrochen.",
            ephemeral=True
        )
        self.stop()
    
    async def update_embed(self, interaction: discord.Interaction):
        """Aktualisiert das Embed mit den aktuellen Fehlzeiten."""
        embed = discord.Embed(
            title="📅 Fehlzeiten auswählen",
            description="Wähle die Tage deiner Abwesenheit:",
            color=0x0099ff
        )
        
        if self.absence_periods:
            periods_text = ""
            for i, period in enumerate(self.absence_periods, 1):
                start_str = period["start"].strftime("%d.%m.%Y")
                end_str = period["end"].strftime("%d.%m.%Y")
                if period["start"] == period["end"]:
                    periods_text += f"{i}. {start_str} ({period['start_time']} - {period['end_time']})\n"
                else:
                    periods_text += f"{i}. {start_str} bis {end_str}\n"
            
            embed.add_field(
                name="Ausgewählte Fehlzeiten",
                value=periods_text or "Keine ausgewählt",
                inline=False
            )
        
        embed.add_field(
            name="Aktionen",
            value="• **Heute hinzufügen** - Fügt heute als Fehlzeit hinzu\n"
                  "• **Gestern hinzufügen** - Fügt gestern als Fehlzeit hinzu\n"
                  "• **Benutzerdefiniert** - Wähle eigenes Datum/Zeit\n"
                  "• **Formular erstellen** - Erstelle das finale Formular",
            inline=False
        )
        
        await interaction.response.edit_message(embed=embed, view=self)


class CustomDateTimeModal(ui.Modal, title="Benutzerdefinierte Fehlzeit"):
    """Modal für benutzerdefinierte Datum/Zeit Eingabe."""
    
    def __init__(self, parent_view: DateTimeSelectionView):
        super().__init__()
        self.parent_view = parent_view
    
    start_date = ui.TextInput(
        label="Startdatum (DD.MM.YYYY)",
        placeholder="z.B. 15.01.2025",
        required=True,
        max_length=10
    )
    
    end_date = ui.TextInput(
        label="Enddatum (DD.MM.YYYY) - leer für gleichen Tag",
        placeholder="z.B. 15.01.2025 oder leer lassen",
        required=False,
        max_length=10
    )
    
    start_time = ui.TextInput(
        label="Startzeit (HH:MM)",
        placeholder="z.B. 08:00",
        required=True,
        max_length=5
    )
    
    end_time = ui.TextInput(
        label="Endzeit (HH:MM)",
        placeholder="z.B. 15:00",
        required=True,
        max_length=5
    )
    
    async def on_submit(self, interaction: discord.Interaction):
        """Validiert und fügt die benutzerdefinierte Fehlzeit hinzu."""
        try:
            # Parse Startdatum
            start_date = datetime.strptime(self.start_date.value, "%d.%m.%Y").date()
            
            # Parse Enddatum (falls leer, gleicher Tag)
            if self.end_date.value.strip():
                end_date = datetime.strptime(self.end_date.value, "%d.%m.%Y").date()
            else:
                end_date = start_date
            
            # Validiere Zeiten
            start_time = self.start_time.value
            end_time = self.end_time.value
            
            # Validiere Datum
            if end_date < start_date:
                await interaction.response.send_message(
                    "❌ Enddatum kann nicht vor dem Startdatum liegen!",
                    ephemeral=True
                )
                return
            
            # Füge zur Liste hinzu
            self.parent_view.absence_periods.append({
                "start": start_date,
                "end": end_date,
                "start_time": start_time,
                "end_time": end_time
            })
            
            await self.parent_view.update_embed(interaction)
            
        except ValueError as e:
            await interaction.response.send_message(
                "❌ Ungültiges Datum oder Zeit Format! Bitte verwende DD.MM.YYYY und HH:MM",
                ephemeral=True
            )


class StartCommand(commands.Cog):
    """Start Command Cog für die Formular-Erstellung."""
    
    def __init__(self, bot: commands.Bot, db_manager: DatabaseManager, form_filler: FormFiller):
        self.bot = bot
        self.db_manager = db_manager
        self.form_filler = form_filler
    
    @app_commands.command(name="start", description="Erstelle ein neues Entschuldigungsformular")
    async def start_form(self, interaction: discord.Interaction):
        """Startet den Prozess zur Erstellung eines Entschuldigungsformulars."""
        
        # Prüfe ob Benutzer existiert, erstelle falls nicht
        user = self.db_manager.get_user_by_discord_id(str(interaction.user.id))
        if not user:
            self.db_manager.create_user(str(interaction.user.id))
        
        # Öffne Modal für Grunddaten
        modal = ExcuseFormModal(self.db_manager, self.form_filler)
        await interaction.response.send_modal(modal)
    
    @start_form.error
    async def start_form_error(self, interaction: discord.Interaction, error: app_commands.AppCommandError):
        """Error Handler für Start Command."""
        logger.error(f"Start Command Error: {error}")
        await interaction.response.send_message(
            "❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
            ephemeral=True
        )
