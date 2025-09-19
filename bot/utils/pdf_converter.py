"""PDF Converter für den Entschuldigungsformular Bot."""

import os
import subprocess
import logging
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class PDFConverter:
    """Konvertiert DOCX zu PDF."""
    
    def __init__(self):
        """Initialisiert den PDF Converter."""
        # Prüfe ob wir auf Railway sind (kein LibreOffice)
        is_railway = os.getenv("RAILWAY_ENVIRONMENT") is not None
        
        if is_railway:
            # Auf Railway: WeasyPrint zuerst (kein LibreOffice)
            self.conversion_methods = [
                self._convert_with_weasyprint,
                self._convert_with_pandoc,
                self._convert_with_docx2pdf
            ]
        else:
            # Lokal: LibreOffice zuerst (beste Qualität)
            self.conversion_methods = [
                self._convert_with_libreoffice,
                self._convert_with_pandoc,
                self._convert_with_docx2pdf,
                self._convert_with_weasyprint
            ]
    
    def convert_docx_to_pdf(self, docx_path: str, output_dir: str = None) -> Optional[str]:
        """Konvertiert eine DOCX-Datei zu PDF."""
        if not os.path.exists(docx_path):
            logger.error(f"DOCX-Datei nicht gefunden: {docx_path}")
            return None
        
        if output_dir is None:
            output_dir = os.path.dirname(docx_path)
        
        # Generiere PDF-Pfad
        docx_name = Path(docx_path).stem
        pdf_path = os.path.join(output_dir, f"{docx_name}.pdf")
        
        # Versuche verschiedene Konvertierungsmethoden
        for method in self.conversion_methods:
            try:
                if method(docx_path, pdf_path):
                    logger.info(f"PDF erfolgreich erstellt: {pdf_path}")
                    return pdf_path
            except Exception as e:
                logger.warning(f"Konvertierungsmethode fehlgeschlagen: {e}")
                continue
        
        logger.error("Alle PDF-Konvertierungsmethoden fehlgeschlagen")
        return None
    
    def _convert_with_libreoffice(self, docx_path: str, pdf_path: str) -> bool:
        """Konvertiert mit LibreOffice (beste Qualität)."""
        try:
            # Prüfe ob LibreOffice verfügbar ist
            subprocess.run(['libreoffice', '--version'], 
                         capture_output=True, check=True)
            
            # Erstelle temporäres Verzeichnis für LibreOffice
            temp_dir = tempfile.mkdtemp()
            
            # Konvertiere zu PDF
            cmd = [
                'libreoffice',
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', temp_dir,
                docx_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                # Finde die erstellte PDF-Datei
                temp_pdf = os.path.join(temp_dir, os.path.basename(pdf_path))
                if os.path.exists(temp_pdf):
                    # Verschiebe PDF an den gewünschten Ort
                    import shutil
                    shutil.move(temp_pdf, pdf_path)
                    logger.info(f"PDF erfolgreich mit LibreOffice erstellt: {pdf_path}")
                    return True
            
            logger.warning(f"LibreOffice Konvertierung fehlgeschlagen: {result.stderr}")
            return False
                
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as e:
            logger.warning(f"LibreOffice nicht verfügbar: {e}")
            return False
    
    def _convert_with_docx2pdf(self, docx_path: str, pdf_path: str) -> bool:
        """Konvertiert mit docx2pdf (Python Library)."""
        try:
            from docx2pdf import convert
            convert(docx_path, pdf_path)
            return os.path.exists(pdf_path)
        except ImportError:
            logger.warning("docx2pdf nicht installiert")
            return False
        except Exception as e:
            logger.warning(f"docx2pdf Konvertierung fehlgeschlagen: {e}")
            return False
    
    def _convert_with_weasyprint(self, docx_path: str, pdf_path: str) -> bool:
        """Konvertiert mit WeasyPrint (HTML zu PDF)."""
        try:
            # Konvertiere DOCX zu HTML mit python-docx2txt
            import docx2txt
            html_content = docx2txt.process(docx_path)
            
            # Erstelle HTML-Datei mit besserem Styling
            html_path = docx_path.replace('.docx', '.html')
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        @page {{
                            margin: 2cm;
                            size: A4;
                        }}
                        body {{
                            font-family: "Times New Roman", serif;
                            font-size: 12pt;
                            line-height: 1.5;
                            margin: 0;
                            padding: 0;
                        }}
                        h1, h2, h3 {{
                            color: #000;
                            margin: 20px 0 10px 0;
                            font-weight: bold;
                        }}
                        h1 {{
                            font-size: 16pt;
                            text-align: center;
                        }}
                        h2 {{
                            font-size: 14pt;
                        }}
                        h3 {{
                            font-size: 12pt;
                        }}
                        table {{
                            border-collapse: collapse;
                            width: 100%;
                            margin: 10px 0;
                            font-size: 11pt;
                        }}
                        th, td {{
                            border: 1px solid #000;
                            padding: 6px 8px;
                            text-align: left;
                            vertical-align: top;
                        }}
                        th {{
                            background-color: #f0f0f0;
                            font-weight: bold;
                            text-align: center;
                        }}
                        .center {{
                            text-align: center;
                        }}
                        .bold {{
                            font-weight: bold;
                        }}
                        .underline {{
                            text-decoration: underline;
                        }}
                        p {{
                            margin: 6px 0;
                        }}
                        .signature-line {{
                            margin-top: 30px;
                            border-bottom: 1px solid #000;
                            width: 200px;
                            display: inline-block;
                        }}
                    </style>
                </head>
                <body>
                    {html_content.replace(chr(10), '<br>')}
                </body>
                </html>
                """)
            
            # Konvertiere HTML zu PDF mit WeasyPrint
            from weasyprint import HTML
            HTML(html_path).write_pdf(pdf_path)
            
            # Lösche HTML-Datei
            os.remove(html_path)
            
            if os.path.exists(pdf_path):
                logger.info(f"PDF erfolgreich mit WeasyPrint erstellt: {pdf_path}")
                return True
            else:
                return False
                
        except ImportError:
            logger.warning("WeasyPrint nicht installiert")
            return False
        except Exception as e:
            logger.warning(f"WeasyPrint Konvertierung fehlgeschlagen: {e}")
            return False
    
    def _convert_with_pandoc(self, docx_path: str, pdf_path: str) -> bool:
        """Konvertiert mit Pandoc (falls verfügbar)."""
        try:
            # Prüfe ob Pandoc verfügbar ist
            subprocess.run(['pandoc', '--version'], 
                         capture_output=True, check=True)
            
            # Konvertiere zu PDF
            cmd = ['pandoc', docx_path, '-o', pdf_path]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and os.path.exists(pdf_path):
                return True
            else:
                logger.warning(f"Pandoc Konvertierung fehlgeschlagen: {result.stderr}")
                return False
                
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    def cleanup_temp_files(self, *file_paths: str) -> None:
        """Löscht temporäre Dateien."""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.debug(f"Temporäre Datei gelöscht: {file_path}")
            except Exception as e:
                logger.warning(f"Fehler beim Löschen der temporären Datei {file_path}: {e}")
