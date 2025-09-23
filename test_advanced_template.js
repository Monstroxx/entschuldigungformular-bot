require('dotenv').config();
const { AdvancedTemplateLoader } = require('./dist/utils/advancedTemplateLoader');
const { PDFConverter } = require('./dist/utils/pdfConverter');
const fs = require('fs');
const path = require('path');

async function testAdvancedTemplate() {
  console.log('🧪 Teste Advanced Template mit Tabellen-Manipulation...');

  const templateLoader = new AdvancedTemplateLoader();
  const pdfConverter = new PDFConverter();

  const testData = {
    firstName: 'Jonas',
    lastName: 'Boos',
    reason: 'Krankheit',
    currentDate: new Date().toLocaleDateString('de-DE'),
    teacherLastName: 'Müller',
    schedule: [
      { hour: '1. Stunde', subject: 'Mathe', weekday: 'Montag' },
      { hour: '2. Stunde', subject: 'Deutsch', weekday: 'Montag' },
      { hour: '3. Stunde', subject: 'Englisch', weekday: 'Dienstag' },
    ],
    absencePeriods: [
      { start: new Date('2024-11-18'), end: new Date('2024-11-22'), startTime: '08:00', endTime: '15:00' }, // Monday to Friday
    ]
  };

  try {
    // Generate DOCX with advanced template
    console.log('📄 Generiere DOCX mit Advanced Template...');
    const docxBuffer = await templateLoader.generateForm(testData);
    const docxPath = path.join(__dirname, 'test_advanced.docx');
    fs.writeFileSync(docxPath, docxBuffer);
    console.log(`✅ DOCX gespeichert: ${docxPath}`);

    // Generate PDF
    console.log('📄 Generiere PDF...');
    const pdfBuffer = await pdfConverter.convertDocxToPdf(docxBuffer);
    const pdfPath = path.join(__dirname, 'test_advanced.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`✅ PDF gespeichert: ${pdfPath}`);

    console.log('🎉 Test mit Advanced Template erfolgreich!');
  } catch (error) {
    console.error('❌ Fehler beim Testen des Advanced Templates:', error);
  }
}

testAdvancedTemplate();
