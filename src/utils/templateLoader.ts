import { createReport } from 'docx-templates';
import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class TemplateLoader {
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

      // Generate dynamic table data
      const tableData = this.generateTableData(data);

      // Prepare template data - use the exact placeholder format from the template
      const templateData = {
        VORNAME: data.firstName,
        NACHNAME: data.lastName,
        GRUND: data.reason,
        DATUM: data.currentDate,
        ORT: 'Bergisch Gladbach',
        LEHRER: data.teacherLastName || 'Bruns',
        // Add dynamic table data
        TABLES: tableData
      };

      // Generate document from template
      const buffer = await createReport({
        template: fs.readFileSync(this.templatePath),
        data: templateData,
        cmdDelimiter: ['[', ']'] as [string, string]
      });

      return Buffer.from(buffer);

    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
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
