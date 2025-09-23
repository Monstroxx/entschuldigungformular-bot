import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { FormData } from '../types';

export class TemplateGenerator {
  async generateForm(data: FormData): Promise<Buffer> {
    // Create document with the exact structure from the Python version
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
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE
          }),

          // Spacing
          new Paragraph({ children: [new TextRun({ text: "" })] }),

          // Name line - with placeholders
          new Paragraph({
            children: [
              new TextRun({
                text: `[NACHNAME], [VORNAME]`,
                bold: true
              })
            ]
          }),

          // Reason line - with placeholder
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
          this.createScheduleTable(data),

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

          // Location and date - with placeholders
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
                text: "_________________________________________________"
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
    this.replacePlaceholders(doc, data);

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  private createScheduleTable(data: FormData): Table {
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
      const weekday = this.getWeekday(period.start);
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

  private replacePlaceholders(doc: Document, data: FormData): void {
    const replacements = {
      '[VORNAME]': data.firstName,
      '[NACHNAME]': data.lastName,
      '[GRUND]': data.reason,
      '[DATUM]': data.currentDate,
      '[ORT]': 'Bergisch Gladbach',
      '[LEHRER]': data.teacherLastName || 'Bruns'
    };

    // Replace in sections
    (doc as any).sections.forEach((section: any) => {
      section.children.forEach((child: any) => {
        if (child instanceof Paragraph) {
          this.replaceInParagraph(child, replacements);
        } else if (child instanceof Table) {
          this.replaceInTable(child, replacements);
        }
      });
    });
  }

  private replaceInParagraph(paragraph: Paragraph, replacements: Record<string, string>): void {
    (paragraph as any).children.forEach((child: any) => {
      if (child instanceof TextRun) {
        let text = (child as any).text;
        Object.entries(replacements).forEach(([placeholder, value]) => {
          text = text.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        });
        (child as any).text = text;
      }
    });
  }

  private replaceInTable(table: Table, replacements: Record<string, string>): void {
    (table as any).rows.forEach((row: any) => {
      row.cells.forEach((cell: any) => {
        cell.paragraphs.forEach((paragraph: any) => {
          this.replaceInParagraph(paragraph, replacements);
        });
      });
    });
  }

  private getWeekday(date: Date): string {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
  }
}