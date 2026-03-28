const TABLE_BORDER_RE = /^\s*[┌├└][─┬┼┴┐┤┘─\s]+$/;
const TABLE_DATA_RE = /^\s*│.*│\s*$/;
const NUMBERED_ITEM_RE = /^(\d+)\.\s+(.+)/;

/**
 * Detect whether pasted text looks like Claude Code plan output
 * (ASCII box-drawing tables or "Plan:" prefix).
 */
export function isClaudePlan(text: string): boolean {
  // ASCII box-drawing table — very specific, low false-positive
  if (/[┌├└]─{5,}/.test(text)) return true;

  // Plan: prefix at start of text
  if (/^Plan:\s/.test(text.trim())) return true;

  return false;
}

/**
 * Convert Claude Code plan plain-text into clean Markdown.
 */
export function convertPlanToMarkdown(text: string): string {
  let lines = text.split('\n');
  lines = dedentLines(lines);
  lines = convertPlanTitle(lines);
  lines = convertAsciiTables(lines);
  lines = convertSectionHeaders(lines);
  lines = convertNumberedSubHeaders(lines);

  let result = lines.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n');
  return result.trim();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dedentLines(lines: string[]): string[] {
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return lines;

  const minIndent = Math.min(
    ...nonEmpty.map((l) => {
      const m = l.match(/^(\s*)/);
      return m ? m[1].length : 0;
    }),
  );

  if (minIndent === 0) return lines;
  return lines.map((l) => (l.length >= minIndent ? l.slice(minIndent) : l));
}

/** Convert `Plan: <title>` on the first non-blank line into `# <title>`. */
function convertPlanTitle(lines: string[]): string[] {
  const result = [...lines];
  for (let i = 0; i < result.length; i++) {
    const trimmed = result[i].trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^Plan:\s+(.+)/i);
    if (match) {
      result[i] = `# ${match[1]}`;
    }
    break; // only inspect the first non-blank line
  }
  return result;
}

// -- ASCII table conversion -------------------------------------------------

function convertAsciiTables(lines: string[]): string[] {
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    if (TABLE_BORDER_RE.test(lines[i]) || TABLE_DATA_RE.test(lines[i])) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        (TABLE_BORDER_RE.test(lines[i]) || TABLE_DATA_RE.test(lines[i]))
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      result.push(...tableToMarkdown(tableLines));
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result;
}

function tableToMarkdown(tableLines: string[]): string[] {
  const rows: string[][] = [];

  for (const line of tableLines) {
    if (TABLE_DATA_RE.test(line)) {
      const cells = line.split('│').slice(1, -1).map((c) => c.trim());
      if (cells.some((c) => c.length > 0)) {
        rows.push(cells);
      }
    }
  }

  if (rows.length === 0) return [];

  const cols = rows[0].length;
  const md: string[] = [];
  md.push('| ' + rows[0].join(' | ') + ' |');
  md.push('| ' + Array(cols).fill('---').join(' | ') + ' |');
  for (let i = 1; i < rows.length; i++) {
    md.push('| ' + rows[i].join(' | ') + ' |');
  }
  return md;
}

// -- Section headers --------------------------------------------------------

/**
 * Standalone short lines surrounded by blank lines become `## ` headings.
 * Skips bullets, numbered items, existing headings, table rows, and labels
 * ending with `:` or `.`.
 */
function convertSectionHeaders(lines: string[]): string[] {
  const result = [...lines];

  for (let i = 0; i < result.length; i++) {
    const trimmed = result[i].trim();
    if (!trimmed) continue;

    // Already handled or irrelevant
    if (/^#{1,6}\s/.test(trimmed)) continue;
    if (/^[-*+>]\s/.test(trimmed)) continue;
    if (NUMBERED_ITEM_RE.test(trimmed)) continue;
    if (trimmed.startsWith('|')) continue;
    if (/^Plan:\s/i.test(trimmed)) continue;

    // Must be standalone — blank (or edge) before and after
    const prevBlank = i === 0 || result[i - 1].trim() === '';
    const nextBlank =
      i === result.length - 1 || result[i + 1]?.trim() === '';
    if (!prevBlank || !nextBlank) continue;

    // Not too long (paragraphs are not headers)
    if (trimmed.length > 80) continue;

    // Lines ending with `.` (sentence) or `:` (label) are not headers
    if (trimmed.endsWith('.') && !trimmed.endsWith('...')) continue;
    if (trimmed.endsWith(':')) continue;

    result[i] = `## ${trimmed}`;
  }

  return result;
}

// -- Numbered sub-section headers -------------------------------------------

/**
 * A numbered line like `1. Do something` becomes `### 1. Do something`
 * when it is followed by a blank line and then non-numbered body content
 * (distinguishing it from a regular spaced numbered list).
 */
function convertNumberedSubHeaders(lines: string[]): string[] {
  const result = [...lines];

  for (let i = 0; i < result.length; i++) {
    const trimmed = result[i].trim();
    if (!NUMBERED_ITEM_RE.test(trimmed)) continue;

    // Preceded by blank line (or start)
    if (i > 0 && result[i - 1].trim() !== '') continue;

    // Followed by blank line
    if (i + 1 >= result.length || result[i + 1].trim() !== '') continue;

    // Find next non-blank line
    let j = i + 2;
    while (j < result.length && result[j].trim() === '') j++;

    // Nothing after → trailing list item, not a sub-header
    if (j >= result.length) continue;

    // If next non-blank is another numbered item with ONLY blanks between,
    // this is a spaced regular list — skip
    if (NUMBERED_ITEM_RE.test(result[j].trim())) {
      let onlyBlanks = true;
      for (let k = i + 1; k < j; k++) {
        if (result[k].trim() !== '') {
          onlyBlanks = false;
          break;
        }
      }
      if (onlyBlanks) continue;
    }

    result[i] = `### ${trimmed}`;
  }

  return result;
}
