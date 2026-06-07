export function chunkText(text: string, chunkSize = 900, overlap = 120): string[] {
  if (!text.trim()) return [];

  // Split by lines to preserve structure
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  // Identify section headers (all caps, or followed by colon)
  const isSectionHeader = (line: string): boolean => {
    const normalized = line.trim().toUpperCase();
    return /^[A-Z\s]+$/.test(normalized) || // All uppercase
           /[A-Z].*:\s*$/.test(line.trim()) || // "Title:" format
           line.trim().endsWith(':'); // Ends with colon
  };

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let wordCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineWords = line.split(' ').length;
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    const isNextSectionHeader = isSectionHeader(nextLine);
    
    // If adding this line would exceed chunk size, consider saving
    if (wordCount + lineWords > chunkSize && currentChunk.length > 0) {
      // Check if next line is a section header - if so, don't add current line
      // to avoid breaking section header and content
      if (!isNextSectionHeader) {
        chunks.push(currentChunk.join('\n'));
        
        // Keep last few lines for overlap
        const overlapWords = overlap;
        let overlapLines = [];
        let overlapCount = 0;
        for (let j = currentChunk.length - 1; j >= 0 && overlapCount < overlapWords; j--) {
          overlapLines.unshift(currentChunk[j]);
          overlapCount += currentChunk[j].split(' ').length;
        }
        
        currentChunk = overlapLines;
        wordCount = overlapCount;
      }
    }

    currentChunk.push(line);
    wordCount += lineWords;
  }

  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks.filter(chunk => chunk.trim().length > 0);
}
