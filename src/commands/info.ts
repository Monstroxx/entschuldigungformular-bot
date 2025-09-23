import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { prisma } from '../database/client';

export const infoCommand = new SlashCommandBuilder()
  .setName('info')
  .setDescription('Zeigt Bot-Informationen und Statistiken');

export async function handleInfoCommand(interaction: any) {
  try {
    // Get statistics from database
    const [userCount, formCount, scheduleCount] = await Promise.all([
      prisma.user.count(),
      prisma.excuseForm.count(),
      prisma.schedule.count()
    ]);

    // Create embed with statistics
    const embed = new EmbedBuilder()
      .setTitle('📋 Entschuldigungsformular Bot')
      .setDescription('Ein Discord Bot für die einfache Generierung von Krankmeldungen')
      .setColor(0x00AE86)
      .addFields(
        {
          name: '📊 Statistiken',
          value: `👥 **Benutzer:** ${userCount}\n📄 **Generierte Formulare:** ${formCount}\n📅 **Stundenpläne:** ${scheduleCount}`,
          inline: false
        },
        {
          name: '🔧 Verfügbare Commands',
          value: '`/setup` - Bot einrichten\n`/import` - Stundenplan importieren\n`/start` - Krankmeldung erstellen\n`/help` - Hilfe anzeigen',
          inline: false
        },
        {
          name: '💡 Features',
          value: '✅ Automatische Formular-Generierung\n✅ Stundenplan-Integration\n✅ PDF & DOCX Export\n✅ Dynamische Tabellen',
          inline: false
        }
      )
      .setFooter({ text: 'Entwickelt mit ❤️ für Schüler und Studenten' })
      .setTimestamp();

    // Create buttons
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setLabel('🚀 Railway Hosting')
          .setStyle(ButtonStyle.Link)
          .setURL('https://railway.com/?referralCode=JaS_Iy'),
        new ButtonBuilder()
          .setLabel('☕ Ko-fi Support')
          .setStyle(ButtonStyle.Link)
          .setURL('https://ko-fi.com/monstrox')
      );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      flags: 64 // EPHEMERAL
    });

  } catch (error) {
    console.error('Fehler beim Info-Command:', error);
    await interaction.reply({
      content: '❌ Fehler beim Laden der Informationen!',
      flags: 64
    });
  }
}
