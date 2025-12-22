import {
  TiptapUnderline,
  StarterKit,
  Placeholder,
} from "novel";

export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc list-outside leading-3 -mt-2",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal list-outside leading-3 -mt-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal -mb-2",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-primary",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class:
          "rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium",
      },
    },
    code: {
      HTMLAttributes: {
        class:
          "rounded-md bg-muted px-1.5 py-1 font-mono font-medium",
        spellcheck: "false",
      },
    },
    horizontalRule: false,
    dropcursor: {
      color: "#DBEAFE",
      width: 4,
    },
    gapcursor: false,
  }),
  Placeholder.configure({
    placeholder: "글을 작성하세요...",
    includeChildren: true,
  }),
  TiptapUnderline,
];
