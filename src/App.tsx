import { useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, PanelTop, Play, Sparkles } from "lucide-react";
import readmeContent from "../README.md?raw";
import { ArvoRichEditor } from "./editor/ArvoRichEditor";
import { markdownToArvoDocument } from "./editor/markdownToDocument";
import type { ArvoEditorDocument } from "./editor/types";
import {
  demoAiProvider,
  demoAttachmentProvider,
  demoImageProvider,
  demoMentionProvider,
  demoTagProvider,
} from "./editor/providers/demoProviders";

type AppTab = "playground" | "examples" | "readme";
type ExampleId =
  | "formatting"
  | "smart"
  | "planning"
  | "table"
  | "image"
  | "comment"
  | "task"
  | "release"
  | "knowledge"
  | "policy";

const emptyDocument: ArvoEditorDocument = {
  schema: "arvo-rich-editor",
  schemaVersion: "1.0.0",
  document: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Arvo Rich Editor" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Select text for the bubble toolbar, type / for commands, @ for mentions, and # for tags.",
          },
        ],
      },
    ],
  },
};

const examples: Array<{
  id: ExampleId;
  name: string;
  summary: string;
  features: string[];
  config: {
    variant: "basic" | "standard" | "advanced";
    maxLength: number;
    isReadOnly?: boolean;
    enabled: string[];
    features?: React.ComponentProps<typeof ArvoRichEditor>["features"];
  };
  document: ArvoEditorDocument;
}> = [
  {
    id: "formatting",
    name: "Text formatting",
    summary: "Headings, inline styles, quotes, code, lists, and contextual formatting.",
    features: [
      "Select the highlighted sentence to open the bubble toolbar.",
      "Open Formatting tools to use headings, font size, color, lists, links, and alignment.",
      "Try Ctrl/Cmd+B, Ctrl/Cmd+I, and Ctrl/Cmd+U.",
    ],
    config: { variant: "standard", maxLength: 30000, enabled: ["Formatting", "Bubble toolbar", "Links", "Lists"] },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Formatting showcase" }] },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Arvo Rich Editor supports " },
              { type: "text", marks: [{ type: "bold" }], text: "bold" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "italic" }], text: "italic" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "underline" }], text: "underline" },
              { type: "text", text: ", and structured document styles." },
            ],
          },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Make content easy to scan" }] },
          {
            type: "paragraph",
            content: [{ type: "text", marks: [{ type: "highlight", attrs: { color: null } }], text: "Select this sentence to reveal the contextual bubble toolbar." }],
          },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Use headings to create hierarchy" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Use lists for related information" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Use quotes for emphasis or references" }] }] },
            ],
          },
          { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "The interface belongs to Arvo; Tiptap remains the editing engine." }] }] },
        ],
      },
    },
  },
  {
    id: "smart",
    name: "Smart insertion",
    summary: "Slash commands, mentions, hashtags, Markdown shortcuts, and Nova AI.",
    features: [
      "Start a blank line and type / to open the command palette.",
      "Type @ to mention a person, team, or workspace.",
      "Type #Supply to find a tag; type ## followed by Space for Heading 2.",
      "Select text and choose a Nova AI transformation from Formatting tools.",
    ],
    config: { variant: "advanced", maxLength: 30000, enabled: ["Slash commands", "Mentions", "Tags", "Markdown", "Nova AI"] },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Smart insertion" }] },
          { type: "paragraph", content: [{ type: "text", text: "Try each shortcut on a new line:" }] },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "code" }], text: "/" }, { type: "text", text: " inserts blocks and product commands" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "code" }], text: "@" }, { type: "text", text: " searches permitted entities" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", marks: [{ type: "code" }], text: "#" }, { type: "text", text: " searches structured tags" }] }] },
            ],
          },
          { type: "paragraph", content: [{ type: "text", text: "Add your own content below and try the suggestions." }] },
          { type: "paragraph" },
        ],
      },
    },
  },
  {
    id: "planning",
    name: "Planning brief",
    summary: "A realistic enterprise document with status, decisions, tasks, and risks.",
    features: [
      "Edit this preloaded business document instead of starting from blank content.",
      "Use Status from the extensible toolbar or Risk summary from the slash menu.",
      "The document is continuously represented as versioned JSON.",
    ],
    config: { variant: "advanced", maxLength: 50000, enabled: ["Full toolbar", "Product extensions", "Autosave", "Structured JSON"] },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Q3 supply-planning brief" }] },
          { type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Status: " }, { type: "text", text: "On track with two risks requiring review." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Objectives" }] },
          {
            type: "orderedList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Confirm regional demand assumptions." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Resolve constrained supplier allocations." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Publish the approved operating scenario." }] }] },
            ],
          },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Decision required" }] },
          { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Approve the alternate supplier before the Friday planning cycle." }] }] },
          { type: "paragraph", content: [{ type: "text", text: "Add an @mention for the owner and a #tag for classification." }] },
        ],
      },
    },
  },
  {
    id: "table",
    name: "Structured table",
    summary: "Table insertion and contextual row, column, header, merge, and split actions.",
    features: [
      "Place the cursor inside the table to reveal contextual table controls.",
      "Add or delete rows and columns, merge or split cells, and toggle the header row.",
      "Use an Arvo Grid—not an editor table—for formulas or large datasets.",
    ],
    config: { variant: "standard", maxLength: 20000, enabled: ["Tables", "Contextual controls", "Resizable columns"], features: { hasImages: false, hasAttachments: false, hasAI: false } },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Scenario comparison" }] },
          { type: "paragraph", content: [{ type: "text", text: "Click any cell to edit the table structure." }] },
          {
            type: "table",
            content: [
              {
                type: "tableRow",
                content: ["Scenario", "Revenue", "Risk"].map((text) => ({ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text }] }] })),
              },
              {
                type: "tableRow",
                content: ["Baseline", "$12.4M", "Medium"].map((text) => ({ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text }] }] })),
              },
              {
                type: "tableRow",
                content: ["Upside", "$14.1M", "High"].map((text) => ({ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text }] }] })),
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: "image",
    name: "Image authoring",
    summary: "Upload, select, resize, position, caption, describe, and link an image.",
    features: [
      "Select the image to open its contextual image toolbar.",
      "Resize it from 20% to 100% and align it left, center, or right.",
      "Add a caption and accessible alternative text, or make the image clickable with a hyperlink.",
      "Upload another image from the formatting toolbar, by pasting, or with drag and drop.",
    ],
    config: {
      variant: "advanced",
      maxLength: 30000,
      enabled: ["Image upload", "Resize", "Alignment", "Caption", "Alt text", "Image hyperlink"],
      features: { hasTables: false, hasAttachments: false, hasAI: false },
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Image authoring" }] },
          { type: "paragraph", content: [{ type: "text", text: "Click the image below to explore every image-specific control." }] },
          {
            type: "image",
            attrs: {
              src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
              alt: "Laptop displaying code on a desk",
              title: "Arvo image authoring example",
              width: "60%",
              alignment: "left",
              caption: "A selectable image with a stored caption, alignment, and width.",
              href: null,
            },
          },
          { type: "paragraph", content: [{ type: "text", text: "Images are aligned left by default when uploaded." }] },
        ],
      },
    },
  },
  {
    id: "comment",
    name: "Compact comment",
    summary: "A minimal editor for conversations, notes, and short product feedback.",
    features: [
      "The basic variant uses a smaller editing surface.",
      "Select text to reveal the bubble toolbar; the full toolbar is intentionally unavailable.",
      "Mentions and links remain available while tables, images, attachments, tags, Markdown, and AI are disabled.",
    ],
    config: {
      variant: "basic",
      maxLength: 1000,
      enabled: ["Basic variant", "Bubble toolbar", "Mentions", "Links", "1,000-character limit"],
      features: {
        hasFixedToolbar: false,
        hasSlashCommands: false,
        hasTags: false,
        hasImages: false,
        hasTables: false,
        hasAttachments: false,
        hasMarkdown: false,
        hasAI: false,
      },
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "The updated forecast looks good. Add an @mention to request a final review." }] },
        ],
      },
    },
  },
  {
    id: "task",
    name: "Task description",
    summary: "A focused configuration for assignments, acceptance criteria, and checklists.",
    features: [
      "Use task lists for acceptance criteria and completion tracking.",
      "Add a link or mention an owner without enabling heavy document features.",
      "Images and tables are disabled to keep this workflow focused.",
    ],
    config: {
      variant: "standard",
      maxLength: 8000,
      enabled: ["Task lists", "Mentions", "Tags", "Links", "Slash commands"],
      features: { hasImages: false, hasTables: false, hasAttachments: false, hasAI: false },
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Update constrained-supply workflow" }] },
          { type: "paragraph", content: [{ type: "text", text: "Refine the approval flow and validate the new exception states." }] },
          { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Acceptance criteria" }] },
          {
            type: "taskList",
            content: [
              { type: "taskItem", attrs: { checked: true }, content: [{ type: "paragraph", content: [{ type: "text", text: "Design reviewed" }] }] },
              { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Keyboard flow verified" }] }] },
              { type: "taskItem", attrs: { checked: false }, content: [{ type: "paragraph", content: [{ type: "text", text: "Product owner approval received" }] }] },
            ],
          },
        ],
      },
    },
  },
  {
    id: "release",
    name: "Release notes",
    summary: "Structured product communication using headings, lists, links, and code snippets.",
    features: [
      "Organize changes with headings and scannable lists.",
      "Use inline code for configuration keys and a code block for examples.",
      "AI, uploads, and tables are disabled for this publishing workflow.",
    ],
    config: {
      variant: "standard",
      maxLength: 15000,
      enabled: ["Headings", "Lists", "Code", "Links", "Markdown"],
      features: { hasImages: false, hasTables: false, hasAttachments: false, hasAI: false, hasMentions: false, hasTags: false },
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Arvo Rich Editor 1.1" }] },
          { type: "paragraph", content: [{ type: "text", text: "This release introduces guided examples and configuration presets." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Added" }] },
          {
            type: "bulletList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Preloaded enterprise authoring scenarios" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Progressive toolbar disclosure" }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Per-scenario feature configuration" }] }] },
            ],
          },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Configuration" }] },
          { type: "codeBlock", attrs: { language: null }, content: [{ type: "text", text: "<ArvoRichEditor variant=\"standard\" />" }] },
        ],
      },
    },
  },
  {
    id: "knowledge",
    name: "Knowledge article",
    summary: "Long-form documentation with the complete advanced authoring configuration.",
    features: [
      "This advanced preset enables every open-source baseline capability.",
      "Try images, attachments, tables, mentions, tags, slash commands, Markdown, and Nova AI.",
      "The 75,000-character limit demonstrates a long-form knowledge use case.",
    ],
    config: {
      variant: "advanced",
      maxLength: 75000,
      enabled: ["Advanced variant", "All capabilities", "Nova AI", "75,000-character limit"],
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Managing supply exceptions" }] },
          { type: "paragraph", content: [{ type: "text", text: "This article explains how planners review, prioritize, and resolve constrained-supply exceptions." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Before you begin" }] },
          { type: "paragraph", content: [{ type: "text", text: "Confirm that you have permission to view the relevant workspace and scenarios." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Resolution workflow" }] },
          {
            type: "orderedList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Review the exception impact and priority." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Compare available supply scenarios." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Record the decision and notify affected owners." }] }] },
            ],
          },
          { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "Use product-specific slash commands to insert governed business blocks." }] }] },
        ],
      },
    },
  },
  {
    id: "policy",
    name: "Published policy",
    summary: "A read-only rendering scenario for approved and governed content.",
    features: [
      "Editing controls and contextual menus are unavailable in read-only mode.",
      "The document retains semantic headings, lists, links, and structured content.",
      "Use this mode for approved policies, archived content, and permission-restricted viewers.",
    ],
    config: {
      variant: "standard",
      maxLength: 30000,
      isReadOnly: true,
      enabled: ["Read-only", "Semantic rendering", "No mutation controls"],
      features: { hasAI: false },
    },
    document: {
      schema: "arvo-rich-editor",
      schemaVersion: "1.0.0",
      document: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Scenario approval policy" }] },
          { type: "paragraph", content: [{ type: "text", text: "Approved scenarios must complete the following review before publication." }] },
          {
            type: "orderedList",
            content: [
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Validate source data and assumptions." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Record reviewer approval." }] }] },
              { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Publish the governed version." }] }] },
            ],
          },
          { type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "Status: Approved" }] },
        ],
      },
    },
  },
];

