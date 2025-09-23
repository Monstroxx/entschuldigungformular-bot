import { RealTemplateLoader } from './realTemplateLoader';
import { PDFConverter } from './pdfConverter';
import { FormData } from '../types';

const templateLoader = new RealTemplateLoader();
const pdfConverter = new PDFConverter();

export async function generateForm(data: FormData): Promise<Buffer> {
  return await templateLoader.generateForm(data);
}

export async function generateFormWithPDF(data: FormData): Promise<{ docx: Buffer; pdf: Buffer }> {
  // Generate DOCX from template
  const docxBuffer = await templateLoader.generateForm(data);
  
  // Convert to PDF
  const pdfBuffer = await pdfConverter.convertDocxToPdf(docxBuffer);
  
  return {
    docx: docxBuffer,
    pdf: pdfBuffer
  };
}