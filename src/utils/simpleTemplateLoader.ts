import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { FormData } from '../types';

export class SimpleTemplateLoader {
  async generateForm(data: FormData): Promise<Buffer> {
    // Create document with the exact structure
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

          // Name line
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.lastName}, ${data.firstName}`,
                bold: true
              })
            ]
          }),

          // Reason line
          new Paragraph({
            children: [
              new TextRun({
                text: `Grund: ${data.reason}`
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

          // Dynamic tables
          ...this.createDynamicTables(data),

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
                text: `${data.teacherLastName || 'Bruns'}, ${data.currentDate}`
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

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  private createDynamicTables(data: FormData): Table[] {
    const tables: Table[] = [];
    
    // Group absence periods by week
    const weeks = this.groupAbsencePeriodsByWeek(data.absencePeriods);
    
    weeks.forEach(week => {
      const table = this.createTable(week, data.schedule);
      tables.push(table);
    });
    
    return tables;
  }

  private createTable(week: any[], schedule: any[]): Table {
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

    // Add data rows
    week.forEach(period => {
      const weekday = this.getWeekday(period.start);
      const date = period.start.toLocaleDateString('de-DE');
      
      const dataRow = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: weekday })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: date })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: this.getScheduleForHour(schedule, 1) })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: this.getScheduleForHour(schedule, 2) })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: this.getScheduleForHour(schedule, 3) })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: this.getScheduleForHour(schedule, 4) })] })] })
        ]
      });
      rows.push(dataRow);
    });

    return new Table({
      rows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      }
    });
  }

  private groupAbsencePeriodsByWeek(periods: any[]): any[][] {
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    periods.forEach(period => {
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      
      // Generate all dates in the period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        currentWeek.push({
          start: new Date(d),
          end: new Date(d)
        });
        
        // If we have 5 days (Monday-Friday), start a new week
        if (currentWeek.length >= 5) {
          weeks.push([...currentWeek]);
          currentWeek = [];
        }
      }
    });
    
    // Add remaining days
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return weeks;
  }

  private getScheduleForHour(schedule: any[], hour: number): string {
    const hourStr = `${hour}. Stunde`;
    const scheduleEntry = schedule.find(s => s.hour === hourStr);
    return scheduleEntry ? scheduleEntry.subject : '';
  }

  private getWeekday(date: Date): string {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
  }
}
