import { mergeAttributes, Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    attachment: {
      insertAttachment: (attributes: {
        id: string;
        url: string;
        name: string;
        mimeType: string;
        size: number;
      }) => ReturnType;
    };
  }
}

export const Attachment = Node.create({
  name: "attachment",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      id: { default: null },
      url: { default: null },
      name: { default: "Attachment" },
      mimeType: { default: "application/octet-stream" },
      size: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-arvo-attachment="true"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        "data-arvo-attachment": "true",
        class: "arvo-attachment",
        href: HTMLAttributes.url,
        target: "_blank",
        rel: "noopener noreferrer",
        download: HTMLAttributes.name,
        "aria-label": `Download ${HTMLAttributes.name}`,
      }),
      `📎 ${HTMLAttributes.name}`,
    ];
  },

  addCommands() {
    return {
      insertAttachment:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: attributes }),
    };
  },
});
