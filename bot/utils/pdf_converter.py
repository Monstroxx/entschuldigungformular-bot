"""PDF Converter für den Entschuldigungsformular Bot."""

import os
import subprocess
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class PDFConverter:
    """Konvertiert DOCX zu PDF."""
    
    def __init__(self):
        """Initialisiert den PDF Converter."""
        self.conversion_methods = [
            self._convert_with_libreoffice,
            self._convert_with_docx2pdf,
            self._convert_with_pandoc
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
            
            # Konvertiere zu PDF
            cmd = [
                'libreoffice',
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', os.path.dirname(pdf_path),
                docx_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and os.path.exists(pdf_path):
                return True
            else:
                logger.warning(f"LibreOffice Konvertierung fehlgeschlagen: {result.stderr}")
                return False
                
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
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
