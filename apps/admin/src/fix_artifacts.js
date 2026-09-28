const fs = require('fs');
const path = 'c:/desktopfolders/asif.to/apps/admin/src/app/(admin)/jobs/discovery/page.jsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/dark:border-white\/ /g, 'dark:border-white/10 ');
code = code.replace(/dark:text-white\/ /g, 'dark:text-white ');
code = code.replace(/text-white\/30"/g, 'text-white/30 placeholder:text-zinc-400 dark:placeholder:text-white/30"');
fs.writeFileSync(path, code);
