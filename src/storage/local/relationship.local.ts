import { db, type LocalRelationship } from "./db";
import type {
  Relationship,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from "@/repositories/types";
import type { RelationshipRepository } from "@/repositories/relationship.repository";

function toRelationship(local: LocalRelationship): Relationship {
  return {
    id: local.id,
    projectId: local.projectId,
    fromCharacterId: local.fromCharacterId,
    toCharacterId: local.toCharacterId,
    type: local.type,
    description: local.description,
    bidirectional: local.bidirectional,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

async function isGuestProject(projectId: string): Promise<boolean> {
  const project = await db.projects.get(projectId);
  return project?.guestId != null;
}

export class RelationshipLocalRepository implements RelationshipRepository {
  async getById(id: string): Promise<Relationship | null> {
    const local = await db.relationships.get(id);
    if (!local) {
      return null;
    }
    return toRelationship(local);
  }

  async getByProjectId(projectId: string): Promise<Relationship[]> {
    const locals = await db.relationships
      .where("projectId")
      .equals(projectId)
      .toArray();
    return locals.map(toRelationship);
  }

  async getByCharacterId(characterId: string): Promise<Relationship[]> {
    const fromRelations = await db.relationships
      .where("fromCharacterId")
      .equals(characterId)
      .toArray();

    const toRelations = await db.relationships
      .where("toCharacterId")
      .equals(characterId)
      .toArray();

    // Combine and deduplicate by id
    const allRelations = [...fromRelations, ...toRelations];
    const uniqueRelations = Array.from(
      new Map(allRelations.map((r) => [r.id, r])).values()
    );

    return uniqueRelations.map(toRelationship);
  }

  async create(data: CreateRelationshipInput): Promise<Relationship> {
    const now = new Date();
    const isGuest = await isGuestProject(data.projectId);

    const local: LocalRelationship = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      fromCharacterId: data.fromCharacterId,
      toCharacterId: data.toCharacterId,
      type: data.type,
      description: data.description ?? null,
      bidirectional: data.bidirectional,
      createdAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
      lastSyncedAt: null,
    };

    await db.relationships.add(local);
    await db.projects.update(data.projectId, { updatedAt: now });

    return toRelationship(local);
  }

  async update(id: string, data: UpdateRelationshipInput): Promise<Relationship> {
    const existing = await db.relationships.get(id);
    if (!existing) {
      throw new Error(`Relationship not found: ${id}`);
    }

    const now = new Date();
    const isGuest = await isGuestProject(existing.projectId);

    const updated: LocalRelationship = {
      ...existing,
      ...data,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    };

    await db.relationships.put(updated);
    await db.projects.update(existing.projectId, { updatedAt: now });

    return toRelationship(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.relationships.get(id);
    if (!existing) {
      return;
    }

    await db.relationships.delete(id);
    await db.projects.update(existing.projectId, { updatedAt: new Date() });
  }

  async deleteByCharacterId(characterId: string): Promise<void> {
    const relations = await this.getByCharacterId(characterId);
    const projectId = relations[0]?.projectId;

    await db.relationships
      .where("fromCharacterId")
      .equals(characterId)
      .or("toCharacterId")
      .equals(characterId)
      .delete();

    if (projectId) {
      await db.projects.update(projectId, { updatedAt: new Date() });
    }
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await db.relationships.where("projectId").equals(projectId).delete();
  }
}

export const relationshipLocalRepository = new RelationshipLocalRepository();
