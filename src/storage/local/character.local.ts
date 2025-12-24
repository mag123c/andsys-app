import { db, type LocalCharacter } from "./db";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import type { CharacterRepository } from "@/repositories/character.repository";

function toCharacter(local: LocalCharacter): Character {
  return {
    id: local.id,
    projectId: local.projectId,
    name: local.name,
    nickname: local.nickname,
    age: local.age,
    gender: local.gender,
    race: local.race,
    imageUrl: local.imageBase64 ?? local.imageUrl ?? null,
    order: local.order,
    height: local.height,
    weight: local.weight,
    appearance: local.appearance,
    mbti: local.mbti,
    personality: local.personality,
    education: local.education,
    occupation: local.occupation,
    affiliation: local.affiliation,
    background: local.background,
    customFields: local.customFields,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

async function isGuestProject(projectId: string): Promise<boolean> {
  const project = await db.projects.get(projectId);
  return project?.guestId != null;
}

export class CharacterLocalRepository implements CharacterRepository {
  async getById(id: string): Promise<Character | null> {
    const local = await db.characters.get(id);
    if (!local) {
      return null;
    }
    return toCharacter(local);
  }

  async getByProjectId(projectId: string): Promise<Character[]> {
    const locals = await db.characters
      .where("[projectId+order]")
      .between([projectId, -Infinity], [projectId, Infinity])
      .toArray();
    return locals.map(toCharacter);
  }

  async create(data: CreateCharacterInput): Promise<Character> {
    const existingCharacters = await this.getByProjectId(data.projectId);
    const maxOrder = existingCharacters.reduce(
      (max, ch) => Math.max(max, ch.order),
      0
    );

    const now = new Date();
    const isGuest = await isGuestProject(data.projectId);

    const local: LocalCharacter = {
      id: crypto.randomUUID(),
      projectId: data.projectId,
      name: data.name,
      nickname: data.nickname ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      race: data.race ?? null,
      imageUrl: null,
      imageBase64: data.imageUrl ?? null,
      order: maxOrder + 1,
      height: data.height ?? null,
      weight: data.weight ?? null,
      appearance: data.appearance ?? null,
      mbti: data.mbti ?? null,
      personality: data.personality ?? null,
      education: data.education ?? null,
      occupation: data.occupation ?? null,
      affiliation: data.affiliation ?? null,
      background: data.background ?? null,
      customFields: data.customFields ?? [],
      createdAt: now,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
      lastSyncedAt: null,
    };

    await db.characters.add(local);
    await db.projects.update(data.projectId, { updatedAt: now });

    return toCharacter(local);
  }

  async update(id: string, data: UpdateCharacterInput): Promise<Character> {
    const existing = await db.characters.get(id);
    if (!existing) {
      throw new Error(`Character not found: ${id}`);
    }

    const now = new Date();
    const isGuest = await isGuestProject(existing.projectId);

    // Handle image: store as base64 locally
    const { imageUrl, ...rest } = data;
    const imageUpdate =
      imageUrl !== undefined ? { imageBase64: imageUrl } : {};

    const updated: LocalCharacter = {
      ...existing,
      ...rest,
      ...imageUpdate,
      updatedAt: now,
      syncStatus: isGuest ? "synced" : "pending",
    };

    await db.characters.put(updated);
    await db.projects.update(existing.projectId, { updatedAt: now });

    return toCharacter(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.characters.get(id);
    if (!existing) {
      return;
    }

    await db.characters.delete(id);
    await db.projects.update(existing.projectId, { updatedAt: new Date() });
  }

  async reorder(projectId: string, characterIds: string[]): Promise<void> {
    const now = new Date();
    const isGuest = await isGuestProject(projectId);

    await db.transaction("rw", db.characters, db.projects, async () => {
      for (let i = 0; i < characterIds.length; i++) {
        await db.characters.update(characterIds[i], {
          order: i + 1,
          updatedAt: now,
          syncStatus: isGuest ? "synced" : "pending",
        });
      }
      await db.projects.update(projectId, { updatedAt: now });
    });
  }

  async deleteByProjectId(projectId: string): Promise<void> {
    await db.characters.where("projectId").equals(projectId).delete();
  }
}

export const characterLocalRepository = new CharacterLocalRepository();
