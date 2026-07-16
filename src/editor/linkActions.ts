import type { Editor } from "@tiptap/core";

/**
 * Temporary reference link UI.
 * Replace the browser prompt with the Arvo Link Popover while keeping this
 * command boundary shared by the toolbar, bubble toolbar, and Mod-k shortcut.
 */
export function openLinkEditor(editor: Editor): boolean {
  const previousUrl = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("Link URL", previousUrl ?? "https://");

  if (url === null) {
    editor.commands.focus();
    return false;
  }

  if (url.trim() === "") {
    return editor.chain().focus().extendMarkRange("link").unsetLink().run();
  }

  return editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url.trim(), target: "_blank" })
    .run();
}
