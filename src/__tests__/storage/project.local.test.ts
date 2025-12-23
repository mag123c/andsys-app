import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/storage/local/db";
import { projectLocalRepository } from "@/storage/local/project.local";

describe("ProjectLocalRepository", () => {
  beforeEach(async () => {
    await db.projects.clear();
    await db.chapters.clear();
  });

  describe("create", () => {
    it("should create a project with userId", async () => {
      const project = await projectLocalRepository.create(
        { title: "Test Project" },
        { userId: "user-123" }
      );

      expect(project.title).toBe("Test Project");
      expect(project.userId).toBe("user-123");
      expect(project.guestId).toBeNull();
      expect(project.status).toBe("active");
      expect(project.id).toBeDefined();
    });

    it("should create a project with guestId", async () => {
      const project = await projectLocalRepository.create(
        { title: "Guest Project", description: "A description", genre: "Fantasy" },
        { guestId: "guest-456" }
      );

      expect(project.title).toBe("Guest Project");
      expect(project.description).toBe("A description");
      expect(project.genre).toBe("Fantasy");
      expect(project.userId).toBeNull();
      expect(project.guestId).toBe("guest-456");
    });
  });

  describe("getById", () => {
    it("should return a project by id", async () => {
      const created = await projectLocalRepository.create(
        { title: "Find Me" },
        { userId: "user-123" }
      );

      const found = await projectLocalRepository.getById(created.id);

      expect(found).not.toBeNull();
      expect(found?.title).toBe("Find Me");
    });

    it("should return null for non-existent project", async () => {
      const found = await projectLocalRepository.getById("non-existent");

      expect(found).toBeNull();
    });

    it("should return null for deleted project", async () => {
      const created = await projectLocalRepository.create(
        { title: "Delete Me" },
        { userId: "user-123" }
      );
      await projectLocalRepository.delete(created.id);

      const found = await projectLocalRepository.getById(created.id);

      expect(found).toBeNull();
    });
  });

  describe("getByUserId", () => {
    it("should return all projects for a user", async () => {
      await projectLocalRepository.create({ title: "Project 1" }, { userId: "user-123" });
      await projectLocalRepository.create({ title: "Project 2" }, { userId: "user-123" });
      await projectLocalRepository.create({ title: "Other Project" }, { userId: "other-user" });

      const projects = await projectLocalRepository.getByUserId("user-123");

      expect(projects).toHaveLength(2);
      expect(projects.map((p) => p.title)).toContain("Project 1");
      expect(projects.map((p) => p.title)).toContain("Project 2");
    });

    it("should not return deleted projects", async () => {
      const project = await projectLocalRepository.create(
        { title: "Will Delete" },
        { userId: "user-123" }
      );
      await projectLocalRepository.delete(project.id);

      const projects = await projectLocalRepository.getByUserId("user-123");

      expect(projects).toHaveLength(0);
    });
  });

  describe("getByGuestId", () => {
    it("should return all projects for a guest", async () => {
      await projectLocalRepository.create({ title: "Guest Project 1" }, { guestId: "guest-123" });
      await projectLocalRepository.create({ title: "Guest Project 2" }, { guestId: "guest-123" });

      const projects = await projectLocalRepository.getByGuestId("guest-123");

      expect(projects).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("should update project fields", async () => {
      const created = await projectLocalRepository.create(
        { title: "Original" },
        { userId: "user-123" }
      );

      const updated = await projectLocalRepository.update(created.id, {
        title: "Updated Title",
        description: "New description",
      });

      expect(updated.title).toBe("Updated Title");
      expect(updated.description).toBe("New description");
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });

    it("should throw error for non-existent project", async () => {
      await expect(
        projectLocalRepository.update("non-existent", { title: "New" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("should soft delete a project", async () => {
      const created = await projectLocalRepository.create(
        { title: "To Delete" },
        { userId: "user-123" }
      );

      await projectLocalRepository.delete(created.id);

      const found = await projectLocalRepository.getById(created.id);
      expect(found).toBeNull();

      // Verify it's soft deleted in DB
      const raw = await db.projects.get(created.id);
      expect(raw?.status).toBe("deleted");
      expect(raw?.deletedAt).not.toBeNull();
    });

    it("should not throw for non-existent project", async () => {
      await expect(projectLocalRepository.delete("non-existent")).resolves.not.toThrow();
    });
  });
});
