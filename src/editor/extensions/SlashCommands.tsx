import { Extension, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import type { SlashCommandExtension } from "../types";
import { createSuggestionRenderer } from "./suggestionRenderer";

const SlashPluginKey = new PluginKey("arvoSlashCommands");

export const SlashCommands = Extension.create<{
  commands: SlashCommandExtension[];
}>({
  name: "arvoSlashCommands",

  addOptions() {
    return { commands: [] };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: SlashPluginKey,
        char: "/",
        startOfLine: true,
        allowSpaces: true,
        items: ({ query }) => {
          const normalized = query.toLowerCase();
          return this.options.commands
            .filter((command) =>
              [command.label, command.description ?? "", ...(command.keywords ?? [])]
                .join(" ")
                .toLowerCase()
                .includes(normalized),
            )
            .map((command) => ({
              id: command.id,
              label: command.label,
              description: command.description,
              command,
            }));
        },
        command: ({ editor, range, props }) =>
          props.command.run({ editor, range: range as Range }),
        render: createSuggestionRenderer({ emptyLabel: "No commands found" }),
      }),
    ];
  },
});
