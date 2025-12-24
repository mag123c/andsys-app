import { createClient } from "./client";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/repositories/types";
import type { ProjectRepository } from "@/repositories/project.repository";

// Supabase row type (snake_case)
interface ProjectRow {
  id: string;
  user_id: string | null;
  guest_id: string | null;
  title: string;
  description: string | null;
  genre: string | null;
  cover_image_url: string | null;
  status: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    guestId: row.guest_id,
    title: row.title,
    description: row.description,
    genre: row.genre,
    coverImageUrl: row.cover_image_url,
    status: row.status as Project["status"],
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class ProjectRemoteRepository implements ProjectRepository {
  private get supabase() {
    return createClient();
  }

  async getById(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .neq("status", "deleted")
      .single();

    if (error || !data) {
      return null;
    }

    return toProject(data);
  }

  async getByUserId(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(toProject);
  }

  async getByGuestId(guestId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("guest_id", guestId)
      .neq("status", "deleted")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(toProject);
  }

  async create(
    data: CreateProjectInput,
    owner: { userId: string } | { guestId: string }
  ): Promise<Project> {
    const isGuest = "guestId" in owner;

    const insertData = {
      user_id: isGuest ? null : owner.userId,
      guest_id: isGuest ? owner.guestId : null,
      title: data.title,
      description: data.description ?? null,
      genre: data.genre ?? null,
      status: "active",
    };

    const { data: created, error } = await this.supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error || !created) {
      throw new Error(`Failed to create project: ${error?.message}`);
    }

    return toProject(created);
  }

  async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.genre !== undefined) updateData.genre = data.genre;
    if (data.coverImageUrl !== undefined) updateData.cover_image_url = data.coverImageUrl;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: updated, error } = await this.supabase
      .from("projects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(`Failed to update project: ${error?.message}`);
    }

    return toProject(updated);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("projects")
      .update({
        status: "deleted",
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }
}

export const projectRemoteRepository = new ProjectRemoteRepository();
