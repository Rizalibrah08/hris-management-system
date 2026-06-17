import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const srcDirs = [
  { in: '../DESAIN UI/web', out: '../DESAIN UI/web_jpg', viewport: { width: 1440, height: 900 } },
  { in: '../DESAIN UI/mobile', out: '../DESAIN UI/mobile_jpg', viewport: { width: 390, height: 844, isMobile: true } }
];

(async () => {
  const browser = await puppeteer.launch();
  
  for (const dir of srcDirs) {
    if (!fs.existsSync(dir.out)) {
      fs.mkdirSync(dir.out, { recursive: true });
    }
    
    const files = fs.readdirSync(dir.in).filter(f => f.endsWith('.html'));
    for (const file of files) {
      const page = await browser.newPage();
      await page.setViewport(dir.viewport);
      const filePath = path.resolve(dir.in, file);
      const fileUrl = 'file://' + filePath.replace(/\\/g, '/');
      console.log('Processing:', fileUrl);
      
      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        const outPath = path.resolve(dir.out, file.replace('.html', '.jpg'));
        await page.screenshot({ path: outPath, type: 'jpeg', fullPage: true, quality: 90 });
        console.log('Saved:', outPath);
      } catch (err) {
        console.error('Failed to screenshot:', file, err);
      }
      await page.close();
    }
  }
  
  await browser.close();
})();
