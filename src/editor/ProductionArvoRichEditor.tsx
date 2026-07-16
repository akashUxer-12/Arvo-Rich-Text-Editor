import { lazy, Suspense } from "react";
import type { ArvoRichEditorProps } from "./ArvoRichEditor";

const BasicEditor = lazy(() =>
  import("./ArvoBasicEditor").then((module) => ({ default: module.ArvoBasicEditor })),
);

const FullEditor = lazy(() =>
  import("./ArvoRichEditor").then((module) => ({ default: module.ArvoRichEditor })),
);

const advancedFeatures = [
  "hasSlashCommands",
  "hasMentions",
  "hasTags",
  "hasImages",
  "hasTables",
  "hasAttachments",
  "hasMarkdown",
  "hasAI",
] as const;

export function ProductionArvoRichEditor(props: ArvoRichEditorProps) {
  const requestsAdvancedFeature = advancedFeatures.some(
    (feature) => props.features?.[feature] === true,
  );
  const useBasic = props.variant === "basic" && !requestsAdvancedFeature;

  return (
    <Suspense fallback={<div className="arvo-editor-loading">Loading editor…</div>}>
      {useBasic ? <BasicEditor {...props} /> : <FullEditor {...props} />}
    </Suspense>
  );
}

export type { ArvoRichEditorProps } from "./ArvoRichEditor";
