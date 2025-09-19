#!/bin/bash
# Docker Debug Script - behebt SQLite Berechtigungsprobleme

echo "🐳 Docker Debug - behebt SQLite Probleme..."

# Stoppe alle Container
echo "🛑 Stoppe alle Container..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-simple.yml down 2>/dev/null || true

# Lösche alte Container und Images
echo "🗑️ Lösche alte Container und Images..."
docker-compose rm -f 2>/dev/null || true
docker-compose -f docker-compose-simple.yml rm -f 2>/dev/null || true
docker rmi entschuldigungformular-bot_bot 2>/dev/null || true

# Erstelle notwendige Ordner
echo "📁 Erstelle Ordner mit korrekten Berechtigungen..."
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
    echo "3. Führe ./docker-debug.sh erneut aus"
    exit 0
fi

# Baue Container neu mit Debug-Output
echo "🔨 Baue Container neu mit Debug-Output..."
docker-compose -f docker-compose-simple.yml build --no-cache --progress=plain

# Starte Bot mit Debug-Output
echo "🚀 Starte Bot mit Debug-Output..."
docker-compose -f docker-compose-simple.yml up

echo "✅ Docker Debug abgeschlossen"
