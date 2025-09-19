#!/bin/bash
# Lokaler Test ohne Docker

echo "🚀 Starte Bot lokal (ohne Docker)..."

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
    echo "3. Führe ./run_local.sh erneut aus"
    exit 0
fi

# Aktiviere Virtual Environment
if [ ! -d "venv" ]; then
    echo "📦 Erstelle Virtual Environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Erstelle output Ordner
mkdir -p output

# Starte Bot
echo "🤖 Starte Discord Bot..."
python -m bot.main

echo "✅ Bot gestoppt"
