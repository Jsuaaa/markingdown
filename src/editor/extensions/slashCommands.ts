import { Extension } from '@tiptap/core';
import { type Editor } from '@tiptap/core';
import Suggestion, { exitSuggestion } from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';
import { SlashMenu } from '../../components/Editor/SlashMenu';

export interface SlashItem {
  title: string;
  description: string;
  command: string;
  keywords: string;
  category: 'blocks' | 'lists' | 'inline' | 'annotations';
  shortcut?: string;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? '\u2318' : 'Ctrl+';

const slashItems: SlashItem[] = [
  // Blocks
  { title: 'Heading 1',     description: 'Large heading',           command: 'h1',          keywords: 'h1 heading title',            category: 'blocks' },
  { title: 'Heading 2',     description: 'Medium heading',          command: 'h2',          keywords: 'h2 heading subtitle',         category: 'blocks' },
  { title: 'Heading 3',     description: 'Small heading',           command: 'h3',          keywords: 'h3 heading',                  category: 'blocks' },
  { title: 'Blockquote',    description: 'Quote block',             command: 'blockquote',  keywords: 'quote blockquote',            category: 'blocks' },
  { title: 'Code Block',    description: 'Syntax-highlighted code', command: 'codeBlock',   keywords: 'code block pre',              category: 'blocks' },
  { title: 'Table',         description: 'Insert a 3\u00d73 table', command: 'table',       keywords: 'table grid',                  category: 'blocks' },
  { title: 'Divider',       description: 'Horizontal rule',         command: 'hr',          keywords: 'hr divider separator line',   category: 'blocks' },
  // Lists
  { title: 'Bullet List',   description: 'Unordered list',          command: 'bulletList',  keywords: 'ul list bullet unordered',    category: 'lists' },
  { title: 'Ordered List',  description: 'Numbered list',           command: 'orderedList', keywords: 'ol list numbered ordered',    category: 'lists' },
  { title: 'Task List',     description: 'Checklist with tasks',    command: 'taskList',    keywords: 'tasks todo checkbox check',   category: 'lists' },
  // Inline
  { title: 'Bold',          description: 'Bold text',               command: 'bold',        keywords: 'bold strong',                 category: 'inline', shortcut: `${mod}B` },
  { title: 'Italic',        description: 'Italic text',             command: 'italic',      keywords: 'italic emphasis',             category: 'inline', shortcut: `${mod}I` },
  { title: 'Strikethrough', description: 'Crossed out text',        command: 'strike',      keywords: 'strike strikethrough',        category: 'inline', shortcut: `${mod}\u21e7X` },
  { title: 'Inline Code',   description: 'Inline code snippet',     command: 'code',        keywords: 'code inline mono',            category: 'inline', shortcut: `${mod}E` },
  // Annotations
  { title: 'To-Do',         description: 'Annotation for Claude',   command: 'todo',        keywords: 'todo annotation note review feedback change', category: 'annotations' },
];

function filterItems(query: string): SlashItem[] {
  const q = query.toLowerCase();
  if (!q) return slashItems;
  return slashItems.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q)
  );
}

function executeCommand(editor: Editor, range: { from: number; to: number }, command: string) {
  editor.chain().focus().deleteRange(range).run();

  switch (command) {
    case 'h1':         editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
    case 'h2':         editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
    case 'h3':         editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
    case 'bulletList': editor.chain().focus().toggleBulletList().run(); break;
    case 'orderedList':editor.chain().focus().toggleOrderedList().run(); break;
    case 'taskList':   editor.chain().focus().toggleTaskList().run(); break;
    case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break;
    case 'codeBlock':  editor.chain().focus().toggleCodeBlock().run(); break;
    case 'table':      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); break;
    case 'hr':         editor.chain().focus().setHorizontalRule().run(); break;
    case 'bold':       editor.chain().focus().toggleBold().run(); break;
    case 'italic':     editor.chain().focus().toggleItalic().run(); break;
    case 'strike':     editor.chain().focus().toggleStrike().run(); break;
    case 'code':       editor.chain().focus().toggleCode().run(); break;
    case 'todo':
      editor.chain().focus()
        .setBlockquote()
        .insertContent([
          { type: 'text', marks: [{ type: 'bold' }], text: '[TODO]: ' },
        ])
        .unsetBold()
        .run();
      break;
  }
}

// ---------------------------------------------------------------------------
// Suggestion Renderer
// ---------------------------------------------------------------------------

