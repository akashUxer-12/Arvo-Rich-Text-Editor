import { useEffect, useReducer, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Link2,
  Maximize2,
  Trash2,
} from "lucide-react";

export function ImageControls({ editor }: { editor: Editor }) {
  const [, render] = useReducer((value) => value + 1, 0);
  const [caption, setCaption] = useState("");
  const [alt, setAlt] = useState("");
  const selectedSrc = useRef<string | null>(null);

  useEffect(() => {
    const update = () => render();
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  const isSelected = editor.isActive("image");
  const attributes = isSelected ? editor.getAttributes("image") : {};

  useEffect(() => {
    const src = (attributes.src as string | undefined) ?? null;
    if (src !== selectedSrc.current) {
      selectedSrc.current = src;
      setCaption((attributes.caption as string | undefined) ?? "");
      setAlt((attributes.alt as string | undefined) ?? "");
    }
  }, [attributes.alt, attributes.caption, attributes.src]);

  if (!isSelected) return null;

  const alignment = (attributes.alignment as string | undefined) ?? "left";
  const width = (attributes.width as string | undefined) ?? "auto";
  const percentage = width.endsWith("%") ? Number.parseInt(width, 10) : 50;

  const setAlignment = (value: "left" | "center" | "right") =>
    editor.chain().focus().updateAttributes("image", { alignment: value }).run();

  const setLink = () => {
    const current = (attributes.href as string | undefined) ?? "https://";
    const href = window.prompt("Image link URL", current);
    if (href === null) return;
    editor
      .chain()
      .focus()
      .updateAttributes("image", { href: href.trim() || null })
      .run();
  };

  return (
    <div className="arvo-image-controls" role="toolbar" aria-label="Image controls">
      <div className="arvo-image-control-group" aria-label="Image alignment">
        <button type="button" aria-label="Align image left" aria-pressed={alignment === "left"} onClick={() => setAlignment("left")}><AlignLeft /></button>
        <button type="button" aria-label="Align image center" aria-pressed={alignment === "center"} onClick={() => setAlignment("center")}><AlignCenter /></button>
        <button type="button" aria-label="Align image right" aria-pressed={alignment === "right"} onClick={() => setAlignment("right")}><AlignRight /></button>
      </div>

      <label className="arvo-image-size-control">
        <Maximize2 aria-hidden="true" />
        <span>Size</span>
        <input
          type="range"
          min="20"
          max="100"
          step="5"
          value={percentage}
          aria-label="Image width percentage"
          onChange={(event) =>
            editor.commands.updateAttributes("image", { width: `${event.target.value}%` })
          }
        />
        <output>{percentage}%</output>
      </label>

      <label className="arvo-image-text-control">
        <span>Caption</span>
        <input
          type="text"
          value={caption}
          placeholder="Add a caption"
          onChange={(event) => setCaption(event.target.value)}
          onBlur={() => editor.commands.updateAttributes("image", { caption })}
        />
      </label>

      <label className="arvo-image-text-control">
        <span>Alt text</span>
        <input
          type="text"
          value={alt}
          placeholder="Describe the image"
          onChange={(event) => setAlt(event.target.value)}
          onBlur={() => editor.commands.updateAttributes("image", { alt })}
        />
      </label>

      <button type="button" aria-label="Add or edit image link" aria-pressed={Boolean(attributes.href)} onClick={setLink}><Link2 /></button>
      <button type="button" aria-label="Delete image" onClick={() => editor.chain().focus().deleteSelection().run()}><Trash2 /></button>
    </div>
  );
}
