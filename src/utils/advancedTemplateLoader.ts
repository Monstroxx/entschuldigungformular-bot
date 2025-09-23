import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class AdvancedTemplateLoader {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/2025-Entschuldigungsformular.docx');
  }

  public async generateForm(data: FormData): Promise<Buffer> {
    try {
      // Read the template file
      const templateBuffer = fs.readFileSync(this.templatePath);
      
      // Use docx-templates to fill placeholders first
      const { createReport } = await import('docx-templates');
      
      // Prepare template data
      const templateData = {
        NACHNAME: data.lastName,
        VORNAME: data.firstName,
        GRUND: data.reason,
        ORT: 'Bergisch Gladbach',
        DATUM: data.currentDate,
        LEHRER: data.teacherLastName || 'Müller',
        // Generate table HTML for replacement
        TABELLE: this.generateTableHTML(data)
      };

      // Generate the document with placeholders filled
      const report = await createReport({
        template: templateBuffer,
        data: templateData,
        cmdDelimiter: ['[', ']'],
        additionalJsContext: {}
      });

      return Buffer.from(report);
    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
  }

  private generateTableHTML(data: FormData): string {
    const weeks = this.groupAbsencePeriodsByWeek(data.absencePeriods);
    let tableHTML = '';

    weeks.forEach((week, weekIndex) => {
      if (weekIndex > 0) {
        tableHTML += '<br/><br/>'; // Spacing between tables
      }

      tableHTML += `
        <table border="1" style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="border: 1px solid black; padding: 5px;"></td>
            <td style="border: 1px solid black; padding: 5px;"></td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;"><strong>1./2.</strong></td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;"><strong>3./4.</strong></td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;"><strong>5./6.</strong></td>
            <td style="border: 1px solid black; padding: 5px; text-align: center;"><strong>7./8.</strong></td>
          </tr>
      `;

      week.forEach(period => {
        const weekday = this.getWeekday(period.start);
        const dateStr = period.start.toLocaleDateString('de-DE');
        const scheduleEntries = this.getScheduleForDay(data.schedule, weekday);

        tableHTML += `
          <tr>
            <td style="border: 1px solid black; padding: 5px;">${weekday}</td>
            <td style="border: 1px solid black; padding: 5px;">${dateStr}</td>
            <td style="border: 1px solid black; padding: 5px;">${scheduleEntries['1./2.'] || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${scheduleEntries['3./4.'] || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${scheduleEntries['5./6.'] || ''}</td>
            <td style="border: 1px solid black; padding: 5px;">${scheduleEntries['7./8.'] || ''}</td>
          </tr>
        `;
      });

      tableHTML += '</table>';
    });

    return tableHTML;
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
