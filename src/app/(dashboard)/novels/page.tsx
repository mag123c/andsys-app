"use client";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import {
  ProjectCard,
  CreateProjectDialog,
  EmptyProjects,
} from "@/components/features/project";

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, deleteProject } =
    useProjects();

  const handleCreate = async (data: Parameters<typeof createProject>[0]) => {
    try {
      await createProject(data);
      toast.success("소설이 생성되었습니다.");
    } catch {
      toast.error("소설 생성에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success("소설이 삭제되었습니다.");
    } catch {
      toast.error("소설 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">내 소설</h1>
          <p className="text-muted-foreground mt-1">
            {projects.length > 0
              ? `${projects.length}개의 소설`
              : "소설이 없습니다"}
          </p>
        </div>
        <CreateProjectDialog onCreate={handleCreate} />
      </header>

      {projects.length === 0 ? (
        <EmptyProjects />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </>
  );
}
