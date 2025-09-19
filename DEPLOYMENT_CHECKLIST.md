# 🚀 Railway Deployment Checklist

## ✅ **Vorbereitung abgeschlossen:**

### **PDF Export** ✅
- ✅ PDF Converter implementiert (LibreOffice, docx2pdf, Pandoc)
- ✅ Automatische Konvertierung von DOCX zu PDF
- ✅ Fallback auf DOCX falls PDF-Konvertierung fehlschlägt
- ✅ Temporäre Dateien werden automatisch gelöscht

### **Railway Database** ✅
- ✅ PostgreSQL Support für Railway
- ✅ SQLite Fallback für lokale Entwicklung
- ✅ Connection Pooling für Production
- ✅ Automatische Tabellen-Erstellung

### **Railway Konfiguration** ✅
- ✅ `railway.json` optimiert
- ✅ Health Check Endpoint (`/health`)
- ✅ Environment Variables Support
- ✅ Nixpacks Builder konfiguriert

## 🚀 **Deployment-Schritte:**

### **1. Railway Setup:**
```bash
# Railway CLI installieren
npm install -g @railway/cli

# Bei Railway anmelden
railway login

# Projekt erstellen
railway init
```

### **2. PostgreSQL Database hinzufügen:**
```bash
# PostgreSQL Service hinzufügen
railway add postgresql
```

### **3. Environment Variables setzen:**
```bash
# Discord Bot Token
railway variables set DISCORD_TOKEN=your_bot_token_here

# Discord Guild ID (optional)
railway variables set DISCORD_GUILD_ID=your_guild_id_here

# Debug Mode (optional)
railway variables set DEBUG=False
```

### **4. Deployen:**
```bash
# Automatisches Deployment
./deploy.sh

# Oder manuell
railway up
```

## 📋 **Nach dem Deployment:**

### **1. Bot-Status überprüfen:**
- Health Check: `https://your-app.railway.app/health`
- Bot sollte online sein in Discord

### **2. Commands testen:**
- `/help` - Hilfe anzeigen
- `/start` - Formular erstellen (PDF)
- `/import` - Stundenplan hochladen

### **3. Database überprüfen:**
- PostgreSQL ist automatisch konfiguriert
- Tabellen werden automatisch erstellt
- Daten werden persistent gespeichert

## 🔧 **Troubleshooting:**

### **PDF-Konvertierung funktioniert nicht:**
- Bot fällt automatisch auf DOCX zurück
- LibreOffice wird in Railway installiert
- Alternative: docx2pdf Python Library

### **Database-Verbindung fehlgeschlagen:**
- Prüfe `DATABASE_URL` Environment Variable
- PostgreSQL Service muss aktiv sein
- Connection Pool wird automatisch verwaltet

### **Bot startet nicht:**
- Prüfe Discord Token
- Prüfe Logs in Railway Dashboard
- Health Check sollte `/health` antworten

## ✅ **Deployment-Status: BEREIT!**

Der Bot ist vollständig für Railway optimiert und kann deployed werden!
