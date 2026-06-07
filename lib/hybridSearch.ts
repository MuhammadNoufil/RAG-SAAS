import { getEmbedding } from '@/lib/embed';
import { queryEmbeddings, getAllVectors } from '@/lib/chroma';
import type { ChatMessage, SearchResult } from '@/types/chat';

// Smart keyword-based search with section awareness
function keywordSearch(question: string, allResults: SearchResult[]): SearchResult[] {
  const keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.replace(/[^a-z0-9]/g, '')); // Remove special characters for matching
  
  console.log(`[Keyword Search] Looking for keywords: ${keywords.join(', ')}`);
  
  if (keywords.length === 0) {
    console.log(`[Keyword Search] No keywords found, returning all results`);
    return allResults.slice(0, 5);
  }
  
  const scored = allResults.map((result) => {
    const text = (result.text + ' ' + result.source).toLowerCase();
    const normalizedText = text.replace(/[^a-z0-9\s]/g, ' '); // Normalized for matching
    
    // Enhanced scoring with multiple factors
    let totalScore = 0;
    let keywordMatches = 0;
    
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const foundMatches = text.match(regex) || [];
      const count = foundMatches.length;
      
      if (count > 0) {
        keywordMatches++;
        
        // Boost score if keyword appears as section header (e.g., "EDUCATION:")
        const headerRegex = new RegExp(`\\b${kw}\\s*:`, 'gi');
        const isHeader = headerRegex.test(text);
        const headerBoost = isHeader ? 10 : 0;
        
        // Boost score if keyword appears near line start (section indicators)
        const lineStartRegex = new RegExp(`^\\s*${kw}`, 'gim');
        const isLineStart = lineStartRegex.test(text);
        const lineStartBoost = isLineStart ? 5 : 0;
        
        totalScore += count + headerBoost + lineStartBoost;
        console.log(`  - Keyword "${kw}" in ${result.source}: ${count} matches${headerBoost > 0 ? ' (header)' : ''}${lineStartBoost > 0 ? ' (section)' : ''}`);
      }
    });
    
    // Bonus: reward chunks with multiple matching keywords
    const diversityBonus = keywordMatches > 1 ? keywordMatches * 2 : 0;
    const finalScore = totalScore + diversityBonus;
    
    return { result, score: finalScore, keywordMatches };
  });
  
  // Filter and sort
  const withScores = scored.filter(s => s.score > 0);
  console.log(`[Keyword Search] Found ${withScores.length} results with keyword matches`);
  
  if (withScores.length === 0) {
    // Fallback: return all results
    console.log(`[Keyword Search] No keyword matches, returning all results`);
    return allResults.slice(0, 5);
  }
  
  const sorted = withScores
    .sort((a, b) => {
      // Primary sort: by score (descending)
      if (b.score !== a.score) return b.score - a.score;
      // Secondary sort: by number of matching keywords (descending) 
      if (b.keywordMatches !== a.keywordMatches) return b.keywordMatches - a.keywordMatches;
      // Tertiary sort: by document order (preserve relevance)
      return 0;
    })
    .slice(0, 5)
    .map(s => s.result);
  
  console.log(`[Keyword Search] Top result score: ${withScores[0]?.score}, using ${sorted.length} results`);
  return sorted;
}

export async function searchDocuments(question: string, topK = 5): Promise<SearchResult[]> {
  try {
    // Always get all available vectors for keyword search
    const allVectors = await getAllVectors();
    console.log(`[Hybrid Search] Starting search for: "${question}"`);
    console.log(`[Hybrid Search] Available vectors: ${allVectors.length}`);
    
    if (allVectors.length === 0) {
      console.log(`[Hybrid Search] No vectors available`);
      return [];
    }
    
    // Use keyword search primarily since we have hash-based embeddings
    const keywordResults = keywordSearch(question, allVectors);
    console.log(`[Hybrid Search] Keyword search found ${keywordResults.length} results`);
    
    return keywordResults;
  } catch (error) {
    console.error('[Hybrid Search] Error:', error);
    return [];
  }
}

export function buildPrompt(question: string, results: SearchResult[], history: ChatMessage[]) {
  const context = results
    .map(
      (result, index) =>
        `Source ${index + 1}: ${result.source}\n${result.text.trim().slice(0, 800)}${result.text.length > 800 ? '...' : ''}`,
    )
    .join('\n\n');

  const conversation = history
    .filter((item) => item.role !== 'system')
    .map((item) => `${item.role === 'user' ? 'User' : 'Assistant'}: ${item.text}`)
    .join('\n');

  const finalPrompt = [
    'You are a helpful assistant that answers questions using the provided document excerpts. If the answer is not contained within the sources, say that you do not know.',
    '',
    'Document context:',
    context || 'No document context is available.',
    '',
    'Conversation so far:',
    conversation,
    '',
    `User: ${question}`,
    'Assistant:',
  ]
    .filter(Boolean)
    .join('\n');
  
  console.log(`[Build Prompt] Results: ${results.length}, Context length: ${context.length}`);
  if (results.length > 0) {
    console.log(`[Build Prompt] Sources: ${results.map(r => r.source).join(', ')}`);
  }
  
  return finalPrompt;
}
