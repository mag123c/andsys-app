"use client";

import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { Editor } from "@/components/features/editor";
import { formatTimeRemaining } from "@/lib/share";

interface SharedChapterViewProps {
  projectTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  content: JSONContent;
  characterCount: number;
  expiresAt: Date | null;
  createdAt: Date;
}

export function SharedChapterView({
  projectTitle,
  chapterTitle,
  chapterNumber,
  content,
  characterCount,
  expiresAt,
  createdAt,
}: SharedChapterViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 border-b pb-6">
          <p className="text-sm text-muted-foreground mb-2">{projectTitle}</p>
          <h1 className="text-2xl font-bold mb-4">
            {chapterNumber}화: {chapterTitle}
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{characterCount.toLocaleString()}자</span>
            <span>
              {createdAt.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              에 공유됨
            </span>
          </div>
        </header>

        {/* Content */}
        <article className="mb-12">
          <Editor
            initialContent={content}
            editable={false}
            showToolbar={false}
          />
        </article>

        {/* Footer */}
        <footer className="border-t pt-6 text-center">
          {expiresAt && (
            <p className="text-sm text-muted-foreground mb-4">
              {formatTimeRemaining(expiresAt)}
            </p>
          )}
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-3">
              4ndSYS - 웹소설 작가를 위한 무료 글쓰기 플랫폼
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              나도 시작하기
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
