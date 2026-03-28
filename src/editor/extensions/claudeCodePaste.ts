import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DOMParser as PmDOMParser } from '@tiptap/pm/model';
import { cleanTerminalOutput, hasAnsiCodes } from '../../utils/terminalCleaner';

export const ClaudeCodePaste = Extension.create({
  name: 'claudeCodePaste',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('claudeCodePaste'),
        props: {
          handlePaste(view, event) {
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;

            // Let ProseMirror handle its own internal clipboard (copy/paste within editor)
            const html = event.clipboardData?.getData('text/html');
            if (html?.includes('data-pm-slice')) return false;

            event.preventDefault();
            const cleaned = hasAnsiCodes(text) ? cleanTerminalOutput(text) : text;

            // Parse markdown to HTML with full block rendering
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const htmlContent = (editor.storage as any).markdown.parser.parse(cleaned) as string;

            // Convert HTML to ProseMirror slice and insert at cursor
            const wrapper = document.createElement('div');
            wrapper.innerHTML = htmlContent;
            const slice = PmDOMParser.fromSchema(editor.schema).parseSlice(wrapper, {
              preserveWhitespace: true,
            });
            const tr = view.state.tr.replaceSelection(slice);
            view.dispatch(tr);
            return true;
          },
        },
      }),
    ];
  },
});







