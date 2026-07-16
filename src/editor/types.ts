import type { Editor, JSONContent, Range } from "@tiptap/core";

export type ArvoEditorVariant = "basic" | "standard" | "advanced";
export type ArvoOutputFormat = "json" | "html" | "markdown";

export interface ArvoEditorDocument {
  schema: "arvo-rich-editor";
  schemaVersion: string;
  document: JSONContent;
}

export interface EditorCommandContext {
  editor: Editor;
}

export interface SlashCommandContext extends EditorCommandContext {
  range: Range;
}

export interface ToolbarExtension {
  id: string;
  group: "format" | "insert" | "history" | "ai" | "custom";
  label: string;
  ariaLabel: string;
  isActive?: (context: EditorCommandContext) => boolean;
  isEnabled?: (context: EditorCommandContext) => boolean;
  run: (context: EditorCommandContext) => boolean;
}

export interface SlashCommandExtension {
  id: string;
  label: string;
  description?: string;
  group: "basic" | "media" | "structure" | "o9" | "ai" | "custom";
  keywords?: string[];
  run: (context: SlashCommandContext) => boolean;
}

export interface CustomShortcut {
  id: string;
  keys: string;
  label: string;
  run: (context: EditorCommandContext) => boolean;
}

export interface SuggestionEntity {
  id: string;
  label: string;
  description?: string;
  avatarUrl?: string;
  entityType?: string;
}

export interface UploadResult {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  alt?: string;
}

export interface MentionProvider {
  search(query: string): Promise<SuggestionEntity[]>;
}

export interface TagProvider {
  search(query: string): Promise<SuggestionEntity[]>;
}

export interface ImageProvider {
  upload(file: File, onProgress?: (progress: number) => void): Promise<UploadResult>;
}

export interface AttachmentProvider {
  upload(file: File, onProgress?: (progress: number) => void): Promise<UploadResult>;
}

export type AiAction =
  | "rewrite"
  | "summarize"
  | "shorten"
  | "expand"
  | "grammar"
  | "bullets"
  | "translate";

export interface AiProvider {
  transform(input: {
    action: AiAction;
    text: string;
    signal?: AbortSignal;
  }): Promise<string>;
}

export interface ArvoRichEditorProviders {
  mentions?: MentionProvider;
  tags?: TagProvider;
  images?: ImageProvider;
  attachments?: AttachmentProvider;
  ai?: AiProvider;
}

export interface ArvoRichEditorFeatures {
  hasFixedToolbar?: boolean;
  hasBubbleToolbar?: boolean;
  hasSlashCommands?: boolean;
  hasMentions?: boolean;
  hasTags?: boolean;
  hasImages?: boolean;
  hasTables?: boolean;
  hasLinks?: boolean;
  hasAttachments?: boolean;
  hasMarkdown?: boolean;
  hasCharacterCount?: boolean;
  hasAI?: boolean;
}

export interface ArvoAutosaveConfig {
  isEnabled: boolean;
  delay?: number;
  storageKey?: string;
  onSave?: (document: ArvoEditorDocument) => Promise<void>;
}
