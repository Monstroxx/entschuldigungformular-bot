import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PDFConverter {
  async convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    // For Railway, we'll just return the DOCX as PDF since conversion tools aren't available
    // This is a simple fallback - in production you might want to use a different approach
    console.log('⚠️ PDF-Konvertierung nicht verfügbar, sende DOCX als PDF');
    return docxBuffer;
  }

  private async convertWithLibreOffice(docxPath: string, pdfPath: string): Promise<Buffer> {
    const command = `libreoffice --headless --convert-to pdf --outdir "${path.dirname(pdfPath)}" "${docxPath}"`;
    
    await execAsync(command);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('LibreOffice Konvertierung fehlgeschlagen');
    }
    
    return fs.readFileSync(pdfPath);
  }

  private async convertWithPandoc(docxPath: string, pdfPath: string): Promise<Buffer> {
    const command = `pandoc "${docxPath}" -o "${pdfPath}"`;
    
    await execAsync(command);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('Pandoc Konvertierung fehlgeschlagen');
    }
    
    return fs.readFileSync(pdfPath);
  }

  private cleanupTempFiles(filePaths: string[]): void {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.warn(`Konnte temporäre Datei nicht löschen: ${filePath}`);
      }
    });
  }
}
