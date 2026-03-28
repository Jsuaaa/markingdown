import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const TODO_MARKER = '[TODO]:';

export const TodoHighlight = Extension.create({
  name: 'todoHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('todoHighlight'),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (node.type.name === 'blockquote') {
                if (node.textContent.startsWith(TODO_MARKER)) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'todo-annotation',
                    })
                  );
                }
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
