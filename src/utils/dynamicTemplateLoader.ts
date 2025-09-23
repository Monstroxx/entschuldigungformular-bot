import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class DynamicTemplateLoader {
  private templatePath: string;

  constructor() {
    // Try multiple possible template paths
    const possiblePaths = [
      '/app/templates/2025-Entschuldigungsformular.docx', // Railway
      './templates/2025-Entschuldigungsformular.docx',     // Local
      path.join(process.cwd(), 'templates/2025-Entschuldigungsformular.docx'),
      path.join(__dirname, '../../templates/2025-Entschuldigungsformular.docx')
    ];

    this.templatePath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
    
    console.log(`Template-Pfad: ${this.templatePath}`);
    console.log(`Template existiert: ${fs.existsSync(this.templatePath)}`);
  }

  async generateForm(data: FormData): Promise<Buffer> {
    try {
      // Check if template exists
      if (!fs.existsSync(this.templatePath)) {
        throw new Error(`Template nicht gefunden: ${this.templatePath}`);
      }

      // Load the template - we'll work with the buffer directly
      const templateBuffer = fs.readFileSync(this.templatePath);
      
      // For now, create a new document and copy the structure
      // This is a simplified approach - in production you'd want to parse the existing DOCX
      const doc = new Document({
        sections: [{
          properties: {},
          children: []
        }]
      });

      // Replace placeholders
      this.replacePlaceholders(doc, data);

      // Add dynamic tables
      this.addDynamicTables(doc, data);

      // Generate buffer
      const buffer = await Packer.toBuffer(doc);
      return buffer;

    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
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

  private addDynamicTables(doc: Document, data: FormData): void {
    // Generate dynamic table data
    const tableData = this.generateTableData(data);
    
    // Find the section to add tables to
    const section = (doc as any).sections[0];
    if (!section) return;

    // Find the position to insert tables (after the greeting paragraph)
    let insertIndex = -1;
    section.children.forEach((child: any, index: number) => {
      if (child instanceof Paragraph) {
        const text = (child as any).children.map((c: any) => c.text).join('');
        if (text.includes('Ich entschuldige mein Fehlen')) {
          insertIndex = index + 1;
        }
      }
    });

    if (insertIndex === -1) return;

    // Remove existing static tables
    const childrenToRemove = [];
    section.children.forEach((child: any, index: number) => {
      if (child instanceof Table && index > insertIndex) {
        childrenToRemove.push(index);
      }
    });

    // Remove from end to beginning to maintain indices
    childrenToRemove.reverse().forEach(index => {
      section.children.splice(index, 1);
    });

    // Add dynamic tables
    tableData.forEach(table => {
      const dynamicTable = this.createTable(table);
      section.children.splice(insertIndex, 0, dynamicTable);
      insertIndex++;
    });
  }

  private generateTableData(data: FormData): any[] {
    const tables = [];
    
    // Group absence periods by week
    const weeks = this.groupAbsencePeriodsByWeek(data.absencePeriods);
    
    weeks.forEach(week => {
      const table = {
        rows: week.map(period => ({
          weekday: this.getWeekday(period.start),
          date: period.start.toLocaleDateString('de-DE'),
          // Add schedule data if available
          hour1: this.getScheduleForHour(data.schedule, 1),
          hour2: this.getScheduleForHour(data.schedule, 2),
          hour3: this.getScheduleForHour(data.schedule, 3),
          hour4: this.getScheduleForHour(data.schedule, 4),
          hour5: this.getScheduleForHour(data.schedule, 5),
          hour6: this.getScheduleForHour(data.schedule, 6),
          hour7: this.getScheduleForHour(data.schedule, 7),
          hour8: this.getScheduleForHour(data.schedule, 8)
        }))
      };
      tables.push(table);
    });
    
    return tables;
  }

  private createTable(tableData: any): Table {
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
    tableData.rows.forEach((row: any) => {
      const dataRow = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.weekday })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.date })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.hour1 || "" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.hour2 || "" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.hour3 || "" })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.hour4 || "" })] })] })
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
    const weeks = [];
    let currentWeek = [];
    
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