function createSuggestionRenderer() {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;
  let selectedIndex = 0;
  let currentItems: SlashItem[] = [];
  let currentCommand: ((index: number) => void) | null = null;
  let editorRef: Editor | null = null;
  let visible = false;
  let placement: 'above' | 'below' = 'below';
  let isExiting = false;
  let clickOutsideHandler: ((e: MouseEvent) => void) | null = null;

  function renderMenu() {
    if (!root) return;
    root.render(
      createElement(SlashMenu, {
        items: currentItems,
        selectedIndex,
        visible,
        placement,
        onSelect: (index: number) => {
          if (isExiting) return;
          currentCommand?.(index);
        },
        onHover: (index: number) => {
          if (isExiting) return;
          selectedIndex = index;
          renderMenu();
        },
      })
    );
  }

  function positionMenu(
    cont: HTMLDivElement,
    clientRect: (() => DOMRect | null) | null,
  ) {
    const rect = clientRect?.();
    if (!rect) return;

    cont.style.position = 'fixed';
    cont.style.zIndex = '200';

    // Position below first, then check overflow after render
    cont.style.left = `${rect.left}px`;
    cont.style.top = `${rect.bottom + 4}px`;
    placement = 'below';

    requestAnimationFrame(() => {
      const menu = cont.firstElementChild as HTMLElement | null;
      if (!menu) return;

      const menuHeight = menu.offsetHeight;
      const menuWidth = menu.offsetWidth;
      const gap = 4;

      // Vertical: prefer below, flip above if no room
      if (rect.bottom + gap + menuHeight > window.innerHeight) {
        if (rect.top - gap - menuHeight > 0) {
          cont.style.top = `${rect.top - menuHeight - gap}px`;
          placement = 'above';
        }
      }

      // Horizontal: shift left if overflows right edge
      if (rect.left + menuWidth > window.innerWidth) {
        cont.style.left = `${Math.max(4, window.innerWidth - menuWidth - 4)}px`;
      }

      // Now trigger enter animation
      visible = true;
      renderMenu();
    });
  }

  function addClickOutsideListener() {
    clickOutsideHandler = (e: MouseEvent) => {
      if (container && !container.contains(e.target as Node) && editorRef) {
        exitSuggestion(editorRef.view);
      }
    };
    document.addEventListener('mousedown', clickOutsideHandler);
  }

  function removeClickOutsideListener() {
    if (clickOutsideHandler) {
      document.removeEventListener('mousedown', clickOutsideHandler);
      clickOutsideHandler = null;
    }
  }

  return {
    onStart(props: SuggestionProps<SlashItem>) {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
      selectedIndex = 0;
      currentItems = props.items;
      editorRef = props.editor;
      visible = false;
      isExiting = false;
      placement = 'below';

      currentCommand = (index: number) => {
        const item = currentItems[index];
        if (item) props.command(item);
      };

      renderMenu();
      positionMenu(container, props.clientRect ?? null);
      addClickOutsideListener();
    },

    onUpdate(props: SuggestionProps<SlashItem>) {
      currentItems = props.items;
      selectedIndex = Math.min(selectedIndex, Math.max(0, currentItems.length - 1));
      currentCommand = (index: number) => {
        const item = currentItems[index];
        if (item) props.command(item);
      };

      renderMenu();
      if (container) positionMenu(container, props.clientRect ?? null);
    },

    onKeyDown(props: { event: KeyboardEvent }) {
      if (isExiting) return false;
      const { event } = props;

      if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % Math.max(1, currentItems.length);
        renderMenu();
        return true;
      }

      if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + currentItems.length) % Math.max(1, currentItems.length);
        renderMenu();
        return true;
      }

      if (event.key === 'Enter') {
        currentCommand?.(selectedIndex);
        return true;
      }

      // Let the suggestion plugin handle Escape (calls onExit automatically)
      if (event.key === 'Escape') {
        return false;
      }

      return false;
    },

    onExit() {
      isExiting = true;
      removeClickOutsideListener();

      // Trigger exit animation, then clean up
      visible = false;
      renderMenu();

      const rootRef = root;
      const containerRef = container;

      setTimeout(() => {
        if (rootRef) rootRef.unmount();
        if (containerRef) containerRef.remove();
      }, 150);

      root = null;
      container = null;
      selectedIndex = 0;
      currentItems = [];
      currentCommand = null;
      editorRef = null;
      isExiting = false;
    },
  };
}

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: ({ query }: { query: string }) => filterItems(query),
        command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: SlashItem }) => {
          executeCommand(editor, range, props.command);
        },
        render: createSuggestionRenderer,
      } satisfies Partial<SuggestionOptions<SlashItem>>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
