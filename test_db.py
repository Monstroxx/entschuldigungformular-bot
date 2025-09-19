#!/usr/bin/env python3
"""Test Script für Datenbank-Verbindung."""

import os
import sys
sys.path.append('.')

from bot.database.database import DatabaseManager

def test_database():
    """Teste die Datenbank-Verbindung."""
    print("🔍 Teste Datenbank-Verbindung...")
    
    try:
        # Teste mit absoluten Pfad
        db_manager = DatabaseManager("sqlite:////tmp/test_bot.db")
        print("✅ Datenbank-Verbindung erfolgreich!")
        
        # Teste Session
        with db_manager.get_session() as session:
            print("✅ Datenbank-Session erfolgreich!")
        
        print("✅ Alle Datenbank-Tests bestanden!")
        return True
        
    except Exception as e:
        print(f"❌ Datenbank-Fehler: {e}")
        return False

if __name__ == "__main__":
    success = test_database()
    sys.exit(0 if success else 1)
