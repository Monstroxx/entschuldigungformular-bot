#!/bin/bash
# Deployment Script für Railway

echo "🚀 Deploying Entschuldigungsformular Bot to Railway..."

# Prüfe ob Railway CLI installiert ist
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI nicht gefunden. Bitte installiere es zuerst:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Prüfe ob .env Datei existiert
if [ ! -f ".env" ]; then
    echo "⚠️  .env Datei nicht gefunden. Kopiere env.example zu .env und fülle sie aus:"
    echo "cp env.example .env"
    exit 1
fi

# Installiere Dependencies
echo "📦 Installiere Dependencies..."
pip install -r requirements.txt

# Teste Bot lokal (optional)
echo "🧪 Teste Bot lokal..."
python -c "from bot.main import main; print('✅ Bot kann importiert werden')"

# Deploy zu Railway
echo "🚀 Deploye zu Railway..."
railway up

echo "✅ Deployment abgeschlossen!"
echo "🔗 Überprüfe deine Railway Dashboard für den Status"
echo ""
echo "📋 WICHTIGE RAILWAY KONFIGURATION:"
echo "1. Füge PostgreSQL Database hinzu:"
echo "   railway add postgresql"
echo ""
echo "2. Setze Environment Variables:"
echo "   railway variables set DISCORD_TOKEN=your_bot_token"
echo "   railway variables set DISCORD_GUILD_ID=your_guild_id"
echo ""
echo "3. Die DATABASE_URL wird automatisch von Railway gesetzt"
