#!/usr/bin/env python3
"""Test-Script für den Entschuldigungsformular Bot."""

import sys
from pathlib import Path

# Füge den Bot-Ordner zum Python-Pfad hinzu
bot_path = Path(__file__).parent / "bot"
sys.path.insert(0, str(bot_path))

def test_imports():
    """Teste ob alle Module importiert werden können."""
    try:
        print("🧪 Teste Imports...")
        
        # Teste Bot Module
        from bot.database import DatabaseManager, User, Schedule, ExcuseForm
        print("✅ Database Module OK")
        
        from bot.form import FormFiller, FormTemplate
        print("✅ Form Module OK")
        
        from bot.commands import StartCommand, ImportCommand, HelpCommand
        print("✅ Commands Module OK")
        
        from bot.utils import validate_date, validate_time, validate_name
        print("✅ Utils Module OK")
        
        print("✅ Alle Imports erfolgreich!")
        return True
        
    except ImportError as e:
        print(f"❌ Import Fehler: {e}")
        return False

def test_database():
    """Teste Datenbank-Funktionalität."""
    try:
        print("\n🧪 Teste Datenbank...")
        
        from bot.database import DatabaseManager
        
        # Erstelle Test-Datenbank
        db = DatabaseManager("sqlite:///:memory:")
        print("✅ Datenbank erstellt")
        
        # Teste Benutzer-Erstellung
        user = db.create_user("123456789", "Test", "User")
        print("✅ Benutzer erstellt")
        
        # Teste Stundenplan
        schedule_data = [
            {"hour": "1. Stunde", "subject": "Mathematik"},
            {"hour": "2. Stunde", "subject": "Deutsch"}
        ]
        
        success = db.save_schedule("123456789", schedule_data)
        if success:
            print("✅ Stundenplan gespeichert")
        else:
            print("❌ Stundenplan Fehler")
            return False
        
        # Teste Stundenplan abrufen
        schedule = db.get_user_schedule("123456789")
        if len(schedule) == 2:
            print("✅ Stundenplan abgerufen")
        else:
            print("❌ Stundenplan Abruf Fehler")
            return False
        
        print("✅ Datenbank-Tests erfolgreich!")
        return True
        
    except Exception as e:
        print(f"❌ Datenbank Fehler: {e}")
        return False

def test_form_template():
    """Teste Formular-Template."""
    try:
        print("\n🧪 Teste Formular-Template...")
        
        from bot.form import FormTemplate
        
        # Erstelle Template
        template = FormTemplate()
        print("✅ Template erstellt")
        
        # Teste Template-Laden
        doc = template.load_template()
        print("✅ Template geladen")
        
        # Teste Template-Ausfüllung
        test_data = {
            "first_name": "Max",
            "last_name": "Mustermann",
            "reason": "Krankheit",
            "current_date": "15.01.2025",
            "start_date": "15.01.2025",
            "end_date": "15.01.2025"
        }
        
        filled_doc = template.fill_template(test_data)
        print("✅ Template ausgefüllt")
        
        print("✅ Formular-Template Tests erfolgreich!")
        return True
        
    except Exception as e:
        print(f"❌ Formular-Template Fehler: {e}")
        return False

def main():
    """Führe alle Tests aus."""
    print("🚀 Starte Bot-Tests...\n")
    
    tests = [
        test_imports,
        test_database,
        test_form_template
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print(f"📊 Tests abgeschlossen: {passed}/{total} erfolgreich")
    
    if passed == total:
        print("🎉 Alle Tests erfolgreich! Bot ist bereit.")
        return 0
    else:
        print("❌ Einige Tests fehlgeschlagen. Bitte überprüfe die Fehler.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
