import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import DOMPurify from "dompurify";
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Strikethrough, UnderlineIcon, Undo2 } from "lucide-react";
import type { ArvoEditorDocument } from "./types";
import type { ArvoRichEditorProps } from "./ArvoRichEditor";
import { openLinkEditor } from "./linkActions";
import { LinkShortcut } from "./extensions/LinkShortcut";

function versionDocument(document: ArvoEditorDocument["document"]): ArvoEditorDocument {
  return { schema: "arvo-rich-editor", schemaVersion: "1.0.0", document };
}

export function ArvoBasicEditor({
  value,
  onChange,
  placeholder = "Start writing",
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  maxLength = 2000,
  autosave = { isEnabled: false },
  features,
}: ArvoRichEditorProps) {
  const lastEmitted = useRef(JSON.stringify(value.document));
  const saveTimer = useRef<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isDisabled && !isReadOnly,
    content: value.document,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      LinkShortcut,
    ],
    editorProps: {
      attributes: {
        class: "arvo-editor-content",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Rich text editor",
        "aria-invalid": String(isInvalid),
      },
      transformPastedHTML(html) {
        return DOMPurify.sanitize(html, {
          USE_PROFILES: { html: true },
          FORBID_TAGS: ["script", "iframe", "object", "embed"],
          FORBID_ATTR: ["style", "onerror", "onclick", "onload"],
        });
      },
    },
    onUpdate({ editor }) {
      const next = versionDocument(editor.getJSON());
      lastEmitted.current = JSON.stringify(next.document);
      onChange(next);
      if (autosave.isEnabled) {
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(async () => {
          if (autosave.onSave) await autosave.onSave(next);
          else if (autosave.storageKey) window.localStorage.setItem(autosave.storageKey, JSON.stringify(next));
        }, autosave.delay ?? 800);
      }
    },
  });

  useEffect(() => editor?.setEditable(!isDisabled && !isReadOnly), [editor, isDisabled, isReadOnly]);
  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(value.document);
    if (incoming !== lastEmitted.current) {
      editor.commands.setContent(value.document, { emitUpdate: false });
      lastEmitted.current = incoming;
    }
  }, [editor, value]);
  useEffect(() => () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
  }, []);

  if (!editor) return <div className="arvo-editor-loading">Loading editor…</div>;

  const action = (label: string, active: boolean, run: () => void, icon: React.ReactNode) => (
    <button type="button" aria-label={label} aria-pressed={active} onMouseDown={(event) => { event.preventDefault(); run(); }}>{icon}</button>
  );

  return (
    <section className="arvo-rich-editor arvo-rich-editor--basic" data-invalid={isInvalid || undefined} data-readonly={isReadOnly || undefined}>
      {!isReadOnly && features?.hasFixedToolbar !== false && (
        <div className="arvo-basic-toolbar" role="toolbar" aria-label="Basic text formatting">
          {action("Bold", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold />)}
          {action("Italic", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic />)}
          {action("Underline", editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon />)}
          {action("Strikethrough", editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough />)}
          {action("Bullet list", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List />)}
          {action("Numbered list", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered />)}
          {action("Insert or edit link (Cmd/Ctrl+K)", editor.isActive("link"), () => openLinkEditor(editor), <Link2 />)}
          <span className="arvo-basic-toolbar-spacer" />
          <button type="button" aria-label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></button>
          <button type="button" aria-label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></button>
        </div>
      )}
      <div className="arvo-editor-surface"><EditorContent editor={editor} /></div>
      {features?.hasCharacterCount !== false && (
        <footer className="arvo-basic-footer">
          {editor.storage.characterCount.characters()}/{maxLength}
        </footer>
      )}
    </section>
  );
}
