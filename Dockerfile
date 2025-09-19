# Dockerfile für Entschuldigungsformular Discord Bot
FROM python:3.12-slim

# System Dependencies installieren
RUN apt-get update && apt-get install -y \
    libreoffice \
    pandoc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Arbeitsverzeichnis setzen
WORKDIR /app

# Python Dependencies kopieren und installieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bot Code kopieren
COPY . .

# Erstelle notwendige Ordner mit korrekten Berechtigungen
RUN mkdir -p /app/data /app/output && \
    chmod 755 /app/data /app/output

# Output Ordner erstellen
RUN mkdir -p output

# Port für Health Check
EXPOSE 8000

# Bot starten
CMD ["python", "-m", "bot.main"]
