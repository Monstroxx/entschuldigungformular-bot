#!/usr/bin/env python3
"""
Python Script für Template-Manipulation und Tabellen-Generierung
Wird vom TypeScript Bot aufgerufen
"""

import sys
import json
import os
from datetime import datetime
from docx import Document
from docx.shared import Inches
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH

def load_template(template_path):
    """Lädt das DOCX Template"""
    try:
        return Document(template_path)
    except Exception as e:
        print(f"Fehler beim Laden des Templates: {e}", file=sys.stderr)
        return None

def replace_placeholders(doc, data):
    """Ersetzt Platzhalter im Dokument"""
    # Ersetze alle Platzhalter im gesamten Dokument
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            text = run.text
            if '[NACHNAME]' in text:
                text = text.replace('[NACHNAME]', data.get('lastName', ''))
            if '[VORNAME]' in text:
                text = text.replace('[VORNAME]', data.get('firstName', ''))
            if '[GRUND]' in text:
                text = text.replace('[GRUND]', data.get('reason', ''))
            if '[ORT]' in text:
                text = text.replace('[ORT]', data.get('location', 'Bergisch Gladbach'))
            if '[DATUM]' in text:
                text = text.replace('[DATUM]', data.get('currentDate', ''))
            if '[LEHRER]' in text:
                text = text.replace('[LEHRER]', data.get('teacherLastName', 'Müller'))
            run.text = text

def find_table_placeholder(doc):
    """Findet den [TABELLE] Platzhalter im Dokument"""
    for paragraph in doc.paragraphs:
        for run in paragraph.runs:
            if '[TABELLE]' in run.text:
                return paragraph
    return None

def create_schedule_table(doc, data):
    """Erstellt eine Tabelle mit dem Stundenplan"""
    # Finde den Tabellen-Platzhalter
    placeholder_paragraph = find_table_placeholder(doc)
    if not placeholder_paragraph:
        print("Warnung: [TABELLE] Platzhalter nicht gefunden", file=sys.stderr)
        return

    # Erstelle Tabelle
    table = doc.add_table(rows=1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'

    # Header-Zeile
    header_cells = table.rows[0].cells
    header_cells[0].text = ''
    header_cells[1].text = ''
    header_cells[2].text = '1./2.'
    header_cells[3].text = '3./4.'
    header_cells[4].text = '5./6.'
    header_cells[5].text = '7./8.'

    # Zentriere Header-Text
    for cell in header_cells[2:]:
        for paragraph in cell.paragraphs:
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Füge Fehlzeiten hinzu
    absence_periods = data.get('absencePeriods', [])
    schedule = data.get('schedule', [])

    for period in absence_periods:
        start_date = datetime.fromisoformat(period['start'].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(period['end'].replace('Z', '+00:00'))
        
        current_date = start_date
        while current_date <= end_date:
            # Überspringe Wochenenden
            if current_date.weekday() < 5:  # 0-4 = Montag-Freitag
                weekday = get_weekday_name(current_date.weekday())
                date_str = current_date.strftime('%d.%m.%Y')
                
                # Hole Stundenplan für diesen Tag
                schedule_entries = get_schedule_for_day(schedule, weekday)
                
                # Füge Zeile hinzu
                row = table.add_row()
                row.cells[0].text = weekday
                row.cells[1].text = date_str
                row.cells[2].text = schedule_entries.get('1./2.', '')
                row.cells[3].text = schedule_entries.get('3./4.', '')
                row.cells[4].text = schedule_entries.get('5./6.', '')
                row.cells[5].text = schedule_entries.get('7./8.', '')
            
            current_date = current_date.replace(day=current_date.day + 1)

    # Ersetze den Platzhalter mit der Tabelle
    placeholder_paragraph.clear()
    placeholder_paragraph.add_run("")  # Leerer Paragraph

def get_weekday_name(weekday):
    """Konvertiert Wochentag-Nummer zu Name"""
    days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
    return days[weekday]

def get_schedule_for_day(schedule, weekday):
    """Holt Stundenplan für einen bestimmten Wochentag"""
    schedule_entries = {}
    for entry in schedule:
        if entry.get('weekday') == weekday:
            hour = entry.get('hour', '')
            subject = entry.get('subject', '')
            
            # Mappe Stunden zu Zeitblöcken
            if '1.' in hour and '2.' in hour:
                schedule_entries['1./2.'] = subject
            elif '3.' in hour and '4.' in hour:
                schedule_entries['3./4.'] = subject
            elif '5.' in hour and '6.' in hour:
                schedule_entries['5./6.'] = subject
            elif '7.' in hour and '8.' in hour:
                schedule_entries['7./8.'] = subject
    
    return schedule_entries

def process_template(input_path, output_path, data):
    """Hauptfunktion für Template-Verarbeitung"""
    try:
        # Lade Template
        doc = load_template(input_path)
        if not doc:
            return False

        # Ersetze Platzhalter
        replace_placeholders(doc, data)
        
        # Erstelle Tabellen
        create_schedule_table(doc, data)

        # Speichere Dokument
        doc.save(output_path)
        return True

    except Exception as e:
        print(f"Fehler bei Template-Verarbeitung: {e}", file=sys.stderr)
        return False

def main():
    """Hauptfunktion"""
    if len(sys.argv) != 4:
        print("Usage: python template_processor.py <input_path> <output_path> <data_json>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    data_json = sys.argv[3]

    try:
        data = json.loads(data_json)
    except json.JSONDecodeError as e:
        print(f"Fehler beim Parsen der JSON-Daten: {e}", file=sys.stderr)
        sys.exit(1)

    success = process_template(input_path, output_path, data)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
