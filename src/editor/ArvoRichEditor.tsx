import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "dompurify";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import Placeholder from "@tiptap/extension-placeholder";
import FileHandler from "@tiptap/extension-file-handler";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Markdown } from "@tiptap/markdown";
import type {
  AiAction,
  ArvoAutosaveConfig,
  ArvoEditorDocument,
  ArvoEditorVariant,
  ArvoRichEditorFeatures,
  ArvoRichEditorProviders,
  CustomShortcut,
  SlashCommandExtension,
  ToolbarExtension,
} from "./types";
import { FontSize } from "./extensions/FontSize";
import { Attachment } from "./extensions/Attachment";
import { CustomShortcuts } from "./extensions/CustomShortcuts";
import { LinkShortcut } from "./extensions/LinkShortcut";
import { ArvoImage } from "./extensions/ArvoImage";
import { createTagMention, createUserMention } from "./extensions/createEntityMention";
import { SlashCommands } from "./extensions/SlashCommands";
import { Toolbar } from "./components/Toolbar";
import { BubbleToolbar } from "./components/BubbleToolbar";
import { TableControls } from "./components/TableControls";
import { ImageControls } from "./components/ImageControls";

export interface ArvoRichEditorProps {
  value: ArvoEditorDocument;
  onChange: (document: ArvoEditorDocument) => void;
  variant?: ArvoEditorVariant;
  placeholder?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  maxLength?: number;
  features?: ArvoRichEditorFeatures;
  providers?: ArvoRichEditorProviders;
  autosave?: ArvoAutosaveConfig;
  toolbarExtensions?: ToolbarExtension[];
  slashCommandExtensions?: SlashCommandExtension[];
  customShortcuts?: CustomShortcut[];
}

const defaultFeatures: Required<ArvoRichEditorFeatures> = {
  hasFixedToolbar: true,
  hasBubbleToolbar: true,
  hasSlashCommands: true,
  hasMentions: true,
  hasTags: true,
  hasImages: true,
  hasTables: true,
  hasLinks: true,
  hasAttachments: true,
  hasMarkdown: true,
  hasCharacterCount: true,
  hasAI: true,
};

function createVersionedDocument(document: ArvoEditorDocument["document"]): ArvoEditorDocument {
  return {
    schema: "arvo-rich-editor",
    schemaVersion: "1.0.0",
    document,
  };
}

