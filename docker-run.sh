#!/bin/bash
# Docker Run Script für lokale Entwicklung

echo "🐳 Starte Entschuldigungsformular Bot mit Docker..."

# Prüfe ob .env Datei existiert
if [ ! -f ".env" ]; then
    echo "❌ .env Datei nicht gefunden!"
    echo "📝 Erstelle .env Datei aus env.example:"
    echo "cp env.example .env"
    echo ""
    echo "🔧 Bearbeite .env und füge deinen Discord Bot Token hinzu"
    exit 1
fi

# Prüfe ob Docker installiert ist
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert!"
    echo "📥 Installiere Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# Prüfe ob docker-compose installiert ist
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert!"
    echo "📥 Installiere Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Erstelle output Ordner
mkdir -p output

# Starte Bot mit Docker Compose
echo "🚀 Starte Bot..."
docker-compose up --build

echo "✅ Bot gestoppt"
