#!/bin/bash
# Docker Final Script - löst alle SQLite Probleme

echo "🎯 Docker Final - löst alle SQLite Probleme..."

# Stoppe alle Container
echo "🛑 Stoppe alle Container..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-simple.yml down 2>/dev/null || true
docker-compose -f docker-compose-fixed.yml down 2>/dev/null || true

# Lösche alte Container und Images
echo "🗑️ Lösche alte Container und Images..."
docker-compose rm -f 2>/dev/null || true
docker-compose -f docker-compose-simple.yml rm -f 2>/dev/null || true
docker-compose -f docker-compose-fixed.yml rm -f 2>/dev/null || true
docker rmi entschuldigungformular-bot_bot 2>/dev/null || true

# Erstelle notwendige Ordner
echo "📁 Erstelle Ordner..."
mkdir -p output
chmod 755 output

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
    echo "3. Führe ./docker-final.sh erneut aus"
    exit 0
fi

# Baue Container neu
echo "🔨 Baue Container neu..."
docker-compose -f docker-compose-simple.yml build --no-cache

# Starte Bot
echo "🚀 Starte Bot..."
docker-compose -f docker-compose-simple.yml up

echo "✅ Docker Final abgeschlossen"
