import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export class RealTemplateLoader {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/2025-Entschuldigungsformular.docx');
  }

  public async generateForm(data: FormData): Promise<Buffer> {
    try {
      // Read the template file
      const templateBuffer = fs.readFileSync(this.templatePath);
      
      // Use docx-templates to fill the template
      const { createReport } = await import('docx-templates');
      
      // Prepare template data
      const templateData = {
        NACHNAME: data.lastName,
        VORNAME: data.firstName,
        GRUND: data.reason,
        ORT: 'Bergisch Gladbach',
        DATUM: data.currentDate,
        LEHRER: data.teacherLastName || 'Müller',
        // Add schedule data for table generation
        SCHEDULE_DATA: this.prepareScheduleData(data),
        ABSENCE_PERIODS: this.prepareAbsencePeriods(data.absencePeriods)
      };

      // Generate the document
      const report = await createReport({
        template: templateBuffer,
        data: templateData,
        cmdDelimiter: ['[', ']'],
        additionalJsContext: {
          // Helper functions for template
          formatDate: (date: Date) => date.toLocaleDateString('de-DE'),
          getWeekday: (date: Date) => {
            const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            return weekdays[date.getDay()];
          },
          getScheduleForDay: (schedule: any[], weekday: string) => {
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
        }
      });

      return Buffer.from(report);
    } catch (error) {
      console.error('Fehler beim Laden des Templates:', error);
      throw error;
    }
  }

  private prepareScheduleData(data: FormData): any {
    // Group schedule by weekday
    const scheduleByDay: { [key: string]: any[] } = {};
    
    data.schedule.forEach(entry => {
      if (entry.weekday) {
        if (!scheduleByDay[entry.weekday]) {
          scheduleByDay[entry.weekday] = [];
        }
        scheduleByDay[entry.weekday].push(entry);
      }
    });

    return scheduleByDay;
  }

  private prepareAbsencePeriods(periods: any[]): any[] {
    const processedPeriods: any[] = [];
    
    periods.forEach(period => {
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);
      
      // Generate all dates in the period
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (d.getDay() === 0 || d.getDay() === 6) {
          continue;
        }
        
        processedPeriods.push({
          start: new Date(d),
          end: new Date(d),
          weekday: this.getWeekday(d),
          dateStr: d.toLocaleDateString('de-DE')
        });
      }
    });

    return processedPeriods;
  }

  private getWeekday(date: Date): string {
    const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return weekdays[date.getDay()];
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

}
