#!/usr/bin/env python3
"""Test-Script für das echte Formular-Template."""

import sys
from pathlib import Path
from datetime import datetime, timedelta

# Füge den Bot-Ordner zum Python-Pfad hinzu
bot_path = Path(__file__).parent / "bot"
sys.path.insert(0, str(bot_path))

def test_real_template():
    """Teste das echte Formular-Template."""
    try:
        print("🧪 Teste echtes Formular-Template...")
        
        from bot.form.real_template import RealFormTemplate
        
        # Erstelle Template
        template = RealFormTemplate()
        print("✅ Template erstellt")
        
        # Teste Template-Laden
        doc = template.load_template()
        print("✅ Template geladen")
        
        # Teste Template-Ausfüllung
        test_data = {
            "first_name": "Max",
            "last_name": "Mustermann",
            "current_date": datetime.now().strftime("%d.%m.%Y"),
            "absence_periods": [
                {
                    "start": datetime.now().date(),
                    "end": datetime.now().date(),
                    "start_time": "08:00",
                    "end_time": "15:00"
                }
            ],
            "schedule": [
                {"hour": "1. Stunde", "subject": "Mathematik"},
                {"hour": "2. Stunde", "subject": "Deutsch"}
            ]
        }
        
        filled_doc = template.fill_template(test_data)
        print("✅ Template ausgefüllt")
        
        # Speichere Test-Dokument
        file_path = template.save_document(filled_doc, "test_entschuldigung.docx")
        print(f"✅ Test-Dokument gespeichert: {file_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim Testen des Templates: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Führe Template-Test aus."""
    print("🚀 Teste echtes Formular-Template...\n")
    
    if test_real_template():
        print("\n🎉 Template-Test erfolgreich!")
        print("📄 Überprüfe die generierte Datei in output/test_entschuldigung.docx")
        return 0
    else:
        print("\n❌ Template-Test fehlgeschlagen!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
