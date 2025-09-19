# 🚀 Railway Deployment - FIXED VERSION

## ✅ **Fehler behoben:**

### **1. Discord Import Error** ✅
- `discord.Activity` Import-Fehler behoben
- Korrekte Imports in `on_ready` Methode

### **2. Slash Commands Problem** ✅
- Commands werden jetzt korrekt registriert
- `on_guild_join` Handler für neue Server hinzugefügt
- Besserer Error Handling für Command Sync

### **3. Health Check Server** ✅
- Nicht-blockierender Health Check Server
- Besseres Error Handling

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
- Keine Import-Fehler mehr

### **2. Commands testen:**
- `/help` - Hilfe anzeigen
- `/start` - Formular erstellen (PDF)
- `/import` - Stundenplan hochladen

### **3. Logs überprüfen:**
```bash
# Railway Logs anzeigen
railway logs
```

## 🔧 **Troubleshooting:**

### **Bot startet nicht:**
- Prüfe Discord Token
- Prüfe Logs: `railway logs`
- Health Check sollte `/health` antworten

### **Commands funktionieren nicht:**
- Bot muss in Server eingeladen werden
- Commands werden automatisch synchronisiert
- Prüfe Bot-Berechtigungen

### **PDF-Konvertierung:**
- Fallback auf DOCX falls PDF fehlschlägt
- LibreOffice wird in Railway installiert
- Temporäre Dateien werden gelöscht

## ✅ **Deployment-Status: BEREIT!**

Alle Fehler wurden behoben. Der Bot kann jetzt erfolgreich deployed werden!
