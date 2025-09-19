# 🎓 Entschuldigungsformular Discord Bot

Ein intelligenter Discord Bot, der automatisch Entschuldigungsformulare für die Schule ausfüllt und als PDF exportiert.

## ✨ Features

- **Slash Commands** für einfache Bedienung
- **Interaktive Menüs** für Datum/Zeit Auswahl
- **Stundenplan Import** via Excel/CSV Upload
- **Automatische Formular-Erstellung** mit korrekten Daten
- **PDF Export** mit professionellem Format
- **Railway Deployment** mit PostgreSQL Datenbank
- **Intelligente PDF-Konvertierung** (LibreOffice lokal, WeasyPrint auf Railway)

## 🚀 Railway Deployment

### Automatisches Deployment

1. **Repository zu Railway verbinden:**
   - Gehe zu https://railway.app
   - Erstelle ein neues Projekt
   - Verbinde dein GitHub Repository

2. **PostgreSQL Datenbank hinzufügen:**
   - Füge eine PostgreSQL Datenbank zu deinem Projekt hinzu
   - Railway setzt automatisch die `DATABASE_URL` Umgebungsvariable

3. **Umgebungsvariablen setzen:**
   - `DISCORD_TOKEN`: Dein Discord Bot Token
   - `DISCORD_GUILD_ID`: Deine Discord Server ID
   - `DEBUG`: `false` für Production
   - `LOG_LEVEL`: `INFO` für Production

4. **Deployment:**
   - Railway erkennt automatisch die `Procfile`
   - Der Bot startet automatisch nach dem Push

### Manuelles Deployment

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Login
railway login

# Projekt initialisieren
railway init

# Umgebungsvariablen setzen
railway variables set DISCORD_TOKEN=your_token
railway variables set DISCORD_GUILD_ID=your_guild_id

# Deployen
railway up
```

## 📋 Verwendung

### Slash Commands

- `/start` - Erstellt ein neues Entschuldigungsformular
- `/import` - Importiert deinen Stundenplan
- `/help` - Zeigt Hilfe und Anweisungen

### Stundenplan Format

Für `/import` verwende folgendes Format:
```
Montag    Dienstag  Mittwoch  Donnerstag  Freitag
1./2.     1./2.     1./2.     1./2.      1./2.
3./4.     3./4.     3./4.     3./4.      3./4.
5./6.     5./6.     5./6.     5./6.      5./6.
7./8.     7./8.     7./8.     7./8.      7./8.
```

## 🏗️ Projektstruktur

```
entschuldigungformular-bot/
├── bot/
│   ├── commands/           # Slash Commands
│   │   ├── start.py       # /start Command
│   │   ├── import_cmd.py  # /import Command
│   │   └── help.py        # /help Command
│   ├── database/          # Datenbank Management
│   │   ├── models.py      # SQLAlchemy Models
│   │   └── database.py    # Database Manager
│   ├── form/              # Formular Logic
│   │   ├── real_template.py # Template Generator
│   │   └── filler.py      # Form Filler
│   ├── utils/             # Utilities
│   │   ├── pdf_converter.py # PDF Konvertierung
│   │   ├── health.py      # Health Check
│   │   └── validators.py  # Input Validierung
│   └── main.py            # Bot Hauptdatei
├── requirements.txt
├── .env.example
├── railway.json
├── Procfile
└── README.md
```

## 🔧 Technische Details

- **Discord.py** für Bot-Funktionalität
- **SQLAlchemy** für Datenbank-Management
- **python-docx** für Word-Dokumente
- **WeasyPrint/LibreOffice** für PDF-Konvertierung
- **PostgreSQL** auf Railway, SQLite lokal
- **Railway** für Deployment

## 📝 Lizenz

MIT License - Siehe LICENSE Datei für Details.