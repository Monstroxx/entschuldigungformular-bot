# Entschuldigungsformular Discord Bot

Ein Discord Bot, der automatisch Entschuldigungsformulare für die Schule ausfüllt.

## Features

- **?start** - Interaktives Menü zum Ausfüllen des Formulars
  - Name, Nachname, Grund eingeben
  - Datum/Zeit Picker für Fehlzeiten
  - Automatische Duplizierung der Tabelle basierend auf Fehlzeiten
  - Automatisches Einfügen von Ort (Bergisch Gladbach) und aktuellem Datum

- **?import** - Stundenplan hochladen
  - CSV/Excel Format für Stundenplan
  - Automatisches Einfügen der Stunden in das Formular
  - Maximal 8 Zeilen, 2 Spalten (Stunde, Anzahl)

- **?help** - Hilfe und Format-Anweisungen

## Technologie Stack

- **Backend**: Python mit discord.py
- **Datenbank**: SQLite (für Railway Deployment)
- **Formular**: python-docx für Word-Dokumente
- **Deployment**: Railway
- **Commands**: Slash Commands

## Projektstruktur

```
entschuldigungformular-bot/
├── bot/
│   ├── __init__.py
│   ├── main.py              # Bot Hauptdatei
│   ├── commands/            # Slash Commands
│   │   ├── __init__.py
│   │   ├── start.py         # ?start command
│   │   ├── import.py        # ?import command
│   │   └── help.py          # ?help command
│   ├── database/            # Datenbank Module
│   │   ├── __init__.py
│   │   ├── models.py        # SQLAlchemy Models
│   │   └── database.py      # DB Connection
│   ├── form/                # Formular Module
│   │   ├── __init__.py
│   │   ├── template.py      # Formular Template
│   │   └── filler.py        # Formular ausfüllen
│   └── utils/               # Utilities
│       ├── __init__.py
│       └── validators.py    # Input Validierung
├── templates/               # Formular Templates
│   └── entschuldigung.docx
├── formular_examples/       # Beispiel Formulare
├── requirements.txt
├── .env.example
├── railway.json
└── README.md
```

## Installation

### Lokale Entwicklung

1. **Python 3.9+ installieren**
   ```bash
   python --version  # Sollte 3.9+ sein
   ```

2. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd entschuldigungformular-bot
   ```

3. **Dependencies installieren**
   ```bash
   pip install -r requirements.txt
   ```

4. **Umgebungsvariablen konfigurieren**
   ```bash
   cp env.example .env
   # Bearbeite .env und füge deinen Discord Bot Token hinzu
   ```

5. **Discord Bot erstellen**
   - Gehe zu https://discord.com/developers/applications
   - Erstelle eine neue Application
   - Gehe zu "Bot" und erstelle einen Bot
   - Kopiere den Token in deine `.env` Datei
   - Aktiviere "Message Content Intent" in den Bot-Einstellungen

6. **Bot starten**
   ```bash
   python run.py
   # oder
   python -m bot.main
   ```

### Railway Deployment

1. **Railway CLI installieren**
   ```bash
   npm install -g @railway/cli
   ```

2. **Bei Railway anmelden**
   ```bash
   railway login
   ```

3. **Projekt erstellen**
   ```bash
   railway init
   ```

4. **Environment Variables setzen**
   ```bash
   railway variables set DISCORD_TOKEN=your_bot_token_here
   railway variables set DISCORD_GUILD_ID=your_guild_id_here
   ```

5. **Deployen**
   ```bash
   ./deploy.sh
   # oder manuell:
   railway up
   ```

## Verwendung

### Slash Commands

- `/start` - Erstelle ein neues Entschuldigungsformular
- `/import` - Lade deinen Stundenplan hoch
- `/help` - Zeige Hilfe und Anweisungen

### Stundenplan Format

Für `/import` verwende eine CSV oder Excel Datei mit:
- Maximal 8 Zeilen
- 2 Spalten: Stunde | Fach
- Beispiel:
  ```
  1. Stunde,Mathematik
  2. Stunde,Deutsch
  3. Stunde,Englisch
  ```

## Features

- ✅ **Interaktive Formular-Erstellung** mit Slash Commands
- ✅ **Automatische Datum/Zeit Auswahl** mit Buttons
- ✅ **Stundenplan Import** via CSV/Excel Upload
- ✅ **Automatische Formular-Ausfüllung** mit python-docx
- ✅ **SQLite Datenbank** für Benutzerdaten
- ✅ **Railway Deployment** bereit
- ✅ **Health Check Endpoint** für Monitoring
- ✅ **Error Handling** und Logging
