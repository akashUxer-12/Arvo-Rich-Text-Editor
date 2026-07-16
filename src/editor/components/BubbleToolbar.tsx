import { useEffect, useReducer, type ReactNode } from "react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/core";
import { AlignCenter, AlignLeft, AlignRight, Bold, Highlighter, Italic, Link2, Trash2, Underline } from "lucide-react";
import { openLinkEditor } from "../linkActions";

export function BubbleToolbar({ editor }: { editor: Editor }) {
  const [, render] = useReducer((value) => value + 1, 0);

  useEffect(() => {
    const update = () => render();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  const isImage = editor.isActive("image");
  const image = isImage ? editor.getAttributes("image") : {};
  const updateImage = (attributes: Record<string, unknown>) =>
    editor.chain().focus().updateAttributes("image", attributes).run();

  const promptImageAttribute = (label: string, attribute: "caption" | "alt" | "href", fallback = "") => {
    const result = window.prompt(label, (image[attribute] as string | undefined) ?? fallback);
    if (result !== null) updateImage({ [attribute]: result.trim() || (attribute === "href" ? null : "") });
  };

  const alignmentButton = (alignment: "left" | "center" | "right", label: string, icon: ReactNode) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isImage ? (image.alignment ?? "left") === alignment : editor.isActive({ textAlign: alignment })}
      onClick={() => isImage ? updateImage({ alignment }) : editor.chain().focus().setTextAlign(alignment).run()}
    >
      {icon}
    </button>
  );

  return (
    <BubbleMenu
      editor={editor}
      appendTo={() => document.body}
      options={{ strategy: "fixed", placement: "top", offset: 8, flip: { fallbackPlacements: ["bottom", "top-start", "bottom-start"] }, shift: { padding: 8 } }}
      shouldShow={({ editor, from, to }) => editor.isEditable && (from !== to || editor.isActive("image"))}
    >
      <div className={`arvo-bubble-toolbar${isImage ? " arvo-bubble-toolbar--image" : ""}`} role="toolbar" aria-label={isImage ? "Image options" : "Selection formatting"}>
        {isImage ? (
          <>
            {alignmentButton("left", "Align image left", <AlignLeft />)}
            {alignmentButton("center", "Align image center", <AlignCenter />)}
            {alignmentButton("right", "Align image right", <AlignRight />)}
            <span className="arvo-bubble-separator" aria-hidden="true" />
            <button type="button" className="arvo-bubble-text-button" onClick={() => promptImageAttribute("Image caption", "caption")}>Caption</button>
            <button type="button" className="arvo-bubble-text-button" onClick={() => promptImageAttribute("Alternative text", "alt")}>Alt text</button>
            <button type="button" aria-label="Add or edit image link" aria-pressed={Boolean(image.href)} onClick={() => promptImageAttribute("Image link URL", "href", "https://")}><Link2 /></button>
            <button type="button" aria-label="Delete image" onClick={() => editor.chain().focus().deleteSelection().run()}><Trash2 /></button>
          </>
        ) : (
          <>
            <button type="button" aria-label="Bold" aria-pressed={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></button>
            <button type="button" aria-label="Italic" aria-pressed={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></button>
            <button type="button" aria-label="Underline" aria-pressed={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline /></button>
            <button type="button" aria-label="Highlight" aria-pressed={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter /></button>
            <input className="arvo-bubble-color-input" type="color" defaultValue="#fff59d" aria-label="Highlight background color" title="Highlight background color" onChange={(event) => editor.chain().focus().setHighlight({ color: event.target.value }).run()} />
            <button type="button" aria-label="Insert or edit link (Cmd/Ctrl+K)" aria-pressed={editor.isActive("link")} onClick={() => openLinkEditor(editor)}><Link2 /></button>
            <span className="arvo-bubble-separator" aria-hidden="true" />
            {alignmentButton("left", "Align text left", <AlignLeft />)}
            {alignmentButton("center", "Align text center", <AlignCenter />)}
            {alignmentButton("right", "Align text right", <AlignRight />)}
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
