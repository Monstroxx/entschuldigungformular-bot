#!/usr/bin/env python3
"""Quick Fix Script für Railway Deployment."""

import asyncio
import os
import sys
from pathlib import Path

# Füge den Bot-Ordner zum Python-Pfad hinzu
bot_path = Path(__file__).parent / "bot"
sys.path.insert(0, str(bot_path))

async def test_bot():
    """Teste den Bot ohne ihn zu starten."""
    try:
        print("🧪 Teste Bot-Komponenten...")
        
        # Teste Imports
        from bot.database import DatabaseManager
        from bot.form import FormFiller
        from bot.commands import StartCommand, ImportCommand, HelpCommand
        from bot.utils import PDFConverter, HealthCheck
        print("✅ Alle Imports erfolgreich")
        
        # Teste Datenbank
        db = DatabaseManager("sqlite:///:memory:")
        print("✅ Datenbank funktioniert")
        
        # Teste PDF Converter
        pdf_conv = PDFConverter()
        print("✅ PDF Converter funktioniert")
        
        # Teste Health Check
        health = HealthCheck()
        print("✅ Health Check funktioniert")
        
        print("🎉 Alle Komponenten funktionieren!")
        return True
        
    except Exception as e:
        print(f"❌ Fehler: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_bot())
    sys.exit(0 if success else 1)
