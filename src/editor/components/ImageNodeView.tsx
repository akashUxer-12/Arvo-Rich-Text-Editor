import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

type ResizeCorner = "nw" | "ne" | "sw" | "se";

export function ImageNodeView({ node, selected, updateAttributes, editor }: NodeViewProps) {
  const figureRef = useRef<HTMLElement | null>(null);
  const { src, alt, title, width, alignment, caption, href } = node.attrs;

  const startResize = (corner: ResizeCorner, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const figure = figureRef.current;
    const container = figure?.parentElement;
    if (!figure || !container) return;

    const startX = event.clientX;
    const startWidth = figure.getBoundingClientRect().width;
    const containerWidth = container.getBoundingClientRect().width;
    const direction = corner === "nw" || corner === "sw" ? -1 : 1;

    const onMove = (moveEvent: PointerEvent) => {
      const pixels = startWidth + (moveEvent.clientX - startX) * direction;
      const percentage = Math.min(100, Math.max(20, Math.round((pixels / containerWidth) * 100)));
      updateAttributes({ width: `${percentage}%` });
    };
    const onEnd = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onEnd);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };

    document.body.style.cursor = corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onEnd, { once: true });
  };

  return (
    <NodeViewWrapper
      as="figure"
      ref={figureRef}
      className={`arvo-image-figure${selected ? " is-selected" : ""}`}
      data-arvo-image="true"
      data-align={alignment ?? "left"}
      data-width={width ?? "auto"}
      style={width && width !== "auto" ? { width } : undefined}
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="arvo-image-link" onClick={(event) => editor.isEditable && event.preventDefault()}>
          <img className="arvo-editor-image" src={src} alt={alt ?? ""} title={title} draggable={false} />
        </a>
      ) : (
        <img className="arvo-editor-image" src={src} alt={alt ?? ""} title={title} draggable={false} />
      )}
      {caption ? <figcaption className="arvo-image-caption">{caption}</figcaption> : null}
      {selected && editor.isEditable && (["nw", "ne", "sw", "se"] as ResizeCorner[]).map((corner) => (
        <button key={corner} type="button" className={`arvo-image-resize-handle arvo-image-resize-handle--${corner}`} aria-label={`Resize image from ${corner} corner`} onPointerDown={(event) => startResize(corner, event)} />
      ))}
    </NodeViewWrapper>
  );
}
