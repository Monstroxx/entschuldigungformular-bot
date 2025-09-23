import { 
  ChatInputCommandInteraction, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder,
  EmbedBuilder
} from 'discord.js';
import { prisma } from '../database/client';

export async function setupCommands(interaction: ChatInputCommandInteraction) {
  // Create modal
  const modal = new ModalBuilder()
    .setCustomId('setup_modal')
    .setTitle('Bot Setup - Initialkonfiguration');

  // Personal data inputs
  const firstNameInput = new TextInputBuilder()
    .setCustomId('first_name')
    .setLabel('Dein Vorname')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. Max')
    .setRequired(true)
    .setMaxLength(50);

  const lastNameInput = new TextInputBuilder()
    .setCustomId('last_name')
    .setLabel('Dein Nachname')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. Mustermann')
    .setRequired(true)
    .setMaxLength(50);

  // Teacher data inputs
  const teacherFirstNameInput = new TextInputBuilder()
    .setCustomId('teacher_first_name')
    .setLabel('Vorname deines Klassenlehrers')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. Hans')
    .setRequired(true)
    .setMaxLength(50);

  const teacherLastNameInput = new TextInputBuilder()
    .setCustomId('teacher_last_name')
    .setLabel('Nachname deines Klassenlehrers')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('z.B. Müller')
    .setRequired(true)
    .setMaxLength(50);

  // Add inputs to action rows
  const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput);
  const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(lastNameInput);
  const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(teacherFirstNameInput);
  const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(teacherLastNameInput);

  // Add action rows to modal
  modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

  await interaction.showModal(modal);
}

export async function handleSetupModal(interaction: any) {
  if (!interaction.isModalSubmit()) return;

  if (interaction.customId === 'setup_modal') {
    const firstName = interaction.fields.getTextInputValue('first_name');
    const lastName = interaction.fields.getTextInputValue('last_name');
    const teacherFirstName = interaction.fields.getTextInputValue('teacher_first_name');
    const teacherLastName = interaction.fields.getTextInputValue('teacher_last_name');

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { discordId: interaction.user.id }
      });

      if (existingUser) {
        // Update existing user
        await prisma.user.update({
          where: { discordId: interaction.user.id },
          data: {
            firstName,
            lastName,
            teacherFirstName,
            teacherLastName,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new user
        await prisma.user.create({
          data: {
            discordId: interaction.user.id,
            firstName,
            lastName,
            teacherFirstName,
            teacherLastName
          }
        });
      }

      // Create success embed
      const embed = new EmbedBuilder()
        .setTitle('✅ Setup erfolgreich abgeschlossen!')
        .setDescription('Deine Daten wurden gespeichert.')
        .setColor(0x00ff00)
        .addFields(
          {
            name: 'Deine Daten',
            value: `**Name:** ${firstName} ${lastName}`,
            inline: false
          },
          {
            name: 'Lehrer-Daten',
            value: `**Klassenlehrer:** ${teacherFirstName} ${teacherLastName}`,
            inline: false
          },
          {
            name: 'Nächste Schritte',
            value: '• Verwende `/import` um deinen Stundenplan hochzuladen\n• Verwende `/start` um ein Entschuldigungsformular zu erstellen\n• Verwende `/help` für weitere Informationen',
            inline: false
          }
        );

      await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (error) {
      console.error('Fehler beim Speichern der Setup-Daten:', error);
      await interaction.reply({
        content: '❌ Fehler beim Speichern der Daten. Bitte versuche es erneut.',
        flags: 64
      });
    }
  }
}