export function ArvoRichEditor({
  value,
  onChange,
  variant = "standard",
  placeholder = "Start writing",
  isDisabled = false,
  isReadOnly = false,
  isInvalid = false,
  maxLength = 50000,
  features: featureOverrides,
  providers = {},
  autosave = { isEnabled: false },
  toolbarExtensions = [],
  slashCommandExtensions = [],
  customShortcuts = [],
}: ArvoRichEditorProps) {
  const features = { ...defaultFeatures, ...featureOverrides };
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const lastEmittedJson = useRef(JSON.stringify(value.document));
  const saveTimer = useRef<number | null>(null);

  const builtInSlashCommands = useMemo<SlashCommandExtension[]>(
    () => [
      {
        id: "paragraph",
        label: "Text",
        description: "Start a paragraph",
        group: "basic",
        keywords: ["paragraph", "text"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setParagraph().run(),
      },
      ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({
        id: `heading-${level}`,
        label: `Heading ${level}`,
        description: `Insert heading level ${level}`,
        group: "basic" as const,
        keywords: ["heading", `h${level}`],
        run: ({ editor, range }: any) =>
          editor.chain().focus().deleteRange(range).setHeading({ level }).run(),
      })),
      {
        id: "bullet-list",
        label: "Bullet list",
        description: "Create an unordered list",
        group: "structure",
        keywords: ["list", "bullets"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      },
      {
        id: "numbered-list",
        label: "Numbered list",
        description: "Create an ordered list",
        group: "structure",
        keywords: ["list", "ordered", "number"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      },
      {
        id: "task-list",
        label: "Task list",
        description: "Create a checklist",
        group: "structure",
        keywords: ["todo", "checklist"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleTaskList().run(),
      },
      {
        id: "quote",
        label: "Quote",
        description: "Insert a blockquote",
        group: "structure",
        keywords: ["blockquote"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
      },
      {
        id: "code-block",
        label: "Code block",
        description: "Insert a code block",
        group: "structure",
        keywords: ["code"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
      },
      {
        id: "divider",
        label: "Divider",
        description: "Insert a horizontal divider",
        group: "structure",
        keywords: ["separator", "rule"],
        run: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
      },
      {
        id: "table",
        label: "Table",
        description: "Insert a 3 by 3 table",
        group: "structure",
        keywords: ["grid", "rows", "columns"],
        run: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
    ],
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: !isDisabled && !isReadOnly,
    content: value.document,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      ArvoImage.configure({
        allowBase64: false,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: { class: "arvo-task-list" },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: { class: "arvo-task-item" },
      }),
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder }),
      Typography,
      Subscript,
      Superscript,
      Attachment,
      LinkShortcut,
      ...(features.hasMarkdown ? [Markdown] : []),
      ...(features.hasMentions ? [createUserMention(providers.mentions)] : []),
      ...(features.hasTags ? [createTagMention(providers.tags)] : []),
      ...(features.hasSlashCommands
        ? [
            SlashCommands.configure({
              commands: [...builtInSlashCommands, ...slashCommandExtensions],
            }),
          ]
        : []),
      CustomShortcuts.configure({ shortcuts: customShortcuts }),
      FileHandler.configure({
        allowedMimeTypes: [
          "image/png",
          "image/jpeg",
          "image/webp",
          "image/gif",
        ],
        onDrop: (currentEditor, files) => {
          const file = files.find((candidate) => candidate.type.startsWith("image/"));
          if (file && providers.images) {
            void uploadImage(file, currentEditor);
            return true;
          }
          return false;
        },
        onPaste: (currentEditor, files) => {
          const file = files.find((candidate) => candidate.type.startsWith("image/"));
          if (file && providers.images) {
            void uploadImage(file, currentEditor);
            return true;
          }
          return false;
        },
      }),
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
      const next = createVersionedDocument(editor.getJSON());
      lastEmittedJson.current = JSON.stringify(next.document);
      onChange(next);

      if (autosave.isEnabled) {
        setSaveState("saving");
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(async () => {
          try {
            if (autosave.onSave) {
              await autosave.onSave(next);
            } else if (autosave.storageKey) {
              window.localStorage.setItem(autosave.storageKey, JSON.stringify(next));
            }
            setSaveState("saved");
          } catch {
            setSaveState("error");
          }
        }, autosave.delay ?? 800);
      }
    },
  });

  useEffect(() => {
    editor?.setEditable(!isDisabled && !isReadOnly);
  }, [editor, isDisabled, isReadOnly]);

  useEffect(() => {
    if (!editor) return;
    const incoming = JSON.stringify(value.document);
    if (incoming !== lastEmittedJson.current) {
      editor.commands.setContent(value.document, { emitUpdate: false });
      lastEmittedJson.current = incoming;
    }
  }, [editor, value]);

  useEffect(
    () => () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    },
    [],
  );

  const uploadImage = useCallback(
    async (file: File, targetEditor = editor) => {
      if (!providers.images || !targetEditor) return;
      setUploadProgress(0);
      try {
        const result = await providers.images.upload(file, setUploadProgress);
        targetEditor
          .chain()
          .focus()
          .setImage({
            src: result.url,
            alt: result.alt ?? result.name,
            title: result.name,
          })
          .run();
      } finally {
        setUploadProgress(null);
      }
    },
    [editor, providers.images],
  );

  const uploadAttachment = useCallback(
    async (file: File) => {
      if (!providers.attachments || !editor) return;
      setUploadProgress(0);
      try {
        const result = await providers.attachments.upload(file, setUploadProgress);
        editor.chain().focus().insertAttachment(result).run();
      } finally {
        setUploadProgress(null);
      }
    },
    [editor, providers.attachments],
  );

  const runAiAction = useCallback(
    async (action: AiAction) => {
      if (!providers.ai || !editor) return;

      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      const sourceText = selectedText || editor.getText();

      try {
        const output = await providers.ai.transform({
          action,
          text: sourceText,
        });

        if (selectedText) {
          editor.chain().focus().insertContentAt({ from, to }, output).run();
        } else {
          editor.chain().focus().insertContent(output).run();
        }
      } catch (error) {
        console.error("AI action failed", error);
      }
    },
    [editor, providers.ai],
  );

  if (!editor) return <div className="arvo-editor-loading">Loading editor…</div>;

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify(createVersionedDocument(editor.getJSON()), null, 2)],
      { type: "application/json" },
    );
    downloadBlob(blob, "arvo-document.json");
  };

  const exportHtml = () => {
    downloadBlob(
      new Blob([editor.getHTML()], { type: "text/html" }),
      "arvo-document.html",
    );
  };

  const exportMarkdown = () => {
    const markdownEditor = editor as typeof editor & {
      getMarkdown?: () => string;
    };
    const markdown = markdownEditor.getMarkdown?.() ?? editor.getText();
    downloadBlob(
      new Blob([markdown], { type: "text/markdown" }),
      "arvo-document.md",
    );
  };

  return (
    <section
      className={`arvo-rich-editor arvo-rich-editor--${variant}`}
      data-invalid={isInvalid || undefined}
      data-readonly={isReadOnly || undefined}
    >
      {features.hasFixedToolbar && !isReadOnly && (
        <Toolbar
          editor={editor}
          providers={providers}
          toolbarExtensions={toolbarExtensions}
          onImageUpload={uploadImage}
          onAttachmentUpload={uploadAttachment}
          onAiAction={runAiAction}
        />
      )}

      <TableControls editor={editor} />
      {!isReadOnly && <ImageControls editor={editor} />}

      <div className="arvo-editor-surface">
        {features.hasBubbleToolbar && !isReadOnly && (
          <BubbleToolbar editor={editor} />
        )}
        <EditorContent editor={editor} />
      </div>

      <footer className="arvo-editor-footer">
        <div aria-live="polite">
          {uploadProgress !== null
            ? `Uploading ${uploadProgress}%`
            : autosave.isEnabled
              ? saveState === "saving"
                ? "Saving…"
                : saveState === "error"
                  ? "Could not save"
                  : "Saved"
              : ""}
        </div>

        <div className="arvo-editor-meta">
          {features.hasCharacterCount && (
            <span>{wordCount} words · {characterCount}/{maxLength} characters</span>
          )}
          <div className="arvo-export-actions">
            <button type="button" onClick={exportJson}>Export JSON</button>
            <button type="button" onClick={exportHtml}>Export HTML</button>
            {features.hasMarkdown && (
              <button type="button" onClick={exportMarkdown}>Export Markdown</button>
            )}
          </div>
        </div>
      </footer>
    </section>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
