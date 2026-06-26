import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Configurar el worker usando new URL + import.meta.url para Vite (Compatible con v3.x)
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Inicializar el documento
  const loadingTask = getDocument({ 
    data: arrayBuffer,
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
  });
  const pdf = await loadingTask.promise;
  
  let fullMarkdown = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
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
  
  return fullMarkdown.replace(/ +/g, ' ').trim();
};
