"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatWordCount } from "@/lib/format";
import { useProject } from "@/hooks/useProject";
import { useEditor } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import { Editor, SaveStatus } from "@/components/features/editor";

interface EditorPageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id: projectId, chapterId } = use(params);
  const { project, isLoading: isProjectLoading } = useProject(projectId);
  const {
    chapter,
    isLoading: isChapterLoading,
    error,
    saveStatus,
    updateContent,
    saveNow,
  } = useEditor(chapterId);

  const isLoading = isProjectLoading || isChapterLoading;

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

  if (!chapter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">챕터를 찾을 수 없습니다.</p>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            프로젝트로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href={`/projects/${projectId}`}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">{project?.title ?? "프로젝트"}</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="font-medium truncate">{chapter.title}</h1>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {formatWordCount(chapter.wordCount)}
              </span>
              <SaveStatus status={saveStatus} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Editor
          initialContent={chapter.content}
          onUpdate={updateContent}
        />
      </main>
    </div>
  );
}
