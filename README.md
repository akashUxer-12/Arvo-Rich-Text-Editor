# Arvo Rich Editor — Codex Reference Implementation

Arvo Rich Editor is a React and TypeScript reference implementation of an
enterprise rich-text editor built on the open-source Tiptap editing engine.

[Tiptap](https://github.com/ueberdosis/tiptap) and [ProseMirror](https://github.com/prosemirror/prosemirror) provide the underlying document model, selection, transactions, editing commands, parsing, and browser editing behavior. Arvo owns the visible experience: toolbars, menus, interaction patterns, accessibility, design tokens, data contracts, providers, extension APIs, and product integrations.

This repository demonstrates the intended architecture and the open-source
feature baseline. It is a working starter, not a production-ready service.
Demo providers must be replaced with authenticated o9 services before release.

The demo application's **Read Me** tab parses this Markdown file into versioned
Arvo JSON and renders it using `ArvoRichEditor` in read-only mode. This makes the
documentation tab a real example of long-form Markdown import and governed
read-only rendering rather than a separate documentation renderer.

## Architecture rule

Product teams consume `ArvoRichEditor`. They must not import, configure, or
extend Tiptap directly.

```text
Product application
        │
        ▼
ArvoRichEditor public API
        │
        ├── Arvo toolbar and contextual UI
        ├── Arvo extension registries
        ├── Arvo data and provider contracts
        ├── Arvo accessibility behavior
        └── Approved Tiptap extensions
                    │
                    ▼
                ProseMirror
```

Keeping Tiptap behind the Arvo abstraction provides a consistent product API,
prevents incompatible schemas, controls licensing, and preserves a practical
path to migrate the underlying engine later.

## Production bundle architecture

The supported production entry point is:

```ts
import { ArvoRichEditor } from "./editor";
```

This entry is a lazy preset router rather than the all-features implementation.
It creates separate client chunks for the lightweight and full editors:

- `variant="basic"` loads `ArvoBasicEditor`, containing paragraphs, bold,
  italic, underline, strikethrough, bullet and numbered lists, links,
  undo/redo, placeholder, character limit, sanitization, and autosave.
- `variant="standard"` or `variant="advanced"` loads the full editor only when
  that editor is first rendered.
- Explicitly requesting an advanced feature from a basic configuration routes
  to the full editor so capabilities are never silently omitted.

The basic component does not import tables, images, attachments, Markdown,
mentions, tags, slash commands, Tippy, or the advanced toolbar. The production
build emits the basic component as a small independent feature chunk, while the
complete editor is isolated in its own lazy chunk. Products using comment fields
therefore do not initialize or execute the advanced editor.

Applications must not import `ArvoRichEditor.tsx` directly because that bypasses
the production preset router and eagerly selects the full implementation.

The build removes the previous output directory before compiling. This prevents
obsolete demo bundles from being accidentally included in deployment archives.

The build also enforces gzip budgets for the preset chunks. At the time this
architecture was introduced, the emitted component-specific chunks measured
approximately 1.7 KiB gzip for `ArvoBasicEditor` and 39 KiB gzip for the full
`ArvoRichEditor` implementation. Shared React, Tiptap, and application chunks
are measured separately by the consuming application's performance budget.

### Runtime performance rules

- Use `basic` for comments, notes, and short descriptions.
- Mount editors only when their containing surface is visible.
- Do not initialize collaborative, AI, table, media, or Markdown behavior for a
  basic editor.
- Keep README content and loaded examples in the demo application; they are not
  exported by the editor entry point.
- Keep canonical JSON controlled and avoid serializing HTML on every keystroke.
- Debounce persistence and cancel stale network requests.
- Serve uploaded images at display-appropriate dimensions.
- Set performance budgets for initial JavaScript, editor initialization, typing
  latency, paste latency, and large-document interaction.
- Treat the full editor as an on-demand capability, not an application-shell
  dependency.

## Run locally

Requirements:

- Node.js 20 or later
- npm 10 or later

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

```text
http://127.0.0.1:5173/
```

Verify the production build:

```bash
npm run build
npm run preview
```

## Implemented functionality

### Document structure

- Paragraphs
- Heading levels 1 through 6
- Blockquotes
- Code blocks
- Horizontal dividers
- Bullet lists
- Numbered lists
- Nested task lists
- Tables
- Images
- Attachments
- Structured mentions and tags

The Playground starts with an empty paragraph and displays its guidance as a
true editor placeholder. The guidance disappears automatically when the user
starts typing and is not stored in the document JSON.

Heading shortcuts follow standard Markdown input rules. At the beginning of a
block, typing one to six hash characters followed by Space creates the
corresponding heading:

| Input at block start | Result |
| --- | --- |
| `# ` | Heading 1 |
| `## ` | Heading 2 |
| `### ` | Heading 3 |
| `#### ` | Heading 4 |
| `##### ` | Heading 5 |
| `###### ` | Heading 6 |

### Inline formatting

- Bold
- Italic
- Underline
- Strikethrough
- Highlight
- Selectable highlight background color
- Text color
- Tokenized font sizes
- Font-family foundation
- Inline code through Starter Kit
- Subscript
- Superscript
- Clear formatting

The demo exposes font sizes `12px`, `14px`, `16px`, `18px`, `20px`, `24px`, and
`32px`. Production Arvo implementations should map these choices to approved
design tokens instead of accepting arbitrary CSS values.

### Fixed toolbar

The fixed toolbar remains visible at the top of the editor and includes:

- Paragraph and H1–H6 selection
- Font-size selection
- Bold, italic, underline, strikethrough, highlight, and text color
- Clear formatting
- Bullet, numbered, and task lists
- Quote and code block
- Left, center, and right alignment
- Insert/edit link and remove link
- Image upload
- Table insertion
- Attachment upload
- Undo and redo
- Nova AI actions when an AI provider exists
- Product-provided toolbar extensions

Toolbar buttons prevent the editor selection from being lost when formatting is
applied. Arrow Left and Arrow Right move between enabled toolbar buttons; Home
and End move to the first and last buttons.

### Selection bubble toolbar

Selecting editable text opens a contextual toolbar above the selection. It
provides:

- Bold
- Italic
- Underline
- Highlight
- Highlight background color picker
- Insert, edit, or remove link

It stays hidden for collapsed selections, read-only content, and selected image
nodes. The toolbar is portaled to the document body and uses automatic flipping
and viewport shifting, preventing it from being clipped when a selection is near
the first line or an editor edge. All bubble-menu actions are also available
through persistent controls or keyboard shortcuts so the contextual toolbar is
not the only access path.

### Slash-command palette

Typing `/` at the beginning of a block opens a searchable insertion menu.

Built-in commands include:

- Text/paragraph
- Heading 1 through Heading 6
- Bullet list
- Numbered list
- Task list
- Quote
- Code block
- Divider
- Table

The menu searches command labels, descriptions, and keywords. It supports Arrow
Up, Arrow Down, Enter, Tab, and Escape. Products can add commands through
`slashCommandExtensions` without changing the editor core.

### Mentions with `@`

Typing `@` opens asynchronous entity suggestions supplied by a
`MentionProvider`. The same mechanism can represent more than users, including:

- Users
- Teams
- Workspaces
- Members
- Reports
- Tasks
- Scenarios
- Business objects

Selected mentions are stored as structured nodes with a stable `id`, display
`label`, and optional `entityType`. Product providers are responsible for
authentication, tenant isolation, permissions, searching, and result ranking.

### Tags with `#`

Tags and Markdown headings coexist through unambiguous rules:

- Hash characters followed by Space at the beginning of a block create a
  heading.
- One hash followed immediately by text opens tag suggestions.
- Tags always use a single `#`.

Examples:

```text
# Supply planning     → Heading 1
## Risks              → Heading 2
#SupplyRisk           → Structured tag
Review #NeedsReview   → Structured tag
```

Selected tags store stable IDs instead of saving only their visible label. This
supports future filtering, analytics, central renaming, permissions, and search.

### Links

The Link extension supports:

- Insert link
- Edit link
- Remove link
- Automatic URL detection
- Convert pasted URLs into links
- `http`, `https`, and `mailto` protocols
- Safe new-tab attributes (`noopener noreferrer`)
- `Cmd+K` on macOS and `Ctrl+K` on Windows/Linux to open the same link editor
  used by the toolbar and selection bubble menu

The demo uses a browser prompt for URL entry. Replace this with an Arvo popover
and validated form before production. The link action is centralized in
`openLinkEditor`, ensuring the toolbar button, bubble-toolbar button, and
keyboard shortcut always trigger identical behavior. A future Arvo Link Popover
can replace the temporary prompt without changing those three entry points.

### Images

Images can be added through:

- Toolbar upload
- Clipboard paste
- Drag and drop

Selecting an image opens an Arvo contextual image toolbar with:

- Left, center, and right positioning
- Caption editing
- Alternative-text editing
- Optional clickable-image hyperlink
- Image deletion

The image toolbar uses the same floating contextual surface as text selection;
it does not create a separate editor row. Text selection shows formatting and
text alignment, while image selection replaces those commands with image
alignment, Caption, Alt text, Link, and Delete. Alignment is intentionally
removed from the fixed toolbar to avoid duplicated controls.

Selected images display four resize handles directly on their corners. Dragging
a corner resizes the image between 20% and 100% of the available editor width.
This direct manipulation replaces the earlier toolbar slider.

Newly uploaded images are aligned left by default. Image presentation is stored
with the image node through `width`, `alignment`, `caption`, `alt`, and `href`
attributes, so it persists in versioned JSON and governed HTML output.

Supported demo MIME types are PNG, JPEG, WebP, and GIF. The upload provider
receives progress callbacks and returns an asset ID, URL, filename, MIME type,
size, and optional alt text. The returned image becomes a structured image node.

The included provider creates temporary browser object URLs. Production must
provide authenticated storage, upload validation, malware scanning, permission-
aware delivery URLs, retry/error UI, and a complete alternative-text workflow.

### Attachments

Attachments use a custom atomic Tiptap node and an `AttachmentProvider`.
Attachment data includes:

- Stable asset ID
- URL
- Filename
- MIME type
- File size

The node is draggable and renders as an accessible download link. Production
implementations must add file restrictions, upload scanning, authorization,
preview behavior, expiration handling, and deletion lifecycle management.

### Tables

The editor supports resizable tables and contextual table commands:

- Insert a 3×3 table with a header row
- Add column before or after
- Delete column
- Add row before or after
- Delete row
- Merge cells
- Split cells
- Toggle header row
- Delete table

Tiptap provides the table document behavior; Arvo owns the controls and styling.
Advanced spreadsheet functionality—formulas, filtering, pivoting, data binding,
or large datasets—belongs in an Arvo Grid rather than the Rich Editor.

### Markdown

The open-source Tiptap Markdown extension is enabled by default. The editor
supports Markdown typing shortcuts and Markdown export alongside JSON and HTML.

Rich editing remains the primary interaction. Versioned JSON is the canonical
format; Markdown is intended for import/export and compatible AI workflows.
Custom nodes such as mentions, tags, attachments, or future business blocks may
require explicit Markdown serializers and parsers to avoid losing metadata.

### Undo and redo

Undo and redo are supplied by the underlying editor history. They are available
from the toolbar and standard platform keyboard shortcuts.

### Character and word count

The footer displays:

- Word count
- Current character count
- Configured maximum character count

The default maximum is 50,000 characters. The demo uses 30,000. Product limits
should be selected according to each use case and enforced on the server as well
as in the editor.

### Read-only, disabled, and invalid states

The public API includes:

- `isReadOnly`: content is visible but not editable; editing toolbars are hidden.
- `isDisabled`: editing is disabled.
- `isInvalid`: applies invalid semantics and visual treatment.

The editor updates its editable state when these properties change. Production
forms should also provide visible labels, helper text, and associated validation
messages at the consuming-component level.

### Autosave

Autosave is optional and debounced. The footer announces `Saving…`, `Saved`, or
`Could not save` through a polite live region.

The configuration supports:

- Enable/disable
- Debounce delay
- Custom asynchronous save function
- Local-storage fallback for demonstrations

```tsx
autosave={{
  isEnabled: true,
  delay: 800,
  onSave: async (document) => {
    await documentsApi.save(documentId, document);
  },
}}
```

Autosave does not replace document versioning, conflict resolution, offline
recovery, or server validation. Those remain product/platform responsibilities.

### Nova AI provider

AI is provider-independent. Arvo does not require Tiptap's paid AI packages.

The current provider contract supports:

- Rewrite
- Summarize
- Shorten
- Expand
- Improve grammar
- Convert to bullets
- Translate

If text is selected, the output replaces that selection. With no selection, the
editor supplies the document text and inserts the result at the cursor.

```ts
const ai: AiProvider = {
  async transform({ action, text, signal }) {
    const response = await nova.transform({ action, text, signal });
    return response.text;
  },
};
```

Production AI integration must add cancellation, loading and error UI, schema
validation, safe insertion, permission controls, audit events, and preferably an
accept/reject experience for destructive transformations.

### Export

The demo footer can download:

- Versioned Arvo JSON
- HTML
- Markdown

Browser-side downloads demonstrate serialization only. Product applications may
hide these actions and connect export to governed backend services.

## Public component API

```tsx
<ArvoRichEditor
  value={document}
  onChange={setDocument}
  variant="advanced"
  placeholder="Start writing, or type / for commands"
  isDisabled={false}
  isReadOnly={false}
  isInvalid={false}
  maxLength={30000}
  features={{
    hasFixedToolbar: true,
    hasBubbleToolbar: true,
    hasSlashCommands: true,
    hasMentions: true,
    hasTags: true,
    hasImages: true,
    hasTables: true,
    hasLinks: true,
    hasAttachments: true,
    hasMarkdown: true,
    hasCharacterCount: true,
    hasAI: true,
  }}
  providers={{
    mentions,
    tags,
    images,
    attachments,
    ai: novaAiProvider,
  }}
  autosave={{
    isEnabled: true,
    delay: 800,
    onSave: saveDocument,
  }}
  toolbarExtensions={toolbarExtensions}
  slashCommandExtensions={slashCommands}
  customShortcuts={shortcuts}
/>
```

### Variants

| Variant | Intended use |
| --- | --- |
| `basic` | Comments, short notes, and descriptions |
| `standard` | Workflows, task descriptions, and documentation |
| `advanced` | Long-form and structured enterprise authoring |

Variants currently adjust presentation/minimum height. Product presets should
eventually provide governed feature sets so consumers do not need to configure
every capability individually.

### Feature flags

`ArvoRichEditorFeatures` controls the presence of major capabilities. All are
enabled by default in this reference implementation.

Feature flags control the extension or visible UI in the main editor. Any new
feature must ensure that hidden actions cannot still be reached through another
toolbar, shortcut, paste path, or command.

## Versioned document format

The canonical source of truth is versioned JSON:

```json
{
  "schema": "arvo-rich-editor",
  "schemaVersion": "1.0.0",
  "document": {
    "type": "doc",
    "content": []
  }
}
```

Recommended format responsibilities:

| Format | Responsibility |
| --- | --- |
| Versioned JSON | Canonical storage, editing, and migration |
| HTML | Governed rendering and interoperability |
| Markdown | Import/export and compatible AI workflows |
| Plain text | Search indexing, notifications, and previews |

Do not store HTML as the only source of truth. Server applications must validate
incoming JSON against the approved Arvo schema and reject unsupported nodes,
marks, attributes, excessive depth, or unsafe URLs.

## Provider contracts

### Mention and tag providers

```ts
interface MentionProvider {
  search(query: string): Promise<SuggestionEntity[]>;
}

interface TagProvider {
  search(query: string): Promise<SuggestionEntity[]>;
}
```

Providers should debounce or cancel stale requests, enforce tenant boundaries,
and return only entities the current user may discover and reference.

### Image provider

```ts
const images: ImageProvider = {
  async upload(file, onProgress) {
    const result = await o9Assets.upload(file, { onProgress });
    return {
      id: result.id,
      url: result.secureUrl,
      name: result.name,
      mimeType: result.mimeType,
      size: result.size,
      alt: result.alt,
    };
  },
};
```

### Attachment provider

The attachment provider follows the same upload result contract as images. It
should return a stable asset ID rather than treating the delivery URL as the
identity of the attachment.

## Extend without forking

All product-specific behavior must use a documented Arvo registry, provider, or
approved extension. Direct product access to the internal Tiptap instance should
not become part of the supported public contract.

### Add a toolbar action

```tsx
toolbarExtensions={[
  {
    id: "insert-kpi",
    group: "insert",
    label: "KPI",
    ariaLabel: "Insert KPI reference",
    run: ({ editor }) =>
      editor.chain().focus().insertContent("KPI: Inventory Turnover").run(),
  },
]}
```

Toolbar extensions can provide active and enabled predicates. Every added action
must have an accessible name and an equivalent keyboard path where appropriate.

### Add a slash command

```tsx
slashCommandExtensions={[
  {
    id: "risk-summary",
    label: "Risk summary",
    description: "Insert a risk summary template",
    group: "o9",
    keywords: ["risk", "template"],
    run: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Risk summary" }],
        })
        .run(),
  },
]}
```

Prefer structured JSON content over inserting arbitrary HTML from commands.

### Add a keyboard shortcut

```tsx
customShortcuts={[
  {
    id: "insert-callout",
    keys: "Mod-Shift-8",
    label: "Insert callout",
    run: ({ editor }) => editor.chain().focus().toggleBlockquote().run(),
  },
]}
```

Shortcut registration must check for platform conflicts, browser conflicts,
localization, screen-reader behavior, and collisions with existing editor
commands. User-facing documentation must list every supported shortcut.

### Add a custom node or mark

Custom document structures should be implemented in the Arvo editor package,
not inside a consuming product. Each new node or mark requires:

- Stable schema name
- Typed attributes
- Default values
- Parse and render rules
- Keyboard behavior
- Selection behavior
- Read-only rendering
- Copy/paste behavior
- JSON, HTML, Markdown, and plain-text handling
- Accessibility semantics
- Migration strategy
- Unit and integration tests
- Security and licensing review

## Keyboard behavior

The underlying editor supplies common platform shortcuts, including:

| Action | Shortcut |
| --- | --- |
| Bold | Ctrl/Cmd+B |
| Italic | Ctrl/Cmd+I |
| Underline | Ctrl/Cmd+U |
| Insert or edit link | Ctrl/Cmd+K |
| Undo | Ctrl/Cmd+Z |
| Redo | Ctrl/Cmd+Shift+Z |
| Open slash commands | `/` at block start |
| Open mentions | `@` |
| Open tag suggestions | `#` followed by text |
| Close suggestion menu | Escape |
| Navigate suggestions | Arrow Up/Down |
| Choose suggestion | Enter or Tab |

The toolbar supports Arrow Left/Right plus Home/End. A production accessibility
review should finalize roving-tabindex behavior and focus return after actions.

## Accessibility baseline

The reference implementation includes:

- Programmatic textbox role and multiline semantics
- Editor accessible name
- Invalid-state semantics
- Named toolbar groups and buttons
- Pressed state for toggled formatting
- Keyboard navigation in toolbars and suggestion menus
- Listbox and option semantics for suggestions
- Live announcements for upload and save status
- Visible focus indicators
- Forced-colors support
- Reduced-motion support
- Read-only behavior

Before release, validate WCAG 2.2 AA with keyboard-only operation, browser zoom,
high contrast, reduced motion, and supported screen-reader/browser combinations.
Pay particular attention to focus restoration, selection announcements, table
navigation, image alt-text entry, async suggestion loading, error messages, and
mobile virtual keyboards.

## Paste and content security

Pasted HTML is sanitized client-side with DOMPurify. The current policy forbids:

- `script`
- `iframe`
- `object`
- `embed`
- Inline style attributes
- Common inline event handlers

Client sanitization is defense in depth, not a security boundary. Production
must sanitize and validate content again on the server.

Required production controls:

- Validate documents against an allowlisted schema.
- Restrict allowed URL protocols and embed domains.
- Prevent `javascript:` and unsafe data URLs.
- Validate file extension, MIME type, size, and actual file signature.
- Scan uploads for malware.
- Use authenticated and permission-aware asset URLs.
- Enforce tenant and entity permissions for mentions and tags.
- Limit document size, node count, table dimensions, and nesting depth.
- Never insert untrusted or AI-generated HTML without validation.
- Apply Content Security Policy.
- Log migrations and security-sensitive extension changes.

## Licensing and dependency governance

The reference dependency list uses public Tiptap packages. Tiptap's open-source
core is MIT licensed, but the final legal decision must be based on the exact
package versions resolved by the production lockfile.

Before adoption:

1. Verify the license distributed with every exact direct and transitive package.
2. Preserve required MIT copyright and license notices.
3. Add Tiptap, ProseMirror, React, DOMPurify, Tippy.js, Lucide, and all other
   resolved dependencies to the third-party notices inventory.
4. Run software-composition analysis and vulnerability scanning in CI.
5. Pin reviewed versions and perform controlled upgrades.
6. Review every new editor extension independently.
7. Deny private-registry or commercial packages by default.

This repository intentionally does not use:

- Tiptap Cloud document storage
- Hosted collaboration
- Tiptap Comments
- Tracked Changes
- Pages
- Paid conversion services
- Tiptap AI Toolkit
- Private Tiptap registries

Any commercial Tiptap capability requires Architecture, Security, Legal,
Procurement, and privacy approval before it enters the Arvo baseline.

Use [THIRD_PARTY_NOTICES.template.md](./THIRD_PARTY_NOTICES.template.md) only as
a starting point. It is not a final legal notice.

## Open-source baseline versus platform services

| Capability | Baseline approach |
| --- | --- |
| Rich editing | Public Tiptap extensions |
| Toolbar and menus | Built and owned by Arvo |
| Mentions and tags | Arvo providers and APIs |
| Images and attachments | o9 asset service |
| Autosave | o9 document service |
| AI writing | Nova provider |
| Version snapshots | o9 document infrastructure |
| Real-time collaboration | Separate platform decision |
| Comments | Separate platform/product capability |
| Tracked changes | Excluded from baseline |
| DOCX conversion | Separate governed conversion service |

## Current repository structure

```text
src/
├── App.tsx
├── editor/
│   ├── ArvoRichEditor.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── Toolbar.tsx
│   │   ├── BubbleToolbar.tsx
│   │   └── TableControls.tsx
│   ├── extensions/
│   │   ├── Attachment.ts
│   │   ├── CustomShortcuts.ts
│   │   ├── FontSize.ts
│   │   ├── SlashCommands.tsx
│   │   ├── createEntityMention.ts
│   │   └── suggestionRenderer.tsx
│   └── providers/
│       └── demoProviders.ts
└── styles/
    └── arvo-rich-editor.css
```

## Production work still required

The reference implementation demonstrates the desired boundaries and core
interactions. Before shipping it as an Arvo component, complete the following:

### Product integration

- Replace browser object URLs with the authenticated o9 asset service.
- Replace local-storage autosave with the o9 document service.
- Connect the AI provider to Nova.
- Connect authenticated mention and tag providers.
- Add permission-aware product entity rendering and navigation.
- Replace browser prompts with Arvo popovers and forms.

### Reliability and data

- Add schema validation and migrations.
- Add save retry, conflict resolution, and recovery.
- Define offline behavior.
- Handle expired/deleted assets and entities.
- Add error boundaries and actionable error states.
- Define analytics and audit events.

### UX and accessibility

- Implement the final Arvo visual design and tokens.
- Complete image resize, alignment, caption, and alt-text controls.
- Add attachment progress, retry, replace, preview, and remove controls.
- Add table overflow behavior and a polished contextual menu.
- Add loading, empty, error, and permission states to suggestions.
- Add localization, RTL support, and screen-reader verification.
- Validate responsive behavior and touch interactions.

### Engineering quality

- Add Vitest and Testing Library unit/integration tests.
- Add axe-core automated accessibility checks.
- Add Playwright browser tests.
- Test supported browsers and screen readers.
- Add performance budgets and large-document tests.
- Add dependency/license scanning and controlled upgrade automation.
- Code-split large optional capabilities to reduce the current bundle size.

## Testing checklist

At minimum, verify:

- Every formatting command applies and can be undone/redone.
- H1–H6 Markdown shortcuts do not conflict with tags.
- Mention/tag/slash menus support mouse and keyboard input.
- Async results do not display stale responses.
- Read-only and disabled modes prevent all mutation paths.
- Feature flags remove the related UI and behavior.
- Pasted content is sanitized without losing approved structure.
- Upload progress, failure, retry, and cancellation are understandable.
- Versioned JSON round-trips without losing attributes.
- HTML and Markdown exports document known fidelity limits.
- Autosave does not save stale content out of order.
- Custom extensions cannot introduce duplicate IDs or shortcut collisions.
- Tables remain usable at narrow widths and high zoom.
- Focus is visible and reliably restored after menus close.
- All actions have accessible names and keyboard paths.
- Large documents remain within performance budgets.

## Scope boundary

Arvo Rich Editor is for rich enterprise documents, descriptions, comments,
notes, knowledge content, and structured authoring. It is not intended to become
a spreadsheet, IDE, whiteboard, diagram tool, presentation builder, or BI
canvas.

Code editing remains a separate **Arvo Code Editor** built on Monaco. Complex
tabular data belongs in **Arvo Grid**. Keeping these components separate avoids
forcing incompatible editing models into one interface.

## Codex development rules

See [CODEX_PROMPT.md](./CODEX_PROMPT.md) for the implementation constraints
that should be followed when extending this repository.
