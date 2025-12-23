import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  jsonContentToText,
  downloadAsText,
  copyToClipboard,
  exportChapterAsText,
  downloadAsJson,
} from "@/lib/export";
import type { JSONContent } from "@tiptap/core";

describe("export utilities", () => {
  describe("jsonContentToText", () => {
    it("should return empty string for null content", () => {
      expect(jsonContentToText(null)).toBe("");
      expect(jsonContentToText(undefined)).toBe("");
    });

    it("should return empty string for empty doc", () => {
      const content: JSONContent = { type: "doc", content: [] };
      expect(jsonContentToText(content)).toBe("");
    });

    it("should extract text from paragraph", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello World" }],
          },
        ],
      };
      expect(jsonContentToText(content)).toBe("Hello World");
    });

    it("should join multiple paragraphs with double newline", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "First paragraph" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Second paragraph" }],
          },
        ],
      };
      expect(jsonContentToText(content)).toBe(
        "First paragraph\n\nSecond paragraph"
      );
    });

    it("should handle hardBreak", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Line 1" },
              { type: "hardBreak" },
              { type: "text", text: "Line 2" },
            ],
          },
        ],
      };
      expect(jsonContentToText(content)).toBe("Line 1\nLine 2");
    });

    it("should handle nested content", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Normal " },
              {
                type: "text",
                text: "bold",
                marks: [{ type: "bold" }],
              },
              { type: "text", text: " text" },
            ],
          },
        ],
      };
      expect(jsonContentToText(content)).toBe("Normal bold text");
    });
  });

  describe("downloadAsText", () => {
    let createObjectURLMock: ReturnType<typeof vi.fn>;
    let revokeObjectURLMock: ReturnType<typeof vi.fn>;
    let clickMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURLMock = vi.fn().mockReturnValue("blob:test-url");
      revokeObjectURLMock = vi.fn();
      clickMock = vi.fn();

      global.URL.createObjectURL = createObjectURLMock;
      global.URL.revokeObjectURL = revokeObjectURLMock;

      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
    });

    it("should create and trigger download", () => {
      downloadAsText("test content", "test-file");

      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:test-url");
    });

    it("should add .txt extension if missing", () => {
      let downloadAttr = "";
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            set download(val: string) {
              downloadAttr = val;
            },
            get download() {
              return downloadAttr;
            },
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });

      downloadAsText("content", "filename");
      expect(downloadAttr).toBe("filename.txt");
    });

    it("should not duplicate .txt extension", () => {
      let downloadAttr = "";
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            set download(val: string) {
              downloadAttr = val;
            },
            get download() {
              return downloadAttr;
            },
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });

      downloadAsText("content", "filename.txt");
      expect(downloadAttr).toBe("filename.txt");
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text using clipboard API", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      const result = await copyToClipboard("test text");

      expect(writeTextMock).toHaveBeenCalledWith("test text");
      expect(result).toBe(true);
    });

    it("should return false when clipboard API fails and fallback fails", async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("Not allowed")),
        },
      });

      // Mock createElement to throw during fallback
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "textarea") {
          throw new Error("Cannot create textarea");
        }
        return originalCreateElement(tag);
      });

      const result = await copyToClipboard("test text");
      expect(result).toBe(false);
    });
  });

  describe("exportChapterAsText", () => {
    let clickMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      clickMock = vi.fn();
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      global.URL.revokeObjectURL = vi.fn();

      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            download: "",
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
    });

    it("should export chapter content as text file", () => {
      const content: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Chapter content" }],
          },
        ],
      };

      exportChapterAsText(content, "Chapter 1");
      expect(clickMock).toHaveBeenCalled();
    });

    it("should sanitize filename", () => {
      let downloadAttr = "";
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            set download(val: string) {
              downloadAttr = val;
            },
            get download() {
              return downloadAttr;
            },
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });

      exportChapterAsText(null, "Chapter/1:Test?");
      expect(downloadAttr).toBe("Chapter-1-Test-.txt");
    });
  });

  describe("downloadAsJson", () => {
    let clickMock: ReturnType<typeof vi.fn>;
    let downloadAttr: string;

    beforeEach(() => {
      clickMock = vi.fn();
      downloadAttr = "";
      global.URL.createObjectURL = vi.fn().mockReturnValue("blob:url");
      global.URL.revokeObjectURL = vi.fn();

      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        if (tag === "a") {
          return {
            href: "",
            set download(val: string) {
              downloadAttr = val;
            },
            get download() {
              return downloadAttr;
            },
            click: clickMock,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });
    });

    it("should download data as JSON file", () => {
      const data = { test: "value", number: 123 };
      downloadAsJson(data, "backup");

      expect(clickMock).toHaveBeenCalled();
      expect(downloadAttr).toBe("backup.json");
    });

    it("should not duplicate .json extension", () => {
      downloadAsJson({ data: true }, "backup.json");
      expect(downloadAttr).toBe("backup.json");
    });
  });
});
