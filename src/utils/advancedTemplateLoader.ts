import { FormData } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AdvancedTemplateLoader {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/2025-Entschuldigungsformular.docx');
  }

  public async generateForm(data: FormData): Promise<Buffer> {
    try {
      // Erstelle temporäre Dateien
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempInputPath = path.join(tempDir, 'template.docx');
      const tempOutputPath = path.join(tempDir, 'output.docx');
      const tempDataPath = path.join(tempDir, 'data.json');

      // Kopiere Template
      fs.copyFileSync(this.templatePath, tempInputPath);

      // Bereite Daten für Python vor
      const pythonData = {
        firstName: data.firstName,
        lastName: data.lastName,
        reason: data.reason,
        currentDate: data.currentDate,
        location: 'Bergisch Gladbach',
        teacherLastName: data.teacherLastName || 'Müller',
        absencePeriods: data.absencePeriods.map(period => ({
          start: period.start.toISOString(),
          end: period.end.toISOString(),
          startTime: period.startTime,
          endTime: period.endTime
        })),
        schedule: data.schedule.map(entry => ({
          hour: entry.hour,
          subject: entry.subject,
          weekday: entry.weekday
        }))
      };

      // Speichere Daten als JSON
      fs.writeFileSync(tempDataPath, JSON.stringify(pythonData, null, 2));

      // Führe Python-Script aus
      const pythonScriptPath = path.join(__dirname, '../../template_processor.py');
      const command = `python3 "${pythonScriptPath}" "${tempInputPath}" "${tempOutputPath}" "${JSON.stringify(pythonData).replace(/"/g, '\\"')}"`;

      console.log('Führe Python Template-Processor aus...');
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.log('Python stderr:', stderr);
      }

      // Lese generiertes Dokument
      if (!fs.existsSync(tempOutputPath)) {
        throw new Error('Python-Script hat keine Ausgabedatei erstellt');
      }

      const resultBuffer = fs.readFileSync(tempOutputPath);

      // Aufräumen
      try {
        fs.unlinkSync(tempInputPath);
        fs.unlinkSync(tempOutputPath);
        fs.unlinkSync(tempDataPath);
      } catch (cleanupError) {
        console.warn('Fehler beim Aufräumen der temporären Dateien:', cleanupError);
      }

      return resultBuffer;
    } catch (error) {
      console.error('Fehler beim Generieren des Formulars:', error);
      throw error;
    }
  }
}