import * as mammoth from 'mammoth';

export async function parseFile(file: File, fileName: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const buffer = Buffer.from(uint8Array);
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.pdf')) {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

    if (typeof window === 'undefined') {
      const worker = await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
      globalThis.pdfjsWorker ||= { WorkerMessageHandler: worker.WorkerMessageHandler };
    }

    const loadingTask = pdfjs.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    try {
      const pages: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter(Boolean)
          .join(' ');
        pages.push(pageText);
      }
      return pages.join('\n');
    } finally {
      await pdf.destroy();
    }
  }

  if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? '';
  }

 if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {

    return buffer.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  }

  return buffer.toString('utf8');
}