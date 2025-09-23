require('dotenv').config();
const { RealTemplateLoader } = require('./dist/utils/realTemplateLoader');
const { PDFConverter } = require('./dist/utils/pdfConverter');
const fs = require('fs');
const path = require('path');

async function testRealTemplateFinal() {
  console.log('🧪 Teste echtes Template mit docx-templates...');

  const templateLoader = new RealTemplateLoader();
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
    // Generate DOCX with real template
    console.log('📄 Generiere DOCX mit echtem Template...');
    const docxBuffer = await templateLoader.generateForm(testData);
    const docxPath = path.join(__dirname, 'test_real_final.docx');
    fs.writeFileSync(docxPath, docxBuffer);
    console.log(`✅ DOCX gespeichert: ${docxPath}`);

    // Generate PDF
    console.log('📄 Generiere PDF...');
    const pdfBuffer = await pdfConverter.convertDocxToPdf(docxBuffer);
    const pdfPath = path.join(__dirname, 'test_real_final.pdf');
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`✅ PDF gespeichert: ${pdfPath}`);

    console.log('🎉 Test mit echtem Template erfolgreich!');
  } catch (error) {
    console.error('❌ Fehler beim Testen des echten Templates:', error);
  }
}

testRealTemplateFinal();
