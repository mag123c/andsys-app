import type { JSONContent } from "@tiptap/core";
import { createClient } from "./client";
import type {
  Synopsis,
  CreateSynopsisInput,
  UpdateSynopsisInput,
} from "@/repositories/types";
import type { SynopsisRepository } from "@/repositories/synopsis.repository";
import { extractText, countCharacters } from "@/lib/content-utils";

// Supabase row type (snake_case)
interface SynopsisRow {
  id: string;
  project_id: string;
  content: JSONContent;
  plain_text: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

function toSynopsis(row: SynopsisRow): Synopsis {
  return {
    id: row.id,
    projectId: row.project_id,
    content: row.content,
    plainText: row.plain_text,
    wordCount: row.word_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class SynopsisRemoteRepository implements SynopsisRepository {
  private get supabase() {
    return createClient();
  }

  async getById(id: string): Promise<Synopsis | null> {
    const { data, error } = await this.supabase
      .from("synopses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return toSynopsis(data);
  }

  async getByProjectId(projectId: string): Promise<Synopsis | null> {
    const { data, error } = await this.supabase
      .from("synopses")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      return null;
    }

    return toSynopsis(data);
  }

  async create(data: CreateSynopsisInput): Promise<Synopsis> {
    const content = data.content ?? { type: "doc", content: [] };
    const plainText = extractText(content);

    const insertData = {
      project_id: data.projectId,
      content,
      plain_text: plainText,
      word_count: countCharacters(plainText),
    };

    const { data: created, error } = await this.supabase
      .from("synopses")
      .insert(insertData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create synopsis: ${error?.message}`);
    }

    return toSynopsis(created);
  }

  async update(id: string, data: UpdateSynopsisInput): Promise<Synopsis> {
    const updateData: Record<string, unknown> = {};

    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.plain_text = extractText(data.content);
      updateData.word_count = countCharacters(updateData.plain_text as string);
    }

    const { data: updated, error } = await this.supabase
      .from("synopses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update synopsis: ${error?.message}`);
    }

    return toSynopsis(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("synopses")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete synopsis: ${error.message}`);
    }
  }
}

export const synopsisRemoteRepository = new SynopsisRemoteRepository();
