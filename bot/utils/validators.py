"""Validatoren für den Entschuldigungsformular Bot."""

import re
from datetime import datetime
from typing import Optional, Tuple


def validate_date(date_string: str) -> Optional[datetime]:
    """Validiert ein Datum im Format DD.MM.YYYY."""
    try:
        return datetime.strptime(date_string, "%d.%m.%Y")
    except ValueError:
        return None


def validate_time(time_string: str) -> bool:
    """Validiert eine Zeit im Format HH:MM."""
    pattern = r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    return bool(re.match(pattern, time_string))


def validate_name(name: str) -> bool:
    """Validiert einen Namen."""
    if not name or len(name.strip()) < 2:
        return False
    
    # Nur Buchstaben, Leerzeichen, Bindestriche und Umlaute erlaubt
    pattern = r'^[a-zA-ZäöüÄÖÜß\s\-]+$'
    return bool(re.match(pattern, name.strip()))


def validate_reason(reason: str) -> bool:
    """Validiert einen Grund für die Abwesenheit."""
    if not reason or len(reason.strip()) < 3:
        return False
    
    # Mindestens 3 Zeichen, maximal 500
    return 3 <= len(reason.strip()) <= 500


def parse_date_range(start_date: str, end_date: str = None) -> Tuple[Optional[datetime], Optional[datetime]]:
    """Parst ein Datumsbereich."""
    start = validate_date(start_date)
    end = validate_date(end_date) if end_date else start
    
    if not start:
        return None, None
    
    if not end:
        end = start
    
    if end < start:
        return None, None
    
    return start, end


def format_date_for_display(date: datetime) -> str:
    """Formatiert ein Datum für die Anzeige."""
    return date.strftime("%d.%m.%Y")


def format_time_for_display(time_string: str) -> str:
    """Formatiert eine Zeit für die Anzeige."""
    try:
        # Validiere und formatiere Zeit
        if validate_time(time_string):
            return time_string
        else:
            return "Ungültig"
    except:
        return "Ungültig"
