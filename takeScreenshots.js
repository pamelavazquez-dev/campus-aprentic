import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const roles = [
  { name: 'Admin', email: 'admin_test@demo.com', pass: 'Password123!', path: '/admin' },
  { name: 'Instructor', email: 'instructor_test@demo.com', pass: 'Password123!', path: '/instructor' },
  { name: 'Alumno', email: 'alumno_test@demo.com', pass: 'Password123!', path: '/alumno' }
];

async function run() {
  const previewDir = path.join(process.cwd(), 'Preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir);
  }

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const role of roles) {
    console.log(`Iniciando sesión como ${role.name}...`);
    await page.goto('http://localhost:5174/login', { waitUntil: 'load' });
    
    // Rellenar formulario
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', role.email);
    await page.type('input[type="password"]', role.pass);
    await page.click('button[type="submit"]');

    // Pequeña espera para login y carga de datos
    console.log(`Esperando a que cargue el dashboard de ${role.name}...`);
    await new Promise(r => setTimeout(r, 4000));
    
    // Check if there is an error message
    const errorHtml = await page.evaluate(() => {
      const err = document.querySelector('.danger600'); 
      return err ? err.innerText : (document.body.innerText.includes('Error') ? 'Posible error de credenciales' : null);
    });
    if (errorHtml) {
      console.log('⚠️ Error en login:', errorHtml);
    }
    
    const filepath = `c:/Users/user/.gemini/antigravity-ide/brain/e1241a12-d7dc-4f2c-b5e9-414b7209d096/${role.name}_Dashboard.png`;
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`✅ Captura guardada: ${filepath}`);

    // Cerrar sesión
    console.log('Cerrando sesión eliminando estado de Firebase Auth...');
    await page.evaluate(async () => {
      localStorage.clear();
      sessionStorage.clear();
      const dbs = await window.indexedDB.databases();
      for (const db of dbs) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });
    
    // Forzar recarga para perder sesión y volver al login limpio
    await page.goto('http://localhost:5174/login', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 1000));
  }

  await browser.close();
  console.log("¡Todas las capturas completadas!");
}

run().catch(console.error);
