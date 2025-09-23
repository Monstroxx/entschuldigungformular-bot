"""Formular Filler für den Entschuldigungsformular Bot."""

import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

from .real_template import RealFormTemplate
from ..database import DatabaseManager

logger = logging.getLogger(__name__)


class FormFiller:
    """Füllt Entschuldigungsformulare automatisch aus."""
    
    def __init__(self, db_manager: DatabaseManager, template_path: str = None):
        """Initialisiert den FormFiller."""
        self.db_manager = db_manager
        self.template = RealFormTemplate(template_path)
    
    async def create_excuse_form(self, discord_id: str, first_name: str, last_name: str, 
                                reason: str, absence_periods: List[Dict[str, Any]]) -> Optional[str]:
        """Erstellt ein vollständiges Entschuldigungsformular."""
        try:
            # Hole Benutzerdaten
            user = self.db_manager.get_user_by_discord_id(discord_id)
            if not user:
                logger.error(f"Benutzer {discord_id} nicht gefunden")
                return None
            
            # Hole Stundenplan
            schedule = self.db_manager.get_user_schedule(discord_id)
            schedule_data = [{"hour": s.hour, "subject": s.subject} for s in schedule]
            
            # Berechne Start- und Enddatum
            start_date = min(period["start"] for period in absence_periods)
            end_date = max(period["end"] for period in absence_periods)
            
            # Bereite Daten vor
            form_data = {
                "first_name": first_name,
                "last_name": last_name,
                "reason": reason,
                "start_date": start_date.strftime("%d.%m.%Y"),
                "end_date": end_date.strftime("%d.%m.%Y"),
                "current_date": datetime.now().strftime("%d.%m.%Y"),
                "school_name": "Gymnasium Bergisch Gladbach",
                "class_name": "",  # Könnte später aus Benutzerdaten kommen
                "teacher_lastname": user.teacher_last_name or "",
                "schedule": schedule_data,
                "absence_periods": absence_periods
            }
            
            # Fülle Template aus
            doc = self.template.fill_template(form_data)
            
            # Generiere Dateiname
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"entschuldigung_{first_name}_{last_name}_{timestamp}.docx"
            
            # Speichere Dokument
            file_path = self.template.save_document(doc, filename)
            
            # Speichere in Datenbank
            self.db_manager.create_excuse_form(
                discord_id=discord_id,
                reason=reason,
                start_date=start_date,
                end_date=end_date
            )
            
            logger.info(f"Formular erfolgreich erstellt: {file_path}")
            return file_path
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Formulars: {e}")
            return None
    
    def validate_absence_periods(self, absence_periods: List[Dict[str, Any]]) -> bool:
        """Validiert die Fehlzeiten."""
        if not absence_periods:
            return False
        
        for period in absence_periods:
            if "start" not in period or "end" not in period:
                return False
            
            if period["start"] > period["end"]:
                return False
        
        return True
    
    def format_schedule_for_display(self, schedule: List[Dict[str, str]]) -> str:
        """Formatiert den Stundenplan für die Anzeige."""
        if not schedule:
            return "Kein Stundenplan vorhanden"
        
        formatted = []
        for item in schedule:
            formatted.append(f"• {item['hour']}: {item['subject']}")
        
        return "\n".join(formatted)
    
    def calculate_total_absence_days(self, absence_periods: List[Dict[str, Any]]) -> int:
        """Berechnet die Gesamtanzahl der Fehltage."""
        total_days = 0
        
        for period in absence_periods:
            start = period["start"]
            end = period["end"]
            days = (end - start).days + 1
            total_days += days
        
        return total_days
