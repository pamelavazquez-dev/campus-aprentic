import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Configurar el worker usando new URL + import.meta.url para Vite (Compatible con v3.x)
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const standardFontDataUrl = '/standard_fonts/';

export const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Inicializar el documento
  const loadingTask = getDocument({ 
    data: arrayBuffer,
    cMapUrl: '/cmaps/',
    cMapPacked: true,
    standardFontDataUrl,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  
  let parts = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    // Ceder el control al hilo principal (Event Loop) para no congelar la UI
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    let lastY = -1;
    const lines = [];
    
    for (const item of textContent.items) {
      if (lastY !== item.transform[5] && lines.length > 0) {
        lines.push('\n');
      }
      lines.push(item.str, ' ');
      lastY = item.transform[5];
    }
    
    parts.push(lines.join(''));
  }
  
  return parts.join('\n\n').replace(/ +/g, ' ').trim();
};
