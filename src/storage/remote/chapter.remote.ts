import type { JSONContent } from "@tiptap/core";
import { createClient } from "./client";
import type {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from "@/repositories/types";
import type { ChapterRepository } from "@/repositories/chapter.repository";
import { extractText, countCharacters } from "@/lib/content-utils";

// Supabase row type (snake_case)
interface ChapterRow {
  id: string;
  project_id: string;
  title: string;
  content: JSONContent;
  content_text: string | null;
  word_count: number;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

function toChapter(row: ChapterRow): Chapter {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    content: row.content,
    contentText: row.content_text,
    wordCount: row.word_count,
    order: row.order,
    status: row.status as Chapter["status"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class ChapterRemoteRepository implements ChapterRepository {
  private get supabase() {
    return createClient();
  }

  async getById(id: string): Promise<Chapter | null> {
    const { data, error } = await this.supabase
      .from("chapters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return toChapter(data);
  }

  async getByProjectId(projectId: string): Promise<Chapter[]> {
    const { data, error } = await this.supabase
      .from("chapters")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(toChapter);
  }

  async create(data: CreateChapterInput): Promise<Chapter> {
    // Get max order for the project
    const { data: existing } = await this.supabase
      .from("chapters")
      .select("order")
      .eq("project_id", data.projectId)
      .order("order", { ascending: false })
      .limit(1);

    const maxOrder = existing?.[0]?.order ?? 0;
    const content = data.content ?? { type: "doc", content: [] };
    const contentText = extractText(content);

    const insertData = {
      project_id: data.projectId,
      title: data.title,
      content,
      content_text: contentText,
      word_count: countCharacters(contentText),
      order: maxOrder + 1,
      status: "draft",
    };

    const { data: created, error } = await this.supabase
      .from("chapters")
      .insert(insertData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create chapter: ${error?.message}`);
    }

    // Update project's updated_at
    await this.supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.projectId);

    return toChapter(created);
  }

  async update(id: string, data: UpdateChapterInput): Promise<Chapter> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.content !== undefined) {
      updateData.content = data.content;
      updateData.content_text = extractText(data.content);
      updateData.word_count = countCharacters(updateData.content_text as string);
    }

    const { data: updated, error } = await this.supabase
      .from("chapters")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update chapter: ${error?.message}`);
    }

    // Update project's updated_at
    await this.supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", updated.project_id);

    return toChapter(updated);
  }

  async delete(id: string): Promise<void> {
    // Get project_id before delete
    const { data: chapter } = await this.supabase
      .from("chapters")
      .select("project_id")
      .eq("id", id)
      .single();

    const { error } = await this.supabase
      .from("chapters")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete chapter: ${error.message}`);
    }

    // Update project's updated_at
    if (chapter?.project_id) {
      await this.supabase
        .from("projects")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", chapter.project_id);
    }
  }

  async reorder(projectId: string, chapterIds: string[]): Promise<void> {
    // Update each chapter's order
    const updates = chapterIds.map((id, index) =>
      this.supabase
        .from("chapters")
        .update({ order: index + 1 })
        .eq("id", id)
    );

    await Promise.all(updates);

    // Update project's updated_at
    await this.supabase
      .from("projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);
  }
}

export const chapterRemoteRepository = new ChapterRemoteRepository();
