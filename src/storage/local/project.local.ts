import { db, type LocalProject } from "./db";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/repositories/types";
import type { ProjectRepository } from "@/repositories/project.repository";

function toProject(local: LocalProject): Project {
  return {
    id: local.id,
    userId: local.userId,
    guestId: local.guestId,
    title: local.title,
    description: local.description,
    genre: local.genre,
    coverImageUrl: local.coverImageBase64 ?? local.coverImageUrl ?? null,
    status: local.status,
    deletedAt: local.deletedAt,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export class ProjectLocalRepository implements ProjectRepository {
  async getById(id: string): Promise<Project | null> {
    const local = await db.projects.get(id);
    if (!local || local.status === "deleted") {
      return null;
    }
    return toProject(local);
  }

  async getByUserId(userId: string): Promise<Project[]> {
    const locals = await db.projects
      .where("userId")
      .equals(userId)
      .filter((p) => p.status !== "deleted")
      .sortBy("updatedAt");
    return locals.map(toProject).reverse();
  }

  async getByGuestId(guestId: string): Promise<Project[]> {
    const locals = await db.projects
      .where("guestId")
      .equals(guestId)
      .filter((p) => p.status !== "deleted")
      .sortBy("updatedAt");
    return locals.map(toProject).reverse();
  }

  async create(
    data: CreateProjectInput,
    owner: { userId: string } | { guestId: string }
  ): Promise<Project> {
    const now = new Date();
    const isGuest = "guestId" in owner;

    const local: LocalProject = {
      id: crypto.randomUUID(),
      userId: isGuest ? null : owner.userId,
      guestId: isGuest ? owner.guestId : null,
      title: data.title,
      description: data.description ?? null,
      genre: data.genre ?? null,
      coverImageUrl: null,
      coverImageBase64: null,
      status: "active",
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
      lastSyncedAt: null,
    };

    await db.projects.add(local);
    return toProject(local);
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const existing = await db.projects.get(id);
    if (!existing) {
      throw new Error(`Project not found: ${id}`);
    }

    const isGuest = existing.guestId !== null;

    // Handle cover image: store as base64 locally
    const { coverImageUrl, ...rest } = data;
    const coverImageUpdate =
      coverImageUrl !== undefined
        ? { coverImageBase64: coverImageUrl }
        : {};

    const updated: LocalProject = {
      ...existing,
      ...rest,
      ...coverImageUpdate,
      updatedAt: new Date(),
      syncStatus: isGuest ? "synced" : "pending",
    };

    await db.projects.put(updated);
    return toProject(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.projects.get(id);
    if (!existing) {
      return;
    }

    const isGuest = existing.guestId !== null;
    const now = new Date();

    await db.projects.update(id, {
      status: "deleted",
      deletedAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    });
  }
}

export const projectLocalRepository = new ProjectLocalRepository();
