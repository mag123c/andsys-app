"use client";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import {
  ProjectCard,
  CreateProjectDialog,
  EmptyProjects,
} from "@/components/features/project";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, deleteProject } =
    useProjects();

  const handleCreate = async (data: Parameters<typeof createProject>[0]) => {
    try {
      await createProject(data);
      toast.success("프로젝트가 생성되었습니다.");
    } catch {
      toast.error("프로젝트 생성에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success("프로젝트가 삭제되었습니다.");
    } catch {
      toast.error("프로젝트 삭제에 실패했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">내 프로젝트</h1>
            <p className="text-muted-foreground mt-1">
              {projects.length > 0
                ? `${projects.length}개의 프로젝트`
                : "프로젝트가 없습니다"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CreateProjectDialog onCreate={handleCreate} />
          </div>
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
      </div>
    </div>
  );
}
