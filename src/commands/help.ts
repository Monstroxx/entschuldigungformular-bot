import { 
  ChatInputCommandInteraction, 
  EmbedBuilder
} from 'discord.js';

export async function helpCommand(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('📋 Entschuldigungsformular Bot - Hilfe')
    .setDescription('Hier findest du alle verfügbaren Befehle und Anweisungen:')
    .setColor(0x00ff00)
    .addFields(
      {
        name: '🔧 Verfügbare Befehle',
        value: `
        \`/setup\` - Initialkonfiguration (Name, Lehrer)
        \`/start\` - Erstelle ein neues Entschuldigungsformular
        \`/import\` - Lade deinen Stundenplan hoch
        \`/help\` - Zeige diese Hilfe an
        `,
        inline: false
      },
      {
        name: '⚙️ /setup - Initialkonfiguration',
        value: `
        **Erste Schritte - Führe diesen Befehl zuerst aus!**
        
        1. Gib deinen Vor- und Nachnamen ein
        2. Gib den Vor- und Nachnamen deines Klassenlehrers ein
        3. Deine Daten werden gespeichert und automatisch in Formulare eingefügt
        
        **Wichtig:** Führe \`/setup\` vor der ersten Verwendung von \`/start\` aus!
        `,
        inline: false
      },
      {
        name: '📝 /start - Formular erstellen',
        value: `
        Mit diesem Befehl kannst du ein neues Entschuldigungsformular erstellen:
        1. Gib den Grund für deine Abwesenheit ein
        2. Wähle das Start- und Enddatum
        3. Wähle die Start- und Endzeit
        4. Das Formular wird automatisch mit deinen Daten ausgefüllt
        `,
        inline: false
      },
      {
        name: '📊 /import - Stundenplan hochladen',
        value: `
        Lade deinen Stundenplan hoch, damit er automatisch in das Formular eingefügt wird:
        
        **Format:**
        \`\`\`
        mo;di;mi;do;fr
        1std;1std;1std;1std;1std
        2std;2std;2std;2std;2std
        3std;3std;3std;3std;3std
        4std;4std;4std;4std;4std
        5std;5std;5std;5std;5std
        6std;6std;6std;6std;6std
        7std;7std;7std;7std;7std
        8std;8std;8std;8std;8std
        \`\`\`
        `,
        inline: false
      },
      {
        name: '💡 Tipps',
        value: `
        • **Führe zuerst \`/setup\` aus** für die Initialkonfiguration
        • Dein Stundenplan wird automatisch in das Formular eingefügt
        • Ort wird automatisch auf "Bergisch Gladbach" gesetzt
        • Das aktuelle Datum wird automatisch eingefügt
        • Lehrer-Name wird automatisch aus deinen Setup-Daten eingefügt
        • Du kannst mehrere Fehlzeiten in einem Formular erfassen
        `,
        inline: false
      }
    )
    .setFooter({ text: 'Bei Problemen wende dich an den Bot-Administrator' });

  await interaction.reply({ embeds: [embed], flags: 64 });
}
