const fs = require('fs');
const path = require('path');
const dir = 'E:\\WEB HRIS\\DESAIN UI\\mobile';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const lastDoc = content.lastIndexOf('<!DOCTYPE html>');
  if (lastDoc > 0) {
    console.log('Fixing duplicate in', file);
    content = content.substring(lastDoc);
    fs.writeFileSync(filePath, content);
  }
}

// ALSO make it "seukuran pas hp" by removing the phone-frame wrapper!
// We'll strip:
// <div class="phone-container">
//   <div class="phone-frame">
//     <div class="phone-notch"></div>
//     <div class="phone-screen">
// and their closing tags at the bottom.
// We'll also change body styles to full width/height.
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove container opening tags
  content = content.replace(/<div class="phone-container">\s*<div class="phone-frame">\s*<div class="phone-notch"><\/div>\s*<div class="phone-screen">/g, '');
  
  // Remove closing tags
  content = content.replace(/<\/div>\s*<div class="phone-home-bar"><\/div>\s*<\/div>\s*<\/div>\s*<\/body>/g, '</body>');
  
  // Update body css
  content = content.replace(/body \{[\s\S]*?\}/g, 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F3F4F6; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; }');
  
  // Make sure scroll-area takes full height
  content = content.replace(/\.scroll-area \{[\s\S]*?\}/g, '.scroll-area { flex: 1; overflow-y: auto; padding-bottom: 80px; }');
  
  // Fix header gradient padding to act as normal header
  content = content.replace(/\.gradient-header \{[\s\S]*?\}/g, '.gradient-header { background: linear-gradient(135deg, #4b3ac3, #6c5ce7); padding: 40px 20px 20px; border-radius: 0 0 28px 28px; }');
  
  // Fix profile header
  content = content.replace(/\.profile-header \{[\s\S]*?\}/g, '.profile-header { background: #4b3ac3; padding: 40px 16px 20px; }');
  
  // Tab bar should be fixed at the bottom
  content = content.replace(/\.tab-bar \{[\s\S]*?\}/g, '.tab-bar { display: flex; background: #fff; padding: 12px 12px 20px; border-top: 1px solid #f3f4f6; justify-content: space-around; position: fixed; bottom: 0; width: 100%; z-index: 100; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }');

  fs.writeFileSync(filePath, content);
  console.log('Made seukuran pas hp:', file);
}
