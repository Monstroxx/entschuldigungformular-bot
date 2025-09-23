import { 
  ChatInputCommandInteraction, 
  AttachmentBuilder,
  EmbedBuilder
} from 'discord.js';
import { prisma } from '../database/client';
import { parseScheduleFormat } from '../utils/scheduleParser';

export async function importCommand(interaction: ChatInputCommandInteraction) {
  const attachment = interaction.options.getAttachment('file');

  if (!attachment) {
    await interaction.reply({
      content: '❌ Bitte lade eine Datei hoch!',
      ephemeral: true
    });
    return;
  }

  // Validate file type
  if (!attachment.name?.toLowerCase().endsWith('.csv')) {
    await interaction.reply({
      content: '❌ Bitte lade eine CSV-Datei hoch!',
      ephemeral: true
    });
    return;
  }

  // Validate file size (max 1MB)
  if (attachment.size > 1024 * 1024) {
    await interaction.reply({
      content: '❌ Datei ist zu groß! Maximum: 1MB',
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    // Download file
    const response = await fetch(attachment.url);
    const csvContent = await response.text();

    // Parse schedule
    const scheduleData = parseScheduleFormat(csvContent);

    if (!scheduleData || scheduleData.length === 0) {
      await interaction.followUp({
        content: '❌ Fehler beim Parsen der CSV-Datei. Bitte überprüfe das Format.\n\n**Erwartetes Format:**\n```\nmo;di;mi;do;fr\n1std;1std;1std;1std;1std\n2std;2std;2std;2std;2std\n3std;3std;3std;3std;3std\n4std;4std;4std;4std;4std\n5std;5std;5std;5std;5std\n6std;6std;6std;6std;6std\n7std;7std;7std;7std;7std\n8std;8std;8std;8std;8std\n```',
        ephemeral: true
      });
      return;
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { discordId: interaction.user.id }
      });
    }

    // Clear existing schedule
    await prisma.schedule.deleteMany({
      where: { userId: user.id }
    });

    // Save new schedule
    await prisma.schedule.createMany({
      data: scheduleData.map(entry => ({
        userId: user!.id,
        hour: entry.hour,
        subject: entry.subject,
        weekday: entry.weekday
      }))
    });

    // Create success embed
    const embed = new EmbedBuilder()
      .setTitle('✅ Stundenplan erfolgreich importiert!')
      .setDescription(`Es wurden ${scheduleData.length} Einträge importiert.`)
      .setColor(0x00ff00);

    // Show first few entries
    const preview = scheduleData.slice(0, 5);
    const previewText = preview.map(entry => `• ${entry.hour}: ${entry.subject}`).join('\n');
    const remaining = scheduleData.length > 5 ? `\n... und ${scheduleData.length - 5} weitere` : '';

    embed.addFields({
      name: 'Importierte Einträge',
      value: previewText + remaining,
      inline: false
    });

    embed.addFields({
      name: 'Nächste Schritte',
      value: 'Verwende `/start` um ein Entschuldigungsformular zu erstellen.',
      inline: false
    });

    await interaction.followUp({ embeds: [embed], ephemeral: true });

  } catch (error) {
    console.error('Fehler beim Importieren des Stundenplans:', error);
    await interaction.followUp({
      content: '❌ Fehler beim Verarbeiten der Datei. Bitte überprüfe das Format und versuche es erneut.',
      ephemeral: true
    });
  }
}
