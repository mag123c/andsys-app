import { db, type LocalChapter } from "./db";
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from "@/repositories/types";
import type { ChapterRepository } from "@/repositories/chapter.repository";
import { extractText, countCharacters } from "@/lib/content-utils";

function toChapter(local: LocalChapter): Chapter {
  return {
    id: local.id,
    projectId: local.projectId,
    title: local.title,
    content: local.content,
    contentText: local.contentText,
    wordCount: local.wordCount,
    order: local.order,
    status: local.status,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

async function isGuestProject(projectId: string): Promise<boolean> {
  const project = await db.projects.get(projectId);
  return project?.guestId != null;
}

export class ChapterLocalRepository implements ChapterRepository {
  async getById(id: string): Promise<Chapter | null> {
    const local = await db.chapters.get(id);
    if (!local) {
      return null;
    }
    return toChapter(local);
  }

  async getByProjectId(projectId: string): Promise<Chapter[]> {
    const locals = await db.chapters
      .where("[projectId+order]")
      .between([projectId, -Infinity], [projectId, Infinity])
      .toArray();
    return locals.map(toChapter);
  }

  async create(data: CreateChapterInput): Promise<Chapter> {
    const existingChapters = await this.getByProjectId(data.projectId);
    const maxOrder = existingChapters.reduce(
      (max, ch) => Math.max(max, ch.order),
      0
    );

    const content = data.content ?? { type: "doc", content: [] };
    const contentText = extractText(content);
    const now = new Date();
    const isGuest = await isGuestProject(data.projectId);

    const local: LocalChapter = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      title: data.title,
      content,
      contentText,
      wordCount: countCharacters(contentText),
      order: maxOrder + 1,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
      lastSyncedAt: null,
    };

    await db.chapters.add(local);
    await db.projects.update(data.projectId, { updatedAt: now });

    return toChapter(local);
  }

  async update(id: string, data: UpdateChapterInput): Promise<Chapter> {
    const existing = await db.chapters.get(id);
    if (!existing) {
      throw new Error(`Chapter not found: ${id}`);
    }

    const now = new Date();
    const isGuest = await isGuestProject(existing.projectId);

    const updated: LocalChapter = {
      ...existing,
      ...data,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    };

    if (data.content) {
      updated.contentText = extractText(data.content);
      updated.wordCount = countCharacters(updated.contentText);
    }

    await db.chapters.put(updated);
    await db.projects.update(existing.projectId, { updatedAt: now });

    return toChapter(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.chapters.get(id);
    if (!existing) {
      return;
    }

    await db.chapters.delete(id);
    await db.projects.update(existing.projectId, { updatedAt: new Date() });
  }

  async reorder(projectId: string, chapterIds: string[]): Promise<void> {
    const now = new Date();
    const isGuest = await isGuestProject(projectId);

    await db.transaction("rw", db.chapters, db.projects, async () => {
      for (let i = 0; i < chapterIds.length; i++) {
        await db.chapters.update(chapterIds[i], {
          order: i + 1,
          updatedAt: now,
          syncStatus: isGuest ? "synced" : "pending",
        });
      }
      await db.projects.update(projectId, { updatedAt: now });
    });
  }
}

export const chapterLocalRepository = new ChapterLocalRepository();
