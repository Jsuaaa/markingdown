import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { cleanTerminalOutput, hasAnsiCodes } from '../../utils/terminalCleaner';

export const ClaudeCodePaste = Extension.create({
  name: 'claudeCodePaste',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('claudeCodePaste'),
        props: {
          handlePaste(_view, event) {
            const text = event.clipboardData?.getData('text/plain');
            if (!text) return false;

            if (!hasAnsiCodes(text)) return false;

            event.preventDefault();
            const cleaned = cleanTerminalOutput(text);
            editor.commands.insertContent(cleaned);
            return true;
          },
        },
      }),
    ];
  },
});







