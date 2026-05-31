import("pdfjs-dist/legacy/build/pdf.mjs").then(mod => { console.log(Object.keys(mod)); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });
