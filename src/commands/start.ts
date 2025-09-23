import { 
  ChatInputCommandInteraction, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  EmbedBuilder,
  AttachmentBuilder
} from 'discord.js';
import { prisma } from '../database/client';
import { generateFormWithPDF } from '../utils/formGenerator';

export async function startCommand(interaction: ChatInputCommandInteraction) {
  try {
    // Check if user has completed setup
    const user = await prisma.user.findUnique({
      where: { discordId: interaction.user.id }
    });

  if (!user || !user.firstName || !user.lastName) {
    await interaction.reply({
      content: '❌ Bitte führe zuerst `/setup` aus, um deine Daten zu konfigurieren!',
      flags: 64 // EPHEMERAL flag
    });
    return;
  }

  // Create modal for form data
  const modal = new ModalBuilder()
    .setCustomId('start_form_modal')
    .setTitle('Entschuldigungsformular erstellen');

  // Reason input
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Grund für die Abwesenheit')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('z.B. Krankheit, Arzttermin, etc.')
    .setRequired(true)
    .setMaxLength(500);

  // Start date input
  const startDateInput = new TextInputBuilder()
    .setCustomId('start_date')
    .setLabel('Startdatum (DD.MM.YYYY)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. 19.09.2025')
    .setRequired(true)
    .setMaxLength(10);

  // End date input
  const endDateInput = new TextInputBuilder()
    .setCustomId('end_date')
    .setLabel('Enddatum (DD.MM.YYYY)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. 20.09.2025')
    .setRequired(true)
    .setMaxLength(10);

  // Start time input
  const startTimeInput = new TextInputBuilder()
    .setCustomId('start_time')
    .setLabel('Startzeit (HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. 08:00')
    .setRequired(true)
    .setMaxLength(5);

  // End time input
  const endTimeInput = new TextInputBuilder()
    .setCustomId('end_time')
    .setLabel('Endzeit (HH:MM)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. 15:00')
    .setRequired(true)
    .setMaxLength(5);

  // Add inputs to action rows
  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(startDateInput);
  const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(endDateInput);
  const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(startTimeInput);
  const fifthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(endTimeInput);

  // Add action rows to modal
  modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

  await interaction.showModal(modal);
  } catch (error: any) {
    console.error('Fehler im startCommand:', error);
    if (error.code === 'P2021') {
      await interaction.reply({
        content: '❌ Datenbank-Tabellen existieren noch nicht. Bitte warte einen Moment und versuche es erneut.',
        flags: 64
      });
    } else {
      await interaction.reply({
        content: '❌ Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        flags: 64
      });
    }
  }
}

export async function handleStartModal(interaction: any) {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'start_form_modal') {
    const reason = interaction.fields.getTextInputValue('reason');
    const startDateStr = interaction.fields.getTextInputValue('start_date');
    const endDateStr = interaction.fields.getTextInputValue('end_date');
    const startTime = interaction.fields.getTextInputValue('start_time');
    const endTime = interaction.fields.getTextInputValue('end_time');

    try {
      // Parse dates
      const startDate = parseDate(startDateStr);
      const endDate = parseDate(endDateStr);

      if (!startDate || !endDate) {
        await interaction.reply({
          content: '❌ Ungültiges Datumsformat! Verwende DD.MM.YYYY',
          ephemeral: true
        });
        return;
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { discordId: interaction.user.id },
        include: { schedules: true }
      });

      if (!user) {
        await interaction.reply({
          content: '❌ Benutzer nicht gefunden! Führe zuerst `/setup` aus.',
          ephemeral: true
        });
        return;
      }

      // Generate form
      const formData = {
        firstName: user.firstName!,
        lastName: user.lastName!,
        reason,
        currentDate: new Date().toLocaleDateString('de-DE'),
        teacherLastName: user.teacherLastName,
        schedule: user.schedules,
        absencePeriods: [{
          start: startDate,
          end: endDate,
          startTime,
          endTime
        }]
      };

      // Generate DOCX and PDF files
      const { docx: docxBuffer, pdf: pdfBuffer } = await generateFormWithPDF(formData);

      // Create attachments
      const docxAttachment = new AttachmentBuilder(docxBuffer, {
        name: `Entschuldigungsformular_${user.firstName}_${user.lastName}.docx`
      });

      const pdfAttachment = new AttachmentBuilder(pdfBuffer, {
        name: `Entschuldigungsformular_${user.firstName}_${user.lastName}.pdf`
      });

      // Create success embed
      const embed = new EmbedBuilder()
        .setTitle('✅ Formular erfolgreich erstellt!')
        .setDescription('Dein Entschuldigungsformular wurde generiert.')
        .setColor(0x00ff00)
        .addFields(
          {
            name: 'Details',
            value: `**Name:** ${user.firstName} ${user.lastName}\n**Grund:** ${reason}\n**Zeitraum:** ${startDateStr} - ${endDateStr}`,
            inline: false
          }
        );

      // Send DOCX first
      await interaction.reply({ 
        embeds: [embed], 
        files: [docxAttachment],
        flags: 64 
      });

      // Send PDF as follow-up
      await interaction.followUp({
        content: '📄 Hier ist dein Formular als PDF:',
        files: [pdfAttachment],
        flags: 64
      });

      // Save to database
      await prisma.excuseForm.create({
        data: {
          userId: user.id,
          reason,
          startDate,
          endDate,
          filePath: `generated/entschuldigung_${user.firstName}_${user.lastName}_${Date.now()}.docx`
        }
      });

    } catch (error) {
      console.error('Fehler beim Erstellen des Formulars:', error);
      await interaction.reply({
        content: '❌ Fehler beim Erstellen des Formulars. Bitte versuche es erneut.',
        ephemeral: true
      });
    }
  }
}

function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Month is 0-indexed
  const year = parseInt(parts[2]);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
}
