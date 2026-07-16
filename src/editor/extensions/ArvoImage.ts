import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

function getImageElement(element: HTMLElement): HTMLImageElement | null {
  return element instanceof HTMLImageElement
    ? element
    : element.querySelector("img");
}

export const ArvoImage = Image.extend({
  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute("src"),
      },
      alt: {
        default: "",
        parseHTML: (element) => getImageElement(element)?.getAttribute("alt") ?? "",
      },
      title: {
        default: null,
        parseHTML: (element) => getImageElement(element)?.getAttribute("title"),
      },
      width: {
        default: "auto",
        parseHTML: (element) => element.getAttribute("data-width") ?? "auto",
      },
      alignment: {
        default: "left",
        parseHTML: (element) => element.getAttribute("data-align") ?? "left",
      },
      caption: {
        default: "",
        parseHTML: (element) => element.querySelector("figcaption")?.textContent ?? "",
      },
      href: {
        default: null,
        parseHTML: (element) => element.querySelector("a")?.getAttribute("href"),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'figure[data-arvo-image="true"]' },
      { tag: "img[src]" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      src,
      alt,
      title,
      width,
      alignment,
      caption,
      href,
    } = HTMLAttributes;

    const image = [
      "img",
      mergeAttributes(this.options.HTMLAttributes, {
        src,
        alt: alt ?? "",
        title,
        class: "arvo-editor-image",
      }),
    ];

    const media = href
      ? [
          "a",
          {
            href,
            target: "_blank",
            rel: "noopener noreferrer",
            class: "arvo-image-link",
          },
          image,
        ]
      : image;

    return [
      "figure",
      {
        "data-arvo-image": "true",
        "data-align": alignment ?? "left",
        "data-width": width ?? "auto",
        class: "arvo-image-figure",
        style: width && width !== "auto" ? `width: ${width}` : undefined,
      },
      media,
      caption
        ? ["figcaption", { class: "arvo-image-caption" }, caption]
        : ["figcaption", { class: "arvo-image-caption is-empty" }, ""],
    ];
  },
});
