import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { Bold, Italic, Underline, Link2, Highlighter } from "lucide-react";
import { openLinkEditor } from "../linkActions";

export function BubbleToolbar({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={{
        strategy: "fixed",
        placement: "top",
        offset: 8,
        flip: { fallbackPlacements: ["bottom", "top-start", "bottom-start"] },
        shift: { padding: 8 },
      }}
      shouldShow={({ editor, from, to }) =>
        editor.isEditable && from !== to && !editor.isActive("image")
      }
    >
      <div className="arvo-bubble-toolbar" role="toolbar" aria-label="Selection formatting">
        <button type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></button>
        <button type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></button>
        <button type="button" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline /></button>
        <button type="button" aria-label="Highlight" aria-pressed={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter /></button>
        <input
          className="arvo-bubble-color-input"
          type="color"
          defaultValue="#fff59d"
          aria-label="Highlight background color"
          title="Highlight background color"
          onChange={(event) => editor.chain().focus().setHighlight({ color: event.target.value }).run()}
        />
        <button type="button" aria-label="Insert or edit link (Cmd/Ctrl+K)" aria-pressed={editor.isActive("link")} onClick={() => openLinkEditor(editor)}><Link2 /></button>
      </div>
    </BubbleMenu>
  );
}
