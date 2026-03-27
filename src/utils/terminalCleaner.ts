import stripAnsi from 'strip-ansi';

export function stripAnsiCodes(text: string): string {
  return stripAnsi(text);
}

export function dedent(text: string): string {
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  if (nonEmptyLines.length === 0) return text;

  const minIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    })
  );

  if (minIndent === 0) return text;
  return lines.map((line) => line.slice(minIndent)).join('\n');
}

export function normalizeBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

export function cleanTerminalOutput(text: string): string {
  let cleaned = stripAnsiCodes(text);
  cleaned = dedent(cleaned);
  cleaned = normalizeBlankLines(cleaned);
  cleaned = cleaned.trim();
  return cleaned;
}

export function hasAnsiCodes(text: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /\x1b\[/.test(text);
}
