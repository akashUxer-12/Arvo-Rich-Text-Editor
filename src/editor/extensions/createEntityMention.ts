import Mention from "@tiptap/extension-mention";
import type { MentionProvider, TagProvider } from "../types";
import { createSuggestionRenderer } from "./suggestionRenderer";

export function createUserMention(provider?: MentionProvider) {
  return Mention.extend({ name: "mention" }).configure({
    HTMLAttributes: {
      class: "arvo-entity arvo-mention",
      "data-entity-type": "mention",
    },
    renderText({ node }) {
      return `@${node.attrs.label ?? node.attrs.id}`;
    },
    suggestion: {
      char: "@",
      allowSpaces: true,
      items: async ({ query }) => provider?.search(query) ?? [],
      render: createSuggestionRenderer({ prefix: "@", emptyLabel: "No people or entities found" }),
      command: ({ editor, range, props }) => {
        const entity = props as typeof props & { entityType?: string };
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: "mention",
              attrs: {
                id: props.id,
                label: props.label,
                entityType: entity.entityType,
              },
            },
            { type: "text", text: " " },
          ])
          .run();
      },
    },
  });
}

export function createTagMention(provider?: TagProvider) {
  return Mention.extend({ name: "tag" }).configure({
    HTMLAttributes: {
      class: "arvo-entity arvo-tag",
      "data-entity-type": "tag",
    },
    renderText({ node }) {
      return `#${node.attrs.label ?? node.attrs.id}`;
    },
    suggestion: {
      char: "#",
      allowSpaces: false,
      allowedPrefixes: [" ", "\n"],
      startOfLine: false,
      items: async ({ query }) => provider?.search(query) ?? [],
      render: createSuggestionRenderer({ prefix: "#", emptyLabel: "No tags found" }),
      command: ({ editor, range, props }) => {
        editor
          .chain()
          .focus()
          .insertContentAt(range, [
            {
              type: "tag",
              attrs: {
                id: props.id,
                label: props.label,
                entityType: "tag",
              },
            },
            { type: "text", text: " " },
          ])
          .run();
      },
    },
  });
}
