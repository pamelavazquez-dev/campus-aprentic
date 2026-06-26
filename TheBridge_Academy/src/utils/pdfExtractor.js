import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configuramos el worker utilizando el archivo local proporcionado por pdfjs-dist
// Vite permite importar URLs estáticas con ?url
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullMarkdown = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Un procesado rudimentario para evitar que se junten las palabras sin espacios.
    // pdfjs a veces separa texto en items distintos.
    let lastY = -1;
    let text = '';
    
    for (const item of textContent.items) {
      if (lastY !== item.transform[5] && text.length > 0) {
        text += '\n';
      }
      text += item.str + ' ';
      lastY = item.transform[5];
    }
    
    fullMarkdown += text + '\n\n';
  }
  
  // Limpieza básica de espacios múltiples
  return fullMarkdown.replace(/ +/g, ' ').trim();
};
