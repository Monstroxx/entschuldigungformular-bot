#!/usr/bin/env python3
"""Startup-Script für den Entschuldigungsformular Discord Bot."""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Füge den Bot-Ordner zum Python-Pfad hinzu
bot_path = Path(__file__).parent / "bot"
sys.path.insert(0, str(bot_path))

from bot.main import main

if __name__ == "__main__":
    # Setze Arbeitsverzeichnis
    os.chdir(Path(__file__).parent)
    
    # Starte Bot
    asyncio.run(main())
