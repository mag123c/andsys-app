import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/storage/local/db";
import { syncQueue } from "@/sync/sync-queue";

describe("SyncQueue", () => {
  beforeEach(async () => {
    await db.syncQueue.clear();
  });

  describe("enqueue", () => {
    it("should add a new item to the queue", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: { title: "Test Project" },
      });

      const count = await syncQueue.count();
      expect(count).toBe(1);
    });

    it("should update existing item with same entityId", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: { title: "Original" },
      });

      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "update",
        payload: { title: "Updated" },
      });

      const count = await syncQueue.count();
      expect(count).toBe(1);

      const item = await syncQueue.dequeue();
      // create + update = create (payload updated)
      expect(item?.operation).toBe("create");
      expect(item?.payload).toEqual({ title: "Updated" });
    });

    it("should remove item when create + delete", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: { title: "Will Delete" },
      });

      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "delete",
        payload: null,
      });

      const count = await syncQueue.count();
      expect(count).toBe(0);
    });

    it("should handle update + delete", async () => {
      await syncQueue.enqueue({
        entityType: "chapter",
        entityId: "ch-1",
        operation: "update",
        payload: { title: "Updated Chapter" },
      });

      await syncQueue.enqueue({
        entityType: "chapter",
        entityId: "ch-1",
        operation: "delete",
        payload: null,
      });

      const count = await syncQueue.count();
      expect(count).toBe(1);

      const item = await syncQueue.dequeue();
      expect(item?.operation).toBe("delete");
    });
  });

  describe("dequeue", () => {
    it("should return null when queue is empty", async () => {
      const item = await syncQueue.dequeue();
      expect(item).toBeNull();
    });

    it("should return items in FIFO order", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "first",
        operation: "create",
        payload: {},
      });
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "second",
        operation: "create",
        payload: {},
      });

      const first = await syncQueue.dequeue();
      expect(first?.entityId).toBe("first");
    });

    it("should not return items with max attempts", async () => {
      // Add item directly with max attempts
      await db.syncQueue.add({
        entityType: "project",
        entityId: "failed",
        operation: "create",
        payload: {},
        attempts: 5,
        lastAttemptAt: new Date(),
        createdAt: new Date(),
      });

      const item = await syncQueue.dequeue();
      expect(item).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return all pending items", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: {},
      });
      await syncQueue.enqueue({
        entityType: "chapter",
        entityId: "ch-1",
        operation: "update",
        payload: {},
      });

      const items = await syncQueue.getAll();
      expect(items).toHaveLength(2);
    });
  });

  describe("complete", () => {
    it("should remove item from queue", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: {},
      });

      const item = await syncQueue.dequeue();
      await syncQueue.complete(item!.id!);

      const count = await syncQueue.count();
      expect(count).toBe(0);
    });
  });

  describe("fail", () => {
    it("should increment attempts count", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: {},
      });

      const item = await syncQueue.dequeue();
      await syncQueue.fail(item!.id!);

      const updated = await db.syncQueue.get(item!.id!);
      expect(updated?.attempts).toBe(1);
      expect(updated?.lastAttemptAt).not.toBeNull();
    });
  });

  describe("removeByEntity", () => {
    it("should remove specific entity from queue", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: {},
      });
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-2",
        operation: "create",
        payload: {},
      });

      await syncQueue.removeByEntity("project", "proj-1");

      const count = await syncQueue.count();
      expect(count).toBe(1);

      const item = await syncQueue.dequeue();
      expect(item?.entityId).toBe("proj-2");
    });
  });

  describe("clear", () => {
    it("should remove all items from queue", async () => {
      await syncQueue.enqueue({
        entityType: "project",
        entityId: "proj-1",
        operation: "create",
        payload: {},
      });
      await syncQueue.enqueue({
        entityType: "chapter",
        entityId: "ch-1",
        operation: "update",
        payload: {},
      });

      await syncQueue.clear();

      const count = await syncQueue.count();
      expect(count).toBe(0);
    });
  });
});
