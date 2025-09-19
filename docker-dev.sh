#!/bin/bash
# Docker Development Script

echo "🔧 Docker Development Setup für Entschuldigungsformular Bot"

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo "📝 Erstelle .env Datei..."
    cp env.example .env
    echo "✅ .env Datei erstellt"
    echo "🔧 Bitte bearbeite .env und füge deinen Discord Bot Token hinzu"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "1. Bearbeite .env Datei"
    echo "2. Füge DISCORD_TOKEN hinzu"
    echo "3. Führe ./docker-run.sh aus"
    exit 0
fi

# Erstelle notwendige Ordner
mkdir -p output
mkdir -p logs

echo "🐳 Baue Docker Image..."
docker-compose build

echo "🚀 Starte Bot im Development Modus..."
docker-compose up

echo "✅ Development Setup abgeschlossen"
