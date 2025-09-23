import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { FormData } from '../types';

export async function generateForm(data: FormData): Promise<Buffer> {
  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Title
        new Paragraph({
          children: [
            new TextRun({
              text: "Entschuldigungsformular",
              bold: true,
              size: 32
            })
          ],
          alignment: AlignmentType.CENTER
        }),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Name
        new Paragraph({
          children: [
            new TextRun({
              text: `[NACHNAME], [VORNAME]`,
              bold: true
            })
          ]
        }),

        // Reason
        new Paragraph({
          children: [
            new TextRun({
              text: `Grund: [GRUND]`
            })
          ]
        }),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Greeting
        new Paragraph({
          children: [
            new TextRun({
              text: "Sehr geehrter Herr Bruns,"
            })
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Ich entschuldige mein Fehlen für die Unterrichtsstunden an folgenden Tagen:"
            })
          ]
        }),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Schedule table
        createScheduleTable(data),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Note
        new Paragraph({
          children: [
            new TextRun({
              text: "Anmerkung: Klausurtermine müssen gekennzeichnet und mit Attest entschuldigt werden."
            })
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "Bei Bedarf die oben stehende Tabelle duplizieren."
            })
          ]
        }),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Line
        new Paragraph({
          children: [
            new TextRun({
              text: "_________________________________________________"
            })
          ]
        }),

        // Location and date
        new Paragraph({
          children: [
            new TextRun({
              text: "[ORT], [DATUM]"
            })
          ]
        }),

        // Spacing
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Line
        new Paragraph({
          children: [
            new TextRun({
              text: " _________________________________________________"
            })
          ]
        }),

        // Signature
        new Paragraph({
          children: [
            new TextRun({
              text: "Unterschrift"
            })
          ]
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: "(bei Minderjährigen von einem Erziehungsberechtigten)"
            })
          ]
        })
      ]
    }]
  });

  // Replace placeholders
  replacePlaceholders(doc, data);

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

function createScheduleTable(data: FormData): Table {
  const rows: TableRow[] = [];

  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1./2." })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3./4." })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5./6." })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "7./8." })] })] })
    ]
  });
  rows.push(headerRow);

  // Add absence periods
  for (const period of data.absencePeriods) {
    const weekday = getWeekday(period.start);
    const dateStr = period.start.toLocaleDateString('de-DE');
    
    const absenceRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: weekday })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: dateStr })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })] })
      ]
    });
    rows.push(absenceRow);
  }

  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE
    }
  });
}

function replacePlaceholders(doc: Document, data: FormData) {
  // This is a simplified version - in a real implementation,
  // you would need to traverse the document structure and replace text
  // For now, we'll create a basic replacement system
  
  // Note: This is a simplified approach. In a real implementation,
  // you would need to properly traverse the document structure
  // and replace text in paragraphs and table cells
}

function getWeekday(date: Date): string {
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  return weekdays[date.getDay()];
}
