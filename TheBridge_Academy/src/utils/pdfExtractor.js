import * as pdfjsLib from 'pdfjs-dist';

// Configuramos el worker utilizando el CDN para evitar problemas de empaquetado con Vite/Webpack
// Usamos https: para evitar problemas en entornos mixtos
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
