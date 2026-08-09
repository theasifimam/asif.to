const fs = require('fs');
const path = require('path');

const files = [
    'app/page.tsx',
    'app/subscribe/page.tsx',
    'components/Header.tsx',
    'components/Footer.tsx'
];

function processContent(content) {
    // Basic replacements
    content = content.replace(/bg-\[#fcfcfc\]/g, "bg-[#fcfcfc] dark:bg-[#0a0a0a]");
    content = content.replace(/bg-zinc-900/g, "bg-zinc-900 dark:bg-zinc-100");
    content = content.replace(/text-zinc-900/g, "text-zinc-900 dark:text-zinc-100");
    content = content.replace(/selection:bg-zinc-900/g, "selection:bg-zinc-900 dark:selection:bg-zinc-100");
    content = content.replace(/selection:text-white/g, "selection:text-white dark:selection:text-zinc-900");

    // Replace hover:bg-zinc-900 -> hover:bg-zinc-900 dark:hover:bg-zinc-100
    content = content.replace(/hover:bg-zinc-900/g, "hover:bg-zinc-900 dark:hover:bg-zinc-100");
    content = content.replace(/hover:text-zinc-900/g, "hover:text-zinc-900 dark:hover:text-zinc-100");
    content = content.replace(/border-zinc-900/g, "border-zinc-900 dark:border-zinc-100");

    // Zinc 800
    content = content.replace(/text-zinc-800/g, "text-zinc-800 dark:text-zinc-200");
    content = content.replace(/bg-zinc-800/g, "bg-zinc-800 dark:bg-zinc-200");
    content = content.replace(/border-zinc-800/g, "border-zinc-800 dark:border-zinc-200");

    // Zinc 600
    content = content.replace(/text-zinc-600/g, "text-zinc-600 dark:text-zinc-400");
    content = content.replace(/hover:text-zinc-600/g, "hover:text-zinc-600 dark:hover:text-zinc-400");

    // Zinc 100 -> Zinc 900
    content = content.replace(/bg-zinc-100/g, "bg-zinc-100 dark:bg-zinc-900");
    content = content.replace(/border-zinc-100/g, "border-zinc-100 dark:border-zinc-900");
    content = content.replace(/hover:bg-zinc-100/g, "hover:bg-zinc-100 dark:hover:bg-zinc-900");

    // Zinc 200 -> Zinc 800
    content = content.replace(/bg-zinc-200/g, "bg-zinc-200 dark:bg-zinc-800");
    content = content.replace(/border-zinc-200/g, "border-zinc-200 dark:border-zinc-800");
    content = content.replace(/hover:bg-zinc-200/g, "hover:bg-zinc-200 dark:hover:bg-zinc-800");

    // White -> Zinc 950 (when used as background)
    content = content.replace(/bg-white/g, "bg-white dark:bg-zinc-950");

    return content;
}

for (const file of files) {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const newContent = processContent(content);
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log("Updated", file);
    }
}
