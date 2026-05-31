export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0);
}

export function magnitude(values: number[]): number {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const divisor = magnitude(a) * magnitude(b);
  if (!divisor) return 0;
  return dotProduct(a, b) / divisor;
}
