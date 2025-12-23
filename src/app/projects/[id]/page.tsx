"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Settings } from "lucide-react";
import { formatWordCount } from "@/lib/format";
import { useProject } from "@/hooks/useProject";
import { useChapters } from "@/hooks/useChapters";
import { Button } from "@/components/ui/button";
import {
  ChapterCard,
  CreateChapterDialog,
  EmptyChapters,
} from "@/components/features/chapter";
import { EditProjectDialog } from "@/components/features/project";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { project, isLoading: isProjectLoading, error: projectError, updateProject } = useProject(id);
  const {
    chapters,
    isLoading: isChaptersLoading,
    error: chaptersError,
    createChapter,
    deleteChapter,
    updateChapter,
  } = useChapters(id);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const isLoading = isProjectLoading || isChaptersLoading;
  const error = projectError || chaptersError;

  const handleCreateChapter = async (data: Parameters<typeof createChapter>[0]) => {
    try {
      await createChapter(data);
      toast.success("챕터가 생성되었습니다.");
    } catch {
      toast.error("챕터 생성에 실패했습니다.");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
      toast.success("챕터가 삭제되었습니다.");
    } catch {
      toast.error("챕터 삭제에 실패했습니다.");
    }
  };

  const handleUpdateProject = async (data: Parameters<typeof updateProject>[0]) => {
    try {
      await updateProject(data);
      toast.success("프로젝트가 수정되었습니다.");
    } catch {
      toast.error("프로젝트 수정에 실패했습니다.");
    }
  };

  const handleUpdateChapter = useCallback(
    async (chapterId: string, data: Parameters<typeof updateChapter>[1]) => {
      try {
        await updateChapter(chapterId, data);
        toast.success("챕터가 수정되었습니다.");
      } catch {
        toast.error("챕터 수정에 실패했습니다.");
      }
    },
    [updateChapter]
  );

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

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다.</p>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            프로젝트 목록으로
          </Button>
        </Link>
      </div>
    );
  }

  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <nav className="mb-6">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            프로젝트 목록
          </Link>
        </nav>

        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{project.title}</h1>
              {project.description && (
                <p className="mt-1 text-muted-foreground line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                {project.genre && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                    {project.genre}
                  </span>
                )}
                <span>{chapters.length}개 챕터</span>
                <span>총 {formatWordCount(totalWordCount)}</span>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">프로젝트 설정</span>
            </Button>
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">챕터</h2>
            <CreateChapterDialog onCreate={handleCreateChapter} />
          </div>

          {chapters.length === 0 ? (
            <EmptyChapters />
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  projectId={project.id}
                  onDelete={handleDeleteChapter}
                  onUpdate={(data) => handleUpdateChapter(chapter.id, data)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <EditProjectDialog
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={handleUpdateProject}
      />
    </div>
  );
}
