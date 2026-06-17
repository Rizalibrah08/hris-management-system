const fs = require('fs');
const path = require('path');

const dir = 'E:\\WEB HRIS\\DESAIN UI\\mobile';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'login.html');

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  
  // Create correct tab bar
  const makeTab = (name, label, icon, current) => {
    const isActive = name === current ? ' active' : '';
    return `        <div class="tab-item${isActive}">
          <span class="tab-icon">${icon}</span>
          <span class="tab-label">${label}</span>
        </div>`;
  };

  let currentTab = '';
  if (file === 'dashboard.html') currentTab = 'Home';
  if (file === 'absensi.html') currentTab = 'Attendance';
  if (file === 'payroll.html' || file === 'slipgaji.html') currentTab = 'Payroll';
  if (file === 'cuti.html') currentTab = 'Leave';
  if (file === 'profil.html') currentTab = 'Profile';

  const newTabBar = `<div class="tab-bar">
${makeTab('Home', 'Dashboard', '&#127968;', currentTab)}
${makeTab('Attendance', 'Absensi', '&#128197;', currentTab)}
${makeTab('Payroll', 'Payroll', '&#128176;', currentTab)}
${makeTab('Leave', 'Cuti', '&#127965;', currentTab)}
${makeTab('Profile', 'Profil', '&#128100;', currentTab)}
      </div>`;

  // Replace existing tab bar
  content = content.replace(/<div class="tab-bar">[\s\S]*?<\/div>\s*<\/div>\s*<div class="phone-home-bar">/m, newTabBar + '\n    </div>\n    <div class="phone-home-bar">');
  
  fs.writeFileSync(path.join(dir, file), content);
}
console.log('Tab bars updated!');
