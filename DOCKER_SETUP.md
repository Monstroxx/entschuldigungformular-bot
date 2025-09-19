# 🐳 Docker Setup für Entschuldigungsformular Bot

## 🚀 **Schnellstart:**

### **1. Environment Setup:**
```bash
# .env Datei erstellen (falls nicht vorhanden)
cp env.example .env

# .env bearbeiten und Discord Token hinzufügen
nano .env
```

### **2. Bot starten:**
```bash
# Mit Docker Compose (empfohlen)
./docker-run.sh

# Oder manuell
docker-compose up --build
```

### **3. Bot stoppen:**
```bash
# Mit Ctrl+C oder
docker-compose down
```

## 🔧 **Development Setup:**

### **1. Development Environment:**
```bash
# Automatisches Setup
./docker-dev.sh
```

### **2. Logs anzeigen:**
```bash
# Alle Logs
docker-compose logs -f

# Nur Bot Logs
docker-compose logs -f bot
```

### **3. Container neu starten:**
```bash
# Bot neu starten
docker-compose restart bot

# Alles neu bauen
docker-compose up --build --force-recreate
```

## 📋 **Environment Variables (.env):**

```bash
# Discord Bot Configuration
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_GUILD_ID=your_guild_id_here

# Database Configuration
DATABASE_URL=sqlite:///bot.db

# Application Configuration
DEBUG=True
LOG_LEVEL=INFO

# Docker Configuration
PORT=8000
```

## 🐳 **Docker Commands:**

### **Einzelne Container:**
```bash
# Bot starten
docker run -d --name entschuldigungsformular-bot \
  --env-file .env \
  -p 8000:8000 \
  -v $(pwd)/output:/app/output \
  entschuldigungsformular-bot

# Bot stoppen
docker stop entschuldigungsformular-bot
docker rm entschuldigungsformular-bot
```

### **Mit PostgreSQL:**
```bash
# PostgreSQL + Bot starten
docker-compose up postgres bot

# Nur PostgreSQL
docker-compose up postgres
```

## 🔍 **Troubleshooting:**

### **Bot startet nicht:**
```bash
# Logs prüfen
docker-compose logs bot

# Container Status
docker-compose ps

# Container neu bauen
docker-compose build --no-cache
```

### **PDF-Konvertierung funktioniert nicht:**
- LibreOffice ist im Container installiert
- Fallback auf DOCX funktioniert immer
- Prüfe Logs für Details

### **Database Probleme:**
```bash
# SQLite Datei löschen
rm bot.db

# Container neu starten
docker-compose restart bot
```

## 📁 **Volumes:**

- `./output` → Generierte Formulare
- `./bot.db` → SQLite Datenbank
- `postgres_data` → PostgreSQL Daten (falls verwendet)

## 🌐 **Health Check:**

- **URL:** http://localhost:8000/health
- **Status:** Bot online/offline
- **Uptime:** Bot Laufzeit

## ✅ **Vorteile von Docker:**

- ✅ **Konsistente Umgebung** (Linux, macOS, Windows)
- ✅ **Einfache Installation** (nur Docker benötigt)
- ✅ **Isolierte Dependencies** (keine Python-Konflikte)
- ✅ **LibreOffice vorinstalliert** (PDF-Konvertierung)
- ✅ **Einfaches Deployment** (gleiche Umgebung wie Railway)