const editorProviders = {
  mentions: demoMentionProvider,
  tags: demoTagProvider,
  images: demoImageProvider,
  attachments: demoAttachmentProvider,
  ai: demoAiProvider,
};

const readmeDocument = markdownToArvoDocument(readmeContent);

export default function App() {
  const [tab, setTab] = useState<AppTab>("playground");
  const [playgroundDocument, setPlaygroundDocument] = useState(emptyDocument);
  const [exampleId, setExampleId] = useState<ExampleId>("formatting");
  const selectedExample = useMemo(
    () => examples.find((example) => example.id === exampleId) ?? examples[0],
    [exampleId],
  );
  const [exampleDocuments, setExampleDocuments] = useState<Record<ExampleId, ArvoEditorDocument>>(
    () => Object.fromEntries(examples.map((example) => [example.id, example.document])) as Record<ExampleId, ArvoEditorDocument>,
  );
  const [readOnly, setReadOnly] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const sharedExtensions = {
    customShortcuts: [
      {
        id: "insert-callout",
        keys: "Mod-Shift-8",
        label: "Insert callout",
        run: ({ editor }: Parameters<NonNullable<React.ComponentProps<typeof ArvoRichEditor>["customShortcuts"]>[number]["run"]>[0]) =>
          editor.chain().focus().toggleBlockquote().run(),
      },
    ],
    toolbarExtensions: [
      {
        id: "insert-status",
        group: "insert" as const,
        label: "Status",
        ariaLabel: "Insert status text",
        run: ({ editor }: Parameters<NonNullable<React.ComponentProps<typeof ArvoRichEditor>["toolbarExtensions"]>[number]["run"]>[0]) =>
          editor.chain().focus().insertContent("Status: On track").run(),
      },
    ],
    slashCommandExtensions: [
      {
        id: "insert-risk-summary",
        label: "Risk summary",
        description: "Insert an o9 risk summary template",
        group: "o9" as const,
        keywords: ["risk", "supply", "template"],
        run: ({ editor, range }: Parameters<NonNullable<React.ComponentProps<typeof ArvoRichEditor>["slashCommandExtensions"]>[number]["run"]>[0]) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent("<h2>Risk summary</h2><ul><li>Risk</li><li>Impact</li><li>Mitigation</li></ul>")
            .run(),
      },
    ],
  };

  return (
    <main className="demo-shell">
      <header className="demo-header">
        <div>
          <p className="demo-eyebrow">ARVO DESIGN SYSTEM</p>
          <h1>Rich Editor reference implementation</h1>
          <p>
            Tiptap provides the editing engine. Arvo owns the interface,
            accessibility, extension registry, storage adapters, and product integrations.
          </p>
        </div>
      </header>

      <nav className="demo-tabs" aria-label="Rich editor demos">
        <button
          type="button"
          className={tab === "playground" ? "is-active" : ""}
          aria-current={tab === "playground" ? "page" : undefined}
          onClick={() => setTab("playground")}
        >
          <Play aria-hidden="true" /> Playground
        </button>
        <button
          type="button"
          className={tab === "examples" ? "is-active" : ""}
          aria-current={tab === "examples" ? "page" : undefined}
          onClick={() => setTab("examples")}
        >
          <Sparkles aria-hidden="true" /> Loaded examples
        </button>
        <button
          type="button"
          className={tab === "readme" ? "is-active" : ""}
          aria-current={tab === "readme" ? "page" : undefined}
          onClick={() => setTab("readme")}
        >
          <BookOpen aria-hidden="true" /> Read Me
        </button>
      </nav>

      {tab === "playground" ? (
        <section className="demo-tab-panel" aria-label="Playground">
          <div className="demo-panel-heading">
            <div>
              <p className="demo-section-label">PLAYGROUND</p>
              <h2>Start with a flexible editor</h2>
              <p>Experiment freely with all enabled capabilities and inspect the resulting JSON.</p>
            </div>
            <label className="demo-toggle">
              <input type="checkbox" checked={readOnly} onChange={(event) => setReadOnly(event.target.checked)} />
              Read-only
            </label>
          </div>

          <ArvoRichEditor
            value={playgroundDocument}
            onChange={setPlaygroundDocument}
            variant="advanced"
            isReadOnly={readOnly}
            placeholder="Start writing, or type / for commands"
            maxLength={30000}
            autosave={{ isEnabled: true, delay: 800, storageKey: "arvo-rich-editor-demo" }}
            providers={editorProviders}
            {...sharedExtensions}
          />

          <details className="demo-debug">
            <summary>Current versioned JSON document</summary>
            <pre>{JSON.stringify(playgroundDocument, null, 2)}</pre>
          </details>
        </section>
      ) : tab === "examples" ? (
        <section className="demo-tab-panel" aria-label="Loaded examples">
          <div className="demo-panel-heading">
            <div>
              <p className="demo-section-label">GUIDED EXAMPLES</p>
              <h2>Learn through preloaded content</h2>
              <p>Choose an example, read what it demonstrates, and edit the document directly.</p>
            </div>
            <button
              type="button"
              className={`demo-toolbar-toggle ${isToolbarVisible ? "is-active" : ""}`}
              aria-pressed={isToolbarVisible}
              onClick={() => setIsToolbarVisible((visible) => !visible)}
            >
              <PanelTop aria-hidden="true" />
              {isToolbarVisible ? "Hide formatting tools" : "Show formatting tools"}
            </button>
          </div>

          <div className="demo-example-layout">
            <aside className="demo-example-picker" aria-label="Example documents">
              {examples.map((example) => (
                <button
                  type="button"
                  key={example.id}
                  className={example.id === exampleId ? "is-active" : ""}
                  aria-pressed={example.id === exampleId}
                  onClick={() => setExampleId(example.id)}
                >
                  <strong>{example.name}</strong>
                  <span>{example.summary}</span>
                </button>
              ))}
            </aside>

            <div className="demo-example-content">
              <div className="demo-feature-guide">
                <div>
                  <p className="demo-section-label">WHAT TO TRY</p>
                  <h3>{selectedExample.name}</h3>
                </div>
                <ul>
                  {selectedExample.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
                <div className="demo-visibility-note">
                  {isToolbarVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
                  The fixed toolbar is {isToolbarVisible ? "visible" : "hidden by default"}. Text selection still opens the bubble toolbar.
                </div>
                <div className="demo-config-summary" aria-label="Example configuration">
                  <span>{selectedExample.config.variant} variant</span>
                  {selectedExample.config.enabled.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>

              <ArvoRichEditor
                key={exampleId}
                value={exampleDocuments[exampleId]}
                onChange={(document) => setExampleDocuments((current) => ({ ...current, [exampleId]: document }))}
                variant={selectedExample.config.variant}
                isReadOnly={selectedExample.config.isReadOnly}
                placeholder="Continue writing…"
                maxLength={selectedExample.config.maxLength}
                features={{
                  ...selectedExample.config.features,
                  hasFixedToolbar:
                    selectedExample.config.features?.hasFixedToolbar === false
                      ? false
                      : isToolbarVisible,
                }}
                providers={editorProviders}
                {...sharedExtensions}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="demo-tab-panel" aria-label="Read Me">
          <div className="demo-panel-heading">
            <div>
              <p className="demo-section-label">LIVING DOCUMENTATION</p>
              <h2>Arvo Rich Editor README</h2>
              <p>This view loads the repository README directly, so documentation updates appear here automatically.</p>
            </div>
          </div>
          <article className="demo-readme" aria-label="README rendered with Arvo Rich Editor">
            <ArvoRichEditor
              value={readmeDocument}
              onChange={() => undefined}
              variant="advanced"
              isReadOnly
              maxLength={200000}
              features={{
                hasFixedToolbar: false,
                hasBubbleToolbar: false,
                hasSlashCommands: false,
                hasMentions: false,
                hasTags: false,
                hasImages: false,
                hasAttachments: false,
                hasAI: false,
                hasCharacterCount: false,
              }}
            />
          </article>
        </section>
      )}
    </main>
  );
}
