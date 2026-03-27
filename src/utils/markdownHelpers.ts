export function extractTitle(markdown: string): string | null {
  const match = markdown.match(/^#{1,3}\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

export function wordCount(text: string): number {
  const cleaned = text.replace(/[#*_`~[\]()>|\\-]/g, '').trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

export function charCount(text: string): number {
  return text.length;
}
