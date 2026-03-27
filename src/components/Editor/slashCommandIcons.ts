const s = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const slashCommandIcons: Record<string, string> = {
  h1: s('<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-2v8"/>'),
  h2: s('<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>'),
  h3: s('<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>'),
  bulletList: s('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>'),
  orderedList: s('<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="4" y="7" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">1</text><text x="4" y="13" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">2</text><text x="4" y="19" font-size="6" fill="currentColor" stroke="none" font-family="sans-serif">3</text>'),
  taskList: s('<rect x="3" y="5" width="6" height="6" rx="1"/><path d="M5 8l1.5 1.5L9 7"/><line x1="13" y1="8" x2="21" y2="8"/><rect x="3" y="13" width="6" height="6" rx="1"/><line x1="13" y1="16" x2="21" y2="16"/>'),
  blockquote: s('<path d="M6 17V7c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H8"/><path d="M3 7v6l3 4"/>'),
  codeBlock: s('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
  table: s('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>'),
  hr: s('<line x1="2" y1="12" x2="22" y2="12"/>'),
  bold: s('<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>'),
  italic: s('<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>'),
  strike: s('<path d="M16 4c-.5-1.5-2.5-3-5-3-3 0-5 2-5 4.5 0 2 1.5 3 3 3.5"/><path d="M8 20c.5 1.5 2.5 3 5 3 3 0 5-2 5-4.5 0-2-1.5-3-3-3.5"/><line x1="4" y1="12" x2="20" y2="12"/>'),
  code: s('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'),
};
