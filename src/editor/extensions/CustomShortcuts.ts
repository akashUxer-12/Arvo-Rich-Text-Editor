import { Extension } from "@tiptap/core";
import type { CustomShortcut } from "../types";

export const CustomShortcuts = Extension.create<{ shortcuts: CustomShortcut[] }>({
  name: "arvoCustomShortcuts",

  addOptions() {
    return { shortcuts: [] };
  },

  addKeyboardShortcuts() {
    return Object.fromEntries(
      this.options.shortcuts.map((shortcut) => [
        shortcut.keys,
        () => shortcut.run({ editor: this.editor }),
      ]),
    );
  },
});
