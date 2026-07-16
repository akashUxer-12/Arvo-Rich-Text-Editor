# Codex implementation prompt

Use this repository as the baseline for Arvo Rich Editor.

## Rules

1. Keep Tiptap behind the `ArvoRichEditor` abstraction.
2. Do not add private Tiptap registry packages.
3. Do not add Tiptap Cloud, Comments, Tracked Changes, Pages, Conversion or AI
   Toolkit without explicit approval.
4. Follow Arvo property conventions:
   - `is*` for state or capability
   - `has*` for feature presence
   - enums for three or more choices
   - `on*` for callbacks
5. Keep versioned JSON as the canonical data format.
6. New functionality must be added through an extension registry, provider or
   approved Arvo extension.
7. Preserve keyboard access and screen-reader semantics.
8. Do not add toolbar actions that are unavailable by keyboard.
9. Sanitize imported content and validate it again on the server.
10. Add tests for every new command, node, mark, provider and migration.
11. Product code imports the production entry from `src/editor/index.ts`; it
    must not import the full `ArvoRichEditor.tsx` implementation directly.
12. Preserve the lazy boundary between `ArvoBasicEditor` and the full editor.
    Do not add advanced extension imports to the basic editor.
13. Every production build must start from a clean `dist` directory and keep
    individual client chunks below the approved bundle budget.

## Next production tasks

- Replace demo uploads with o9 asset service.
- Replace localStorage autosave with the o9 document service.
- Connect `AiProvider` to Nova.
- Add authenticated mention and tag providers.
- Add schema validation and migration.
- Add Vitest, Testing Library, axe-core and Playwright.
- Add localization and RTL.
- Add usage analytics hooks.
- Add image alt-text workflow before upload completion.
- Replace browser prompts with Arvo Popover and form components.
