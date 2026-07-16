import { useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Undo2,
  Redo2,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code2,
  Link2,
  Unlink,
  ImagePlus,
  Table2,
  Paperclip,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Sparkles,
  RemoveFormatting,
} from "lucide-react";
import type {
  AiAction,
  ArvoRichEditorProviders,
  ToolbarExtension,
} from "../types";
import { openLinkEditor } from "../linkActions";

interface ToolbarProps {
  editor: Editor;
  providers: ArvoRichEditorProviders;
  toolbarExtensions: ToolbarExtension[];
  onImageUpload: (file: File) => Promise<void>;
  onAttachmentUpload: (file: File) => Promise<void>;
  onAiAction: (action: AiAction) => Promise<void>;
}

interface ToolbarButtonProps {
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

function ToolbarButton({
  label,
  isActive,
  isDisabled,
  onPress,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={isActive ? "is-active" : ""}
      aria-label={label}
      aria-pressed={isActive}
      disabled={isDisabled}
      onMouseDown={(event) => {
        event.preventDefault();
        onPress();
      }}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  editor,
  providers,
  toolbarExtensions,
  onImageUpload,
  onAttachmentUpload,
  onAiAction,
}: ToolbarProps) {
  const imageInput = useRef<HTMLInputElement>(null);
  const attachmentInput = useRef<HTMLInputElement>(null);

  return (
    <div
      className="arvo-toolbar"
      role="toolbar"
      aria-label="Rich text formatting"
      onKeyDown={(event) => {
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            'button:not([disabled])',
          ),
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const delta = event.key === "ArrowRight" ? 1 : -1;
          buttons[(current + delta + buttons.length) % buttons.length]?.focus();
        }
        if (event.key === "Home") {
          event.preventDefault();
          buttons[0]?.focus();
        }
        if (event.key === "End") {
          event.preventDefault();
          buttons.at(-1)?.focus();
        }
      }}
    >
      <div className="arvo-toolbar-group" aria-label="Text style">
        <select
          aria-label="Text style"
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : editor.isActive("heading", { level: 4 })
                    ? "h4"
                    : editor.isActive("heading", { level: 5 })
                      ? "h5"
                      : editor.isActive("heading", { level: 6 })
                        ? "h6"
                        : "paragraph"
          }
          onChange={(event) => {
            const value = event.target.value;
            if (value === "paragraph") {
              editor.chain().focus().setParagraph().run();
            } else {
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
            }
          }}
        >
          <option value="paragraph">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <select
          aria-label="Font size"
          defaultValue="14px"
          onChange={(event) =>
            editor.chain().focus().setFontSize(event.target.value).run()
          }
        >
          {["12px", "14px", "16px", "18px", "20px", "24px", "32px"].map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div className="arvo-toolbar-group" aria-label="Formatting">
        <ToolbarButton label="Bold" isActive={editor.isActive("bold")} onPress={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
        <ToolbarButton label="Italic" isActive={editor.isActive("italic")} onPress={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
        <ToolbarButton label="Underline" isActive={editor.isActive("underline")} onPress={() => editor.chain().focus().toggleUnderline().run()}><Underline /></ToolbarButton>
        <ToolbarButton label="Strikethrough" isActive={editor.isActive("strike")} onPress={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
        <ToolbarButton label="Highlight" isActive={editor.isActive("highlight")} onPress={() => editor.chain().focus().toggleHighlight().run()}><Highlighter /></ToolbarButton>
        <input
          className="arvo-color-input"
          type="color"
          defaultValue="#1c2024"
          aria-label="Text color"
          title="Text color"
          onChange={(event) => editor.chain().focus().setColor(event.target.value).run()}
        />
        <input
          className="arvo-color-input arvo-highlight-color-input"
          type="color"
          defaultValue="#fff59d"
          aria-label="Highlight background color"
          title="Highlight background color"
          onChange={(event) => editor.chain().focus().setHighlight({ color: event.target.value }).run()}
        />
        <ToolbarButton label="Clear formatting" onPress={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><RemoveFormatting /></ToolbarButton>
      </div>

      <div className="arvo-toolbar-group" aria-label="Lists and blocks">
        <ToolbarButton label="Bullet list" isActive={editor.isActive("bulletList")} onPress={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
        <ToolbarButton label="Numbered list" isActive={editor.isActive("orderedList")} onPress={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
        <ToolbarButton label="Task list" isActive={editor.isActive("taskList")} onPress={() => editor.chain().focus().toggleTaskList().run()}><ListTodo /></ToolbarButton>
        <ToolbarButton label="Quote" isActive={editor.isActive("blockquote")} onPress={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
        <ToolbarButton label="Code block" isActive={editor.isActive("codeBlock")} onPress={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 /></ToolbarButton>
      </div>

      <div className="arvo-toolbar-group" aria-label="Alignment">
        <ToolbarButton label="Align left" isActive={editor.isActive({ textAlign: "left" })} onPress={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft /></ToolbarButton>
        <ToolbarButton label="Align center" isActive={editor.isActive({ textAlign: "center" })} onPress={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter /></ToolbarButton>
        <ToolbarButton label="Align right" isActive={editor.isActive({ textAlign: "right" })} onPress={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight /></ToolbarButton>
      </div>

      <div className="arvo-toolbar-group" aria-label="Insert">
        <ToolbarButton label="Insert or edit link (Cmd/Ctrl+K)" isActive={editor.isActive("link")} onPress={() => openLinkEditor(editor)}><Link2 /></ToolbarButton>
        <ToolbarButton label="Remove link" isDisabled={!editor.isActive("link")} onPress={() => editor.chain().focus().unsetLink().run()}><Unlink /></ToolbarButton>
        <ToolbarButton label="Upload image" isDisabled={!providers.images} onPress={() => imageInput.current?.click()}><ImagePlus /></ToolbarButton>
        <ToolbarButton label="Insert table" onPress={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></ToolbarButton>
        <ToolbarButton label="Upload attachment" isDisabled={!providers.attachments} onPress={() => attachmentInput.current?.click()}><Paperclip /></ToolbarButton>
      </div>

      <div className="arvo-toolbar-group" aria-label="History">
        <ToolbarButton label="Undo" isDisabled={!editor.can().undo()} onPress={() => editor.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
        <ToolbarButton label="Redo" isDisabled={!editor.can().redo()} onPress={() => editor.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
      </div>

      {providers.ai && (
        <div className="arvo-toolbar-group" aria-label="AI">
          <select
            aria-label="Nova AI action"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) {
                void onAiAction(event.target.value as AiAction);
                event.target.value = "";
              }
            }}
          >
            <option value="">Nova AI</option>
            <option value="rewrite">Rewrite</option>
            <option value="summarize">Summarize</option>
            <option value="shorten">Shorten</option>
            <option value="expand">Expand</option>
            <option value="grammar">Improve grammar</option>
            <option value="bullets">Convert to bullets</option>
            <option value="translate">Translate</option>
          </select>
          <Sparkles aria-hidden="true" />
        </div>
      )}

      {toolbarExtensions.map((extension) => (
        <ToolbarButton
          key={extension.id}
          label={extension.ariaLabel}
          isActive={extension.isActive?.({ editor })}
          isDisabled={extension.isEnabled ? !extension.isEnabled({ editor }) : false}
          onPress={() => extension.run({ editor })}
        >
          {extension.label}
        </ToolbarButton>
      ))}

      <input
        ref={imageInput}
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onImageUpload(file);
          event.target.value = "";
        }}
      />
      <input
        ref={attachmentInput}
        hidden
        type="file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void onAttachmentUpload(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
