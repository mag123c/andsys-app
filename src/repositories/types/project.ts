export interface Project {
  id: string;
  userId: string | null;
  guestId: string | null;
  title: string;
  description: string | null;
  genre: string | null;
  status: "active" | "archived" | "deleted";
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectInput = Pick<Project, "title"> &
  Partial<Pick<Project, "description" | "genre">>;

export type UpdateProjectInput = Partial<
  Pick<Project, "title" | "description" | "genre" | "status">
>;
