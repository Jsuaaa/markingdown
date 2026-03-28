import { Extension } from '@tiptap/core';

export const EscapeClearMarks = Extension.create({
  name: 'escapeClearMarks',

  addKeyboardShortcuts() {
    return {
      Escape: ({ editor }) => {
        const isBold = editor.isActive('bold');
        const isItalic = editor.isActive('italic');
        const isStrike = editor.isActive('strike');

        if (!isBold && !isItalic && !isStrike) return false;

        const chain = editor.chain().focus();
        if (isBold) chain.toggleBold();
        if (isItalic) chain.toggleItalic();
        if (isStrike) chain.toggleStrike();
        chain.run();
        return true;
      },
    };
  },
});
