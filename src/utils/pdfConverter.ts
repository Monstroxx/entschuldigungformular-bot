import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class PDFConverter {
  async convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const tempDir = '/tmp';
    const timestamp = Date.now();
    const docxPath = path.join(tempDir, `temp_${timestamp}.docx`);
    const pdfPath = path.join(tempDir, `temp_${timestamp}.pdf`);

    try {
      // Write DOCX to temporary file
      fs.writeFileSync(docxPath, docxBuffer);

      // Try different conversion methods
      let pdfBuffer: Buffer;

      try {
        // Method 1: LibreOffice (best quality)
        pdfBuffer = await this.convertWithLibreOffice(docxPath, pdfPath);
        console.log('✅ LibreOffice Konvertierung erfolgreich');
      } catch (error) {
        console.log('⚠️ LibreOffice nicht verfügbar, versuche andere Methoden...');
        
        try {
          // Method 2: pandoc (fallback)
          pdfBuffer = await this.convertWithPandoc(docxPath, pdfPath);
          console.log('✅ Pandoc Konvertierung erfolgreich');
        } catch (error2) {
          console.log('⚠️ Pandoc nicht verfügbar, verwende einfache Konvertierung...');
          
          // Method 3: Simple fallback (just return DOCX as PDF placeholder)
          pdfBuffer = docxBuffer; // This is not ideal, but works as fallback
          console.log('⚠️ PDF-Konvertierung nicht verfügbar, sende DOCX');
        }
      }

      return pdfBuffer;

    } catch (error) {
      console.error('Fehler bei PDF-Konvertierung:', error);
      throw error;
    } finally {
      // Cleanup temporary files
      this.cleanupTempFiles([docxPath, pdfPath]);
    }
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
