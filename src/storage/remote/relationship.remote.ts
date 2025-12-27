import { createClient } from "./client";
import type {
  Relationship,
  RelationshipType,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from "@/repositories/types";
import type { RelationshipRepository } from "@/repositories/relationship.repository";

// Supabase row type (snake_case)
interface RelationshipRow {
  id: string;
  project_id: string;
  from_character_id: string;
  to_character_id: string;
  type: string;
  description: string | null;
  bidirectional: boolean;
  created_at: string;
  updated_at: string;
}

function toRelationship(row: RelationshipRow): Relationship {
  return {
    id: row.id,
    projectId: row.project_id,
    fromCharacterId: row.from_character_id,
    toCharacterId: row.to_character_id,
    type: row.type as RelationshipType,
    description: row.description,
    bidirectional: row.bidirectional,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class RelationshipRemoteRepository implements RelationshipRepository {
  private get supabase() {
    return createClient();
  }

  async getById(id: string): Promise<Relationship | null> {
    const { data, error } = await this.supabase
      .from("relationships")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return toRelationship(data);
  }

  async getByProjectId(projectId: string): Promise<Relationship[]> {
    const { data, error } = await this.supabase
      .from("relationships")
      .select("*")
      .eq("project_id", projectId);

    if (error || !data) {
      return [];
    }

    return data.map(toRelationship);
  }

  async getByCharacterId(characterId: string): Promise<Relationship[]> {
    const { data, error } = await this.supabase
      .from("relationships")
      .select("*")
      .or(`from_character_id.eq.${characterId},to_character_id.eq.${characterId}`);

    if (error || !data) {
      return [];
    }

    return data.map(toRelationship);
  }

  async create(data: CreateRelationshipInput): Promise<Relationship> {
    const insertData = {
      project_id: data.projectId,
      from_character_id: data.fromCharacterId,
      to_character_id: data.toCharacterId,
      type: data.type,
      description: data.description ?? null,
      bidirectional: data.bidirectional,
    };

    const { data: created, error } = await this.supabase
      .from("relationships")
      .insert(insertData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create relationship: ${error?.message}`);
    }

    return toRelationship(created);
  }

  async update(id: string, data: UpdateRelationshipInput): Promise<Relationship> {
    const updateData: Record<string, unknown> = {};

    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.bidirectional !== undefined) updateData.bidirectional = data.bidirectional;

    const { data: updated, error } = await this.supabase
      .from("relationships")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update relationship: ${error?.message}`);
    }

    return toRelationship(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("relationships")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete relationship: ${error.message}`);
    }
  }

  async deleteByCharacterId(characterId: string): Promise<void> {
    const { error } = await this.supabase
      .from("relationships")
      .delete()
      .or(`from_character_id.eq.${characterId},to_character_id.eq.${characterId}`);

    if (error) {
      throw new Error(`Failed to delete relationships: ${error.message}`);
    }
  }
}

export const relationshipRemoteRepository = new RelationshipRemoteRepository();
