import type { Project, CreateProjectInput, UpdateProjectInput } from "./types";

export interface ProjectRepository {
  getById(id: string): Promise<Project | null>;
  getByUserId(userId: string): Promise<Project[]>;
  getByGuestId(guestId: string): Promise<Project[]>;
  create(
    data: CreateProjectInput,
    owner: { userId: string } | { guestId: string }
  ): Promise<Project>;
  update(id: string, data: UpdateProjectInput): Promise<Project>;
  delete(id: string): Promise<void>;
}
