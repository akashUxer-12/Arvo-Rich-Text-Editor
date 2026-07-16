import type { Editor } from "@tiptap/react";

export function TableControls({ editor }: { editor: Editor }) {
  if (!editor.isActive("table")) return null;

  return (
    <div className="arvo-table-controls" role="toolbar" aria-label="Table actions">
      <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()}>Column before</button>
      <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}>Column after</button>
      <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}>Delete column</button>
      <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()}>Row before</button>
      <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}>Row after</button>
      <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}>Delete row</button>
      <button type="button" onClick={() => editor.chain().focus().mergeCells().run()}>Merge cells</button>
      <button type="button" onClick={() => editor.chain().focus().splitCell().run()}>Split cell</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>Toggle header row</button>
      <button type="button" onClick={() => editor.chain().focus().deleteTable().run()}>Delete table</button>
    </div>
  );
}
