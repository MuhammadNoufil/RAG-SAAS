export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const words = cleaned.split(' ');
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const segment = words.slice(start, end).join(' ');
    chunks.push(segment);
    start += chunkSize - overlap;
  }

  return chunks.filter(Boolean);
}
