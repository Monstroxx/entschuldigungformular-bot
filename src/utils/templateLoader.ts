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

      // Prepare template data
      const templateData = {
        VORNAME: data.firstName,
        NACHNAME: data.lastName,
        GRUND: data.reason,
        DATUM: data.currentDate,
        ORT: 'Bergisch Gladbach',
        LEHRER: data.teacherLastName || 'Bruns',
        // Add schedule data for table
        SCHEDULE: data.schedule.map(s => ({
          hour: s.hour,
          subject: s.subject
        })),
        // Add absence periods
        ABSENCE_PERIODS: data.absencePeriods.map(p => ({
          weekday: this.getWeekday(p.start),
          date: p.start.toLocaleDateString('de-DE'),
          startTime: p.startTime,
          endTime: p.endTime
        }))
      };

      // Generate document from template
      const buffer = await createReport({
        template: fs.readFileSync(this.templatePath),
        data: templateData
      });

      return Buffer.from(buffer);

    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
  }

  private getWeekday(date: Date): string {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
  }
}
