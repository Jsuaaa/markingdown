import { Extension } from '@tiptap/core';

export const EscapeClearMarks = Extension.create({
  name: 'escapeClearMarks',

  addKeyboardShortcuts() {
    return {
      Escape: ({ editor }) => {
        const { from, to } = editor.state.selection;
        const hasActiveMarks = editor.state.storedMarks?.length || (from === to && editor.state.doc.resolve(from).marks().length > 0);

        if (!hasActiveMarks) return false;

        editor.commands.unsetAllMarks();
        return true;
      },
    };
  },
});
