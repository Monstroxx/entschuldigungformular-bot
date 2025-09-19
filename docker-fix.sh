#!/bin/bash
# Docker Fix Script für SQLite Berechtigungsprobleme

echo "🔧 Behebe Docker SQLite Berechtigungsprobleme..."

# Stoppe alle Container
echo "🛑 Stoppe alle Container..."
docker-compose down

# Lösche alte Container und Images
echo "🗑️ Lösche alte Container und Images..."
docker-compose rm -f
docker rmi entschuldigungformular-bot_bot 2>/dev/null || true

# Erstelle notwendige Ordner
echo "📁 Erstelle Ordner..."
mkdir -p data output
chmod 755 data output

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
    echo "3. Führe ./docker-run.sh aus"
    exit 0
fi

# Baue Container neu
echo "🔨 Baue Container neu..."
docker-compose build --no-cache

# Starte Bot
echo "🚀 Starte Bot..."
docker-compose up

echo "✅ Docker Fix abgeschlossen"
