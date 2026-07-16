import { MarkdownManager } from "@tiptap/markdown";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import type { ArvoEditorDocument } from "./types";

const markdownManager = new MarkdownManager({
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
    Underline,
    Highlight.configure({ multicolor: true }),
    Link.configure({ protocols: ["http", "https", "mailto"] }),
    Table,
    TableRow,
    TableHeader,
    TableCell,
    TaskList.configure({ HTMLAttributes: { class: "arvo-task-list" } }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: "arvo-task-item" },
    }),
  ],
});

export function markdownToArvoDocument(markdown: string): ArvoEditorDocument {
  return {
    schema: "arvo-rich-editor",
    schemaVersion: "1.0.0",
    document: markdownManager.parse(markdown),
  };
}
