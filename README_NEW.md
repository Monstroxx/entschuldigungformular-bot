# Entschuldigungsformular Discord Bot (Node.js + TypeScript)

Ein intelligenter Discord Bot, der automatisch Entschuldigungsformulare für die Schule ausfüllt und als DOCX exportiert.

## 🚀 Features

- **Slash Commands** für einfache Bedienung
- **Setup-System** für Benutzer- und Lehrer-Daten
- **Stundenplan-Import** mit CSV-Format
- **Automatische Formular-Generierung** mit DOCX
- **Datenbank-Integration** mit Prisma
- **TypeScript** für bessere Code-Qualität

## 📋 Verfügbare Commands

- `/setup` - Initialkonfiguration (Name, Lehrer)
- `/start` - Erstelle ein neues Entschuldigungsformular
- `/import` - Lade deinen Stundenplan hoch
- `/help` - Zeige Hilfe und verfügbare Befehle

## 🛠️ Installation

### Lokale Entwicklung

1. **Dependencies installieren:**
   ```bash
   npm install
   ```

2. **Environment-Variablen konfigurieren:**
   ```bash
   cp env.example .env
   # Bearbeite .env mit deinen Discord-Token und Datenbank-URL
   ```

3. **Datenbank einrichten:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Slash Commands registrieren:**
   ```bash
   npm run deploy-commands
   ```

5. **Bot starten:**
   ```bash
   npm run dev
   ```

### Railway Deployment

1. **Repository auf Railway verbinden**
2. **Environment-Variablen setzen:**
   - `DISCORD_TOKEN` - Dein Discord Bot Token
   - `DISCORD_CLIENT_ID` - Deine Discord Application ID
   - `DISCORD_GUILD_ID` - Deine Discord Server ID (optional)
   - `DATABASE_URL` - PostgreSQL Datenbank-URL

3. **Deploy** - Railway erkennt automatisch Node.js und startet den Bot

## 📊 Stundenplan-Format

Verwende das folgende CSV-Format für deinen Stundenplan:

```csv
mo;di;mi;do;fr
1std;1std;1std;1std;1std
2std;2std;2std;2std;2std
3std;3std;3std;3std;3std
4std;4std;4std;4std;4std
5std;5std;5std;5std;5std
6std;6std;6std;6std;6std
7std;7std;7std;7std;7std
8std;8std;8std;8std;8std
```

## 🏗️ Projektstruktur

```
src/
├── commands/          # Slash Commands
│   ├── setup.ts      # Setup Command
│   ├── start.ts      # Start Command
│   ├── import.ts     # Import Command
│   └── help.ts       # Help Command
├── database/          # Datenbank-Client
│   └── client.ts     # Prisma Client
├── utils/            # Utility-Funktionen
│   ├── formGenerator.ts  # DOCX-Generator
│   └── scheduleParser.ts # CSV-Parser
├── types/            # TypeScript-Typen
│   └── index.ts      # Interface-Definitionen
├── index.ts          # Haupt-Bot-Datei
└── deploy-commands.ts # Command-Registrierung
```

## 🔧 Scripts

- `npm run dev` - Startet den Bot im Entwicklungsmodus
- `npm run build` - Kompiliert TypeScript zu JavaScript
- `npm start` - Startet den kompilierten Bot
- `npm run deploy-commands` - Registriert Slash Commands
- `npm run db:generate` - Generiert Prisma Client
- `npm run db:push` - Synchronisiert Datenbankschema

## 📝 Verwendung

1. **Setup ausführen:** `/setup` - Gib deine Daten und Lehrer-Informationen ein
2. **Stundenplan importieren:** `/import` - Lade deinen Stundenplan hoch (optional)
3. **Formular erstellen:** `/start` - Erstelle ein neues Entschuldigungsformular
4. **Hilfe anzeigen:** `/help` - Zeige alle verfügbaren Befehle

## 🎯 Vorteile gegenüber Python-Version

- ✅ **Stabilere Command-Registrierung** - Keine Sync-Probleme
- ✅ **Bessere Fehlerbehandlung** - TypeScript gibt bessere Fehler
- ✅ **Einfachere Debugging** - Bessere IDE-Unterstützung
- ✅ **Moderne Technologie** - Node.js + TypeScript + Prisma
- ✅ **Einfachere Deployment** - Railway erkennt Node.js automatisch
- ✅ **Bessere Performance** - Schnellere Ausführung

## 🐛 Troubleshooting

**Commands werden nicht angezeigt:**
- Führe `npm run deploy-commands` aus
- Überprüfe deine Discord-Token und Client-ID

**Datenbank-Fehler:**
- Überprüfe deine DATABASE_URL
- Führe `npm run db:push` aus

**Bot startet nicht:**
- Überprüfe deine .env-Datei
- Installiere Dependencies mit `npm install`
