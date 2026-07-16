import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance } from "tippy.js";
import type { SuggestionEntity } from "../types";

export interface SuggestionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SuggestionListProps {
  items: SuggestionEntity[];
  command: (item: SuggestionEntity) => void;
  emptyLabel?: string;
  prefix?: string;
}

const SuggestionList = forwardRef<SuggestionListHandle, SuggestionListProps>(
  ({ items, command, emptyLabel = "No results", prefix = "" }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => setSelectedIndex(0), [items]);

    const select = (index: number) => {
      const item = items[index];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex((selectedIndex + items.length - 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          select(selectedIndex);
          return true;
        }
        return false;
      },
    }));

    return (
      <div className="arvo-suggestion-menu" role="listbox" aria-label="Suggestions">
        {items.length === 0 ? (
          <div className="arvo-suggestion-empty">{emptyLabel}</div>
        ) : (
          items.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={index === selectedIndex ? "is-selected" : ""}
              key={item.id}
              onMouseDown={(event) => {
                event.preventDefault();
                command(item);
              }}
            >
              <span className="arvo-suggestion-label">
                {prefix}{item.label}
              </span>
              {item.description && (
                <span className="arvo-suggestion-description">{item.description}</span>
              )}
            </button>
          ))
        )}
      </div>
    );
  },
);

SuggestionList.displayName = "SuggestionList";

export function createSuggestionRenderer(options?: {
  prefix?: string;
  emptyLabel?: string;
}) {
  return () => {
    let component: ReactRenderer<SuggestionListHandle> | null = null;
    let popup: Instance[] = [];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SuggestionList, {
          props: { ...props, ...options },
          editor: props.editor,
        });

        if (!props.clientRect) return;

        popup = tippy("body", {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },

      onUpdate(props: any) {
        component?.updateProps({ ...props, ...options });
        if (props.clientRect) {
          popup[0]?.setProps({ getReferenceClientRect: props.clientRect });
        }
      },

      onKeyDown(props: any) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup[0]?.destroy();
        component?.destroy();
      },
    };
  };
}
