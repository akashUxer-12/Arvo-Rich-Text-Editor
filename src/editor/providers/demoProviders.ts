import type {
  AiProvider,
  AttachmentProvider,
  ImageProvider,
  MentionProvider,
  TagProvider,
} from "../types";

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const people = [
  { id: "user-akash", label: "Akash Upadhyay", description: "Senior UX Designer", entityType: "user" },
  { id: "user-austin", label: "Austin", description: "Arvo Engineering", entityType: "user" },
  { id: "team-demand", label: "Demand Planning", description: "Team", entityType: "team" },
  { id: "workspace-q3", label: "Q3 Planning", description: "Workspace", entityType: "workspace" },
];

const tags = [
  { id: "tag-supply-risk", label: "SupplyRisk", description: "Supply risk", entityType: "tag" },
  { id: "tag-needs-review", label: "NeedsReview", description: "Needs review", entityType: "tag" },
  { id: "tag-forecast", label: "Forecast2027", description: "Forecast planning", entityType: "tag" },
];

export const demoMentionProvider: MentionProvider = {
  async search(query) {
    await wait(120);
    return people.filter((item) =>
      `${item.label} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
    );
  },
};

export const demoTagProvider: TagProvider = {
  async search(query) {
    await wait(100);
    return tags.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()),
    );
  },
};

async function uploadAsObjectUrl(
  file: File,
  onProgress?: (progress: number) => void,
) {
  for (const progress of [20, 45, 70, 100]) {
    await wait(100);
    onProgress?.(progress);
  }

  return {
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    name: file.name,
    mimeType: file.type,
    size: file.size,
  };
}

export const demoImageProvider: ImageProvider = {
  upload: uploadAsObjectUrl,
};

export const demoAttachmentProvider: AttachmentProvider = {
  upload: uploadAsObjectUrl,
};

export const demoAiProvider: AiProvider = {
  async transform({ action, text, signal }) {
    await wait(500);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const clean = text.trim() || "Add content before using an AI action.";
    const transforms = {
      rewrite: `Rewritten: ${clean}`,
      summarize: `Summary: ${clean.slice(0, 180)}${clean.length > 180 ? "…" : ""}`,
      shorten: clean.split(/\s+/).slice(0, 18).join(" "),
      expand: `${clean}\n\nAdditional context can be added here through the Nova AI provider.`,
      grammar: clean.charAt(0).toUpperCase() + clean.slice(1),
      bullets: clean
        .split(/[.!?]\s+/)
        .filter(Boolean)
        .map((item) => `• ${item}`)
        .join("\n"),
      translate: `[Translated content] ${clean}`,
    };

    return transforms[action];
  },
};
