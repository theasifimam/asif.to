const fs = require('fs');
const babel = require('@babel/core');
const path = require('path');

const file = process.argv[2];
const code = fs.readFileSync(file, 'utf-8');

const result = babel.transformSync(code, {
  filename: file,
  presets: [
    ['@babel/preset-typescript', { isTSX: file.endsWith('.tsx'), allExtensions: true }]
  ],
  plugins: ['@babel/plugin-syntax-jsx'],
  retainLines: true,
  generatorOpts: {
    retainLines: true
  }
});

const newFile = file.replace(/\.tsx?$/, file.endsWith('.tsx') ? '.jsx' : '.js');
fs.writeFileSync(newFile, result.code);
fs.unlinkSync(file);
console.log('Converted', file, 'to', newFile);
