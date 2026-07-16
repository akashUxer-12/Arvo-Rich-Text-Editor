import { Extension } from "@tiptap/core";
import { openLinkEditor } from "../linkActions";

export const LinkShortcut = Extension.create({
  name: "arvoLinkShortcut",

  addKeyboardShortcuts() {
    return {
      "Mod-k": () => openLinkEditor(this.editor),
    };
  },
});
