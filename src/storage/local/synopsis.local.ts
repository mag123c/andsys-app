import { db, type LocalSynopsis } from "./db";
import type {
  Synopsis,
  CreateSynopsisInput,
  UpdateSynopsisInput,
} from "@/repositories/types";
import type { SynopsisRepository } from "@/repositories/synopsis.repository";
import { extractText, countCharacters } from "@/lib/content-utils";

function toSynopsis(local: LocalSynopsis): Synopsis {
  return {
    id: local.id,
    projectId: local.projectId,
    content: local.content,
    plainText: local.plainText,
    wordCount: local.wordCount,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

async function isGuestProject(projectId: string): Promise<boolean> {
  const project = await db.projects.get(projectId);
  return project?.guestId != null;
}

export class SynopsisLocalRepository implements SynopsisRepository {
  async getByProjectId(projectId: string): Promise<Synopsis | null> {
    const local = await db.synopses.where("projectId").equals(projectId).first();
    if (!local) {
      return null;
    }
    return toSynopsis(local);
  }

  async create(data: CreateSynopsisInput): Promise<Synopsis> {
    const content = data.content ?? { type: "doc", content: [] };
    const plainText = extractText(content);
    const now = new Date();
    const isGuest = await isGuestProject(data.projectId);

    const local: LocalSynopsis = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      content,
      plainText,
      wordCount: countCharacters(plainText),
      createdAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
      lastSyncedAt: null,
    };

    await db.synopses.add(local);
    await db.projects.update(data.projectId, { updatedAt: now });

    return toSynopsis(local);
  }

  async update(id: string, data: UpdateSynopsisInput): Promise<Synopsis> {
    const existing = await db.synopses.get(id);
    if (!existing) {
      throw new Error(`Synopsis not found: ${id}`);
    }

    const now = new Date();
    const isGuest = await isGuestProject(existing.projectId);

    const updated: LocalSynopsis = {
      ...existing,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    };

    if (data.content) {
      updated.content = data.content;
      updated.plainText = extractText(data.content);
      updated.wordCount = countCharacters(updated.plainText);
    }

    await db.synopses.put(updated);
    await db.projects.update(existing.projectId, { updatedAt: now });

    return toSynopsis(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.synopses.get(id);
    if (!existing) {
      return;
    }

    await db.synopses.delete(id);
    await db.projects.update(existing.projectId, { updatedAt: new Date() });
  }
}

export const synopsisLocalRepository = new SynopsisLocalRepository();
