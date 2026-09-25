const fs=require('fs');
let c=fs.readFileSync('src/services/email.service.js', 'utf8');
c = c.replace(/max-width:580px;/g, '');
c = c.replace(/border:1px solid \$\{BRAND\.border\};/g, '');
c = c.replace(/border-radius:28px;overflow:hidden;box-shadow:[^;]+;/g, '');
c = c.replace(/width="580"/g, 'width="100%"');
c = c.replace(/padding:40px 16px;/g, 'padding:0;');
c = c.replace(/background:\$\{BRAND\.background\}/g, 'background:${BRAND.surface}');
fs.writeFileSync('src/services/email.service.js', c);
