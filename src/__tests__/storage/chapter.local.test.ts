import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/storage/local/db";
import { projectLocalRepository } from "@/storage/local/project.local";
import { chapterLocalRepository } from "@/storage/local/chapter.local";

describe("ChapterLocalRepository", () => {
  let projectId: string;

  beforeEach(async () => {
    await db.projects.clear();
    await db.chapters.clear();

    const project = await projectLocalRepository.create(
      { title: "Test Project" },
      { userId: "user-123" }
    );
    projectId = project.id;
  });

  describe("create", () => {
    it("should create a chapter with default content", async () => {
      const chapter = await chapterLocalRepository.create({
        projectId,
        title: "Chapter 1",
      });

      expect(chapter.title).toBe("Chapter 1");
      expect(chapter.projectId).toBe(projectId);
      expect(chapter.order).toBe(1);
      expect(chapter.status).toBe("draft");
      expect(chapter.wordCount).toBe(0);
      expect(chapter.content).toEqual({ type: "doc", content: [] });
    });

    it("should auto-increment order", async () => {
      const chapter1 = await chapterLocalRepository.create({
        projectId,
        title: "Chapter 1",
      });
      const chapter2 = await chapterLocalRepository.create({
        projectId,
        title: "Chapter 2",
      });
      const chapter3 = await chapterLocalRepository.create({
        projectId,
        title: "Chapter 3",
      });

      expect(chapter1.order).toBe(1);
      expect(chapter2.order).toBe(2);
      expect(chapter3.order).toBe(3);
    });

    it("should create with custom content", async () => {
      const content = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Hello World" }],
          },
        ],
      };

      const chapter = await chapterLocalRepository.create({
        projectId,
        title: "With Content",
        content,
      });

      expect(chapter.content).toEqual(content);
      // countWords는 공백 제외 글자수를 계산 (10 = "HelloWorld")
      expect(chapter.wordCount).toBe(10);
      expect(chapter.contentText).toBe("Hello World");
    });
  });

  describe("getById", () => {
    it("should return a chapter by id", async () => {
      const created = await chapterLocalRepository.create({
        projectId,
        title: "Find Me",
      });

      const found = await chapterLocalRepository.getById(created.id);

      expect(found).not.toBeNull();
      expect(found?.title).toBe("Find Me");
    });

    it("should return null for non-existent chapter", async () => {
      const found = await chapterLocalRepository.getById("non-existent");

      expect(found).toBeNull();
    });
  });

  describe("getByProjectId", () => {
    it("should return all chapters for a project ordered by order field", async () => {
      await chapterLocalRepository.create({ projectId, title: "Chapter 1" });
      await chapterLocalRepository.create({ projectId, title: "Chapter 2" });
      await chapterLocalRepository.create({ projectId, title: "Chapter 3" });

      const chapters = await chapterLocalRepository.getByProjectId(projectId);

      expect(chapters).toHaveLength(3);
      expect(chapters[0].title).toBe("Chapter 1");
      expect(chapters[1].title).toBe("Chapter 2");
      expect(chapters[2].title).toBe("Chapter 3");
    });

    it("should return empty array for project with no chapters", async () => {
      const chapters = await chapterLocalRepository.getByProjectId(projectId);

      expect(chapters).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update chapter title", async () => {
      const created = await chapterLocalRepository.create({
        projectId,
        title: "Original",
      });

      const updated = await chapterLocalRepository.update(created.id, {
        title: "Updated Title",
      });

      expect(updated.title).toBe("Updated Title");
    });

    it("should update content and recalculate wordCount", async () => {
      const created = await chapterLocalRepository.create({
        projectId,
        title: "Test",
      });

      const newContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "One two three four five" }],
          },
        ],
      };

      const updated = await chapterLocalRepository.update(created.id, {
        content: newContent,
      });

      expect(updated.content).toEqual(newContent);
      // countWords는 공백 제외 글자수 (19 = "Onetwothreefourfive")
      expect(updated.wordCount).toBe(19);
    });

    it("should throw error for non-existent chapter", async () => {
      await expect(
        chapterLocalRepository.update("non-existent", { title: "New" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should delete a chapter", async () => {
      const created = await chapterLocalRepository.create({
        projectId,
        title: "To Delete",
      });

      await chapterLocalRepository.delete(created.id);

      const found = await chapterLocalRepository.getById(created.id);
      expect(found).toBeNull();
    });

    it("should not throw for non-existent chapter", async () => {
      await expect(chapterLocalRepository.delete("non-existent")).resolves.not.toThrow();
    });
  });

  describe("reorder", () => {
    it("should reorder chapters", async () => {
      const ch1 = await chapterLocalRepository.create({ projectId, title: "Chapter 1" });
      const ch2 = await chapterLocalRepository.create({ projectId, title: "Chapter 2" });
      const ch3 = await chapterLocalRepository.create({ projectId, title: "Chapter 3" });

      // Reorder: 3, 1, 2
      await chapterLocalRepository.reorder(projectId, [ch3.id, ch1.id, ch2.id]);

      const chapters = await chapterLocalRepository.getByProjectId(projectId);

      expect(chapters[0].id).toBe(ch3.id);
      expect(chapters[0].order).toBe(1);
      expect(chapters[1].id).toBe(ch1.id);
      expect(chapters[1].order).toBe(2);
      expect(chapters[2].id).toBe(ch2.id);
      expect(chapters[2].order).toBe(3);
    });
  });
});
