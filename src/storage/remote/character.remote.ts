import { createClient } from "./client";
import type {
  Character,
  CustomField,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import type { CharacterRepository } from "@/repositories/character.repository";

// Supabase row type (snake_case)
interface CharacterRow {
  id: string;
  project_id: string;
  name: string;
  nickname: string | null;
  age: number | null;
  gender: string | null;
  race: string | null;
  image_url: string | null;
  order: number;
  height: number | null;
  weight: number | null;
  appearance: string | null;
  mbti: string | null;
  personality: string | null;
  education: string | null;
  occupation: string | null;
  affiliation: string | null;
  background: string | null;
  custom_fields: CustomField[];
  created_at: string;
  updated_at: string;
}

function toCharacter(row: CharacterRow): Character {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    nickname: row.nickname,
    age: row.age,
    gender: row.gender,
    race: row.race,
    imageUrl: row.image_url,
    order: row.order,
    height: row.height,
    weight: row.weight,
    appearance: row.appearance,
    mbti: row.mbti,
    personality: row.personality,
    education: row.education,
    occupation: row.occupation,
    affiliation: row.affiliation,
    background: row.background,
    customFields: row.custom_fields ?? [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class CharacterRemoteRepository implements CharacterRepository {
  private get supabase() {
    return createClient();
  }

  async getById(id: string): Promise<Character | null> {
    const { data, error } = await this.supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return toCharacter(data);
  }

  async getByProjectId(projectId: string): Promise<Character[]> {
    const { data, error } = await this.supabase
      .from("characters")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(toCharacter);
  }

  async create(data: CreateCharacterInput): Promise<Character> {
    // Get max order for the project
    const { data: existing } = await this.supabase
      .from("characters")
      .select("order")
      .eq("project_id", data.projectId)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = existing?.[0]?.order ?? 0;

    const insertData = {
      project_id: data.projectId,
      name: data.name,
      nickname: data.nickname ?? null,
      age: data.age ?? null,
      gender: data.gender ?? null,
      race: data.race ?? null,
      image_url: data.imageUrl ?? null,
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
      custom_fields: data.customFields ?? [],
    };

    const { data: created, error } = await this.supabase
      .from("characters")
      .insert(insertData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create character: ${error?.message}`);
    }

    return toCharacter(created);
  }

  async update(id: string, data: UpdateCharacterInput): Promise<Character> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.race !== undefined) updateData.race = data.race;
    if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.appearance !== undefined) updateData.appearance = data.appearance;
    if (data.mbti !== undefined) updateData.mbti = data.mbti;
    if (data.personality !== undefined) updateData.personality = data.personality;
    if (data.education !== undefined) updateData.education = data.education;
    if (data.occupation !== undefined) updateData.occupation = data.occupation;
    if (data.affiliation !== undefined) updateData.affiliation = data.affiliation;
    if (data.background !== undefined) updateData.background = data.background;
    if (data.customFields !== undefined) updateData.custom_fields = data.customFields;

    const { data: updated, error } = await this.supabase
      .from("characters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update character: ${error?.message}`);
    }

    return toCharacter(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("characters")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete character: ${error.message}`);
    }
  }

  async reorder(projectId: string, characterIds: string[]): Promise<void> {
    const updates = characterIds.map((id, index) =>
      this.supabase
        .from("characters")
        .update({ order: index + 1 })
        .eq("id", id)
    );

    await Promise.all(updates);
  }
}

export const characterRemoteRepository = new CharacterRemoteRepository();
