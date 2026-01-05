"use client";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import { useSyncEngine } from "@/hooks/useSyncEngine";
import {
  ProjectCard,
  ProjectCardSkeleton,
  CreateProjectDialog,
  EmptyProjects,
} from "@/components/features/project";

export default function ProjectsPage() {
  const { projects, isLoading, error, createProject, updateProject, deleteProject } =
    useProjects();
  const { initialPullComplete } = useSyncEngine();

  // 스켈레톤 표시 조건: 로컬 로딩 중 OR 초기 동기화 미완료
  const showSkeleton = isLoading || !initialPullComplete;

  const handleCreate = async (data: Parameters<typeof createProject>[0]) => {
    try {
      await createProject(data);
      toast.success("소설이 생성되었습니다.");
    } catch {
      toast.error("소설 생성에 실패했습니다.");
    }
  };

  const handleUpdate = async (id: string, data: Parameters<typeof updateProject>[1]) => {
    try {
      await updateProject(id, data);
      toast.success("소설이 수정되었습니다.");
    } catch {
      toast.error("소설 수정에 실패했습니다.");
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

  if (showSkeleton) {
    return (
      <>
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">내 소설</h1>
            <p className="text-muted-foreground mt-1">불러오는 중...</p>
          </div>
        </header>
        {/* 6개: 3열 그리드에서 2행 분량 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              >
                <ProjectCard
                  project={project}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
