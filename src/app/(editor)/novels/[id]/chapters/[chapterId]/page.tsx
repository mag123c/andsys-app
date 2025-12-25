"use client";

import { use, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useChapters } from "@/hooks/useChapters";
import { useEditor } from "@/hooks/useEditor";
import { useSynopsis } from "@/hooks/useSynopsis";
import { useCharacters } from "@/hooks/useCharacters";
import { Button } from "@/components/ui/button";
import { Editor, EditorLayout } from "@/components/features/editor";

interface EditorPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id: projectId, chapterId } = use(params);
  const { project, isLoading: isProjectLoading } = useProject(projectId);
  const { chapters, isLoading: isChaptersLoading } = useChapters(projectId);
  const {
    chapter,
    isLoading: isChapterLoading,
    error,
    saveStatus,
    updateContent,
    updateTitle,
    saveNow,
  } = useEditor(chapterId);
  const { synopsis, isLoading: isSynopsisLoading } = useSynopsis(projectId);
  const { characters } = useCharacters(projectId);

  const isLoading = isProjectLoading || isChaptersLoading || isChapterLoading;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveNow]);

  // 제목 변경 핸들러 - useEditor의 updateTitle 사용으로 로컬 상태 + DB 동시 업데이트
  // useChapters는 useLiveQuery로 IndexedDB 변경 자동 감지하여 사이드바 동기화
  const handleTitleChange = useCallback(async (title: string) => {
    await updateTitle(title);
  }, [updateTitle]);

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

  if (!project || !chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          {!project ? "소설을" : "회차를"} 찾을 수 없습니다.
        </p>
        <Link href={project ? `/novels/${projectId}` : "/novels"}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {project ? "소설로 돌아가기" : "소설 목록으로"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <EditorLayout
      project={project}
      chapters={chapters}
      currentChapter={chapter}
      content={chapter.content}
      saveStatus={saveStatus}
      synopsis={synopsis}
      synopsisLoading={isSynopsisLoading}
      characters={characters}
      onTitleChange={handleTitleChange}
    >
      <Editor initialContent={chapter.content} onUpdate={updateContent} />
    </EditorLayout>
  );
}
