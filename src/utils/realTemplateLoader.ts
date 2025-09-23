import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

export class RealTemplateLoader {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/2025-Entschuldigungsformular.docx');
  }

  public async generateForm(data: FormData): Promise<Buffer> {
    try {
      // Read the template file
      const templateBuffer = fs.readFileSync(this.templatePath);
      
      // Load the document using mammoth
      const result = await mammoth.convertToHtml({ buffer: templateBuffer });
      const html = result.value;
      
      // For now, we'll use the simple template approach
      // TODO: Implement proper DOCX manipulation
      return this.generateSimpleForm(data);
    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
  }

  private async generateSimpleForm(data: FormData): Promise<Buffer> {
    // Create a simple document that mimics the template structure
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
                text: `${data.lastName}, ${data.firstName}`,
                bold: true
              })
            ]
          }),

          // Reason
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
                text: `Sehr geehrte/r Herr/Frau ${data.teacherLastName || 'Müller'},`
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

          // Dynamic Schedule tables
          ...this.createScheduleTables(data),

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
                text: `Bergisch Gladbach, ${data.currentDate}`
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
                text: "Unterschrift(bei Minderjährigen von einem Erziehungsberechtigten)"
              })
            ]
          })
        ]
      }]
    });

    return await Packer.toBuffer(doc);
  }

  private createScheduleTables(data: FormData): (Paragraph | Table)[] {
    const elements: (Paragraph | Table)[] = [];
    const weeks = this.groupAbsencePeriodsByWeek(data.absencePeriods);

    weeks.forEach((week, index) => {
      if (index > 0) {
        elements.push(new Paragraph({ children: [new TextRun({ text: "" })] })); // Spacing between tables
      }

      const rows: TableRow[] = [];

      // Header row
      const headerRow = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], borders: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.NONE, size: 0 }, left: { style: BorderStyle.NONE, size: 0 }, right: { style: BorderStyle.NONE, size: 0 } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "" })] })], borders: { top: { style: BorderStyle.NONE, size: 0 }, bottom: { style: BorderStyle.NONE, size: 0 }, left: { style: BorderStyle.NONE, size: 0 }, right: { style: BorderStyle.NONE, size: 0 } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1./2." })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3./4." })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5./6." })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "7./8." })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } })
        ]
      });
      rows.push(headerRow);

      // Add absence periods
      week.forEach(period => {
        const weekday = this.getWeekday(period.start);
        const dateStr = period.start.toLocaleDateString('de-DE');

        const scheduleEntries = this.getScheduleForDay(data.schedule, weekday);

        const absenceRow = new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: weekday })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: dateStr })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scheduleEntries['1./2.'] || '' })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scheduleEntries['3./4.'] || '' })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scheduleEntries['5./6.'] || '' })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: scheduleEntries['7./8.'] || '' })] })], borders: { top: { style: BorderStyle.SINGLE, size: 6 }, bottom: { style: BorderStyle.SINGLE, size: 6 }, left: { style: BorderStyle.SINGLE, size: 6 }, right: { style: BorderStyle.SINGLE, size: 6 } } })
          ]
        });
        rows.push(absenceRow);
      });

      elements.push(new Table({
        rows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE
        }
      }));
    });

    return elements;
  }

  private groupAbsencePeriodsByWeek(periods: any[]): any[][] {
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    periods.forEach(period => {
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      
      // Generate all dates in the period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (d.getDay() === 0 || d.getDay() === 6) {
          continue;
        }
        
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


  private getScheduleForDay(schedule: any[], weekday: string): { [key: string]: string } {
    const daySchedule: { [key: string]: string } = {};
    const hoursMap: { [key: string]: string } = {
      '1. Stunde': '1./2.',
      '2. Stunde': '1./2.',
      '3. Stunde': '3./4.',
      '4. Stunde': '3./4.',
      '5. Stunde': '5./6.',
      '6. Stunde': '5./6.',
      '7. Stunde': '7./8.',
      '8. Stunde': '7./8.',
    };

    schedule.filter(s => s.weekday === weekday).forEach(entry => {
      const hourBlock = hoursMap[entry.hour];
      if (hourBlock) {
        daySchedule[hourBlock] = daySchedule[hourBlock] ? `${daySchedule[hourBlock]}, ${entry.subject}` : entry.subject;
      }
    });
    
    return daySchedule;
  }

  private getWeekday(date: Date): string {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
  }
}
