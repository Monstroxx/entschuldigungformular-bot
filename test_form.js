const { SimpleTemplateLoader } = require('./dist/utils/simpleTemplateLoader');
const { PDFConverter } = require('./dist/utils/pdfConverter');
const fs = require('fs');

async function testFormGeneration() {
  console.log('🧪 Teste Formular-Generierung...');
  
  // Test-Daten
  const testData = {
    firstName: 'Jonas',
    lastName: 'Boos',
    reason: 'Krankheit',
    currentDate: '23.09.2025',
    teacherLastName: 'Müller',
    schedule: [
      { hour: '1. Stunde', subject: 'Mathe' },
      { hour: '2. Stunde', subject: 'Deutsch' },
      { hour: '3. Stunde', subject: 'Englisch' },
      { hour: '4. Stunde', subject: 'Physik' },
      { hour: '5. Stunde', subject: 'Chemie' },
      { hour: '6. Stunde', subject: 'Biologie' },
      { hour: '7. Stunde', subject: 'Geschichte' },
      { hour: '8. Stunde', subject: 'Sport' }
    ],
    absencePeriods: [
      {
        start: new Date('2024-11-18'), // Montag
        end: new Date('2024-11-22'),   // Freitag
        startTime: '08:00',
        endTime: '15:00'
      },
      {
        start: new Date('2024-11-25'), // Montag nächste Woche
        end: new Date('2024-11-29'),   // Freitag nächste Woche
        startTime: '08:00',
        endTime: '15:00'
      }
    ]
  };

  try {
    // Test DOCX-Generierung
    console.log('📄 Generiere DOCX...');
    const templateLoader = new SimpleTemplateLoader();
    const docxBuffer = await templateLoader.generateForm(testData);
    
    // Speichere DOCX
    fs.writeFileSync('test_form.docx', docxBuffer);
    console.log('✅ DOCX gespeichert: test_form.docx');
    
    // Test PDF-Konvertierung
    console.log('📄 Generiere PDF...');
    const pdfConverter = new PDFConverter();
    const pdfBuffer = await pdfConverter.convertDocxToPdf(docxBuffer);
    
    // Speichere PDF
    fs.writeFileSync('test_form.pdf', pdfBuffer);
    console.log('✅ PDF gespeichert: test_form.pdf');
    
    console.log('🎉 Test erfolgreich abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Fehler beim Test:', error);
  }
}

testFormGeneration();
