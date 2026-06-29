import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { extractTextFromPDF } from '../utils/pdfExtractor';

export function usePDFImport() {
  const [isImporting, setIsImporting] = useState(false);
  const markdownRef = useRef('');
  const [markdownKey, setMarkdownKey] = useState(0);

  const importPDF = async (file, toastId = 'pdf-extract') => {
    if (!file) return false;

    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecciona un archivo PDF válido.', { id: toastId });
      return false;
    }

    setIsImporting(true);
    toast.loading('Extrayendo texto del PDF...', { id: toastId });
    
    try {
      const markdown = await extractTextFromPDF(file);
      
      const sizeInKB = new Blob([markdown]).size / 1024;
      if (sizeInKB > 800) {
        toast.error('El contenido del PDF es demasiado largo para una lectura cómoda. Te recomendamos dividir este tema en dos o más lecciones más cortas para facilitar el aprendizaje de tus alumnos.', { id: toastId, duration: 6000 });
        setIsImporting(false);
        return false;
      }

      markdownRef.current = markdown;
      setMarkdownKey(k => k + 1);
      toast.success('PDF importado como Markdown correctamente.', { id: toastId });
      return true;
    } catch (error) {
      console.error('Error extrayendo PDF:', error);
      toast.error('Error al procesar el PDF. Revisa la consola.', { id: toastId });
      return false;
    } finally {
      setIsImporting(false);
    }
  };

  const clearPDF = () => {
    markdownRef.current = '';
    setMarkdownKey(k => k + 1);
  };

  return {
    isImporting,
    importPDF,
    clearPDF,
    markdownRef,
    markdownKey,
    setMarkdownKey
  };
}
