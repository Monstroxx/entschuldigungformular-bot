#!/bin/bash
# Docker Simple Script - ohne SQLite Volume-Probleme

echo "🐳 Starte Bot mit einfacher Docker-Konfiguration..."

# Prüfe .env Datei
if [ ! -f ".env" ]; then
    echo "❌ .env Datei nicht gefunden!"
    echo "📝 Erstelle .env Datei..."
    cp env.example .env
    echo "✅ .env Datei erstellt"
    echo "🔧 Bitte bearbeite .env und füge deinen Discord Bot Token hinzu"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "1. Bearbeite .env Datei: nano .env"
    echo "2. Füge DISCORD_TOKEN hinzu"
    echo "3. Führe ./docker-simple.sh erneut aus"
    exit 0
fi

# Erstelle output Ordner
mkdir -p output

# Starte Bot mit einfacher Konfiguration
echo "🚀 Starte Bot..."
docker-compose -f docker-compose-simple.yml up --build

echo "✅ Bot gestoppt"
