"use client";

import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import { Menu, ArrowLeft } from "lucide-react";
import { EditorStatusBar } from "./EditorStatusBar";
import type { Project, Chapter, Synopsis, Character, Relationship } from "@/repositories/types";
import type { SaveStatus as SaveStatusType } from "@/hooks/useEditor";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EditorSidebar } from "./EditorSidebar";
import { SpellCheckSheet } from "./SpellCheckSheet";
import { RightSidebar } from "@/components/features/workspace";
import { extractText, extractTextForSpellCheck, countCharacters, replaceTextInContent, replaceMultipleInContent, plainTextToTiptapContent } from "@/lib/content-utils";
import { synopsisLocalRepository } from "@/storage/local/synopsis.local";
import { characterLocalRepository } from "@/storage/local/character.local";
import type { UpdateCharacterInput } from "@/repositories/types";
import { exportChapterAsText, copyChapterToClipboard } from "@/lib/export";
import { checkSpelling, type SpellCheckError } from "@/lib/spellcheck";
import { ShareButton } from "@/components/features/share";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorageBoolean } from "@/hooks/useLocalStorage";

const RIGHT_SIDEBAR_COLLAPSED_KEY = "4ndsys:editor-right-sidebar-collapsed";
const LEFT_SIDEBAR_COLLAPSED_KEY = "4ndsys:editor-left-sidebar-collapsed";

interface EditorLayoutProps {
  project: Project;
  chapters: Chapter[];
  currentChapter: Chapter;
  content: JSONContent | null;
  saveStatus: SaveStatusType;
  synopsis: Synopsis | null;
  synopsisLoading: boolean;
  characters: Character[];
  relationships: Relationship[];
  children: React.ReactNode;
  onTitleChange?: (title: string) => Promise<void>;
  onContentChange?: (content: JSONContent) => void;
}

export function EditorLayout({
  project,
  chapters,
  currentChapter,
  content,
  saveStatus,
  synopsis,
  synopsisLoading,
  characters,
  relationships,
  children,
  onTitleChange,
  onContentChange,
}: EditorLayoutProps) {
  const { auth } = useAuth();
  const isAuthenticated = auth.status === "authenticated";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [includeSpaces, setIncludeSpaces] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useLocalStorageBoolean(
    RIGHT_SIDEBAR_COLLAPSED_KEY,
    true
  );
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useLocalStorageBoolean(
    LEFT_SIDEBAR_COLLAPSED_KEY,
    false
  );
  // 우측 사이드바 열기 전 좌측 상태 저장 (복원용)
  const [leftSidebarPreviousState, setLeftSidebarPreviousState] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(currentChapter.title);

  // 맞춤법 검사 상태
  const [spellCheckOpen, setSpellCheckOpen] = useState(false);
  const [spellCheckLoading, setSpellCheckLoading] = useState(false);
  const [spellCheckErrors, setSpellCheckErrors] = useState<SpellCheckError[]>([]);
  const [spellCheckMessage, setSpellCheckMessage] = useState<string>();
  const [spellCheckTruncated, setSpellCheckTruncated] = useState(false);
  const [spellCheckCheckedLength, setSpellCheckCheckedLength] = useState<number>();
  const [spellCheckTotalLength, setSpellCheckTotalLength] = useState<number>();

  // 챕터 변경 시 draftTitle 동기화 (useLayoutEffect로 깜빡임 방지)
  // 챕터 전환 시 파생 상태 초기화 - React key 패턴 대안
  useLayoutEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- 챕터 변경 시 파생 상태 초기화 패턴 */
    setDraftTitle(currentChapter.title);
    setIsEditingTitle(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [currentChapter.id, currentChapter.title]);

  // 우측 사이드바 토글 (좌측과 연동)
  const handleRightSidebarToggle = () => {
    if (rightSidebarCollapsed) {
      // 우측 열기 → 좌측 상태 저장 후 접기
      setLeftSidebarPreviousState(leftSidebarCollapsed);
      setLeftSidebarCollapsed(true);
    } else {
      // 우측 닫기 → 좌측 복원
      setLeftSidebarCollapsed(leftSidebarPreviousState);
    }
    setRightSidebarCollapsed(!rightSidebarCollapsed);
  };

  // 좌측 사이드바 토글
  const handleLeftSidebarToggle = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };

  // 시놉시스 변경 핸들러
  const handleSynopsisChange = useCallback(async (plainText: string) => {
    if (!synopsis) return;
    const content = plainTextToTiptapContent(plainText);
    await synopsisLocalRepository.update(synopsis.id, { content });
  }, [synopsis]);

  // 캐릭터 업데이트 핸들러
  const handleCharacterUpdate = useCallback(async (id: string, data: UpdateCharacterInput) => {
    await characterLocalRepository.update(id, data);
  }, []);

  // 캐릭터 삭제 핸들러
  const handleCharacterDelete = useCallback(async (id: string) => {
    await characterLocalRepository.delete(id);
  }, []);

  // 제목 편집 시작
  const handleTitleClick = () => {
    if (onTitleChange) {
      setDraftTitle(currentChapter.title);
      setIsEditingTitle(true);
    }
  };

  // 제목 저장
  const handleTitleSave = async () => {
    const trimmed = draftTitle.trim();
    if (trimmed && trimmed !== currentChapter.title && onTitleChange) {
      await onTitleChange(trimmed);
    }
    setIsEditingTitle(false);
  };

  // 제목 편집 취소
  const handleTitleCancel = () => {
    setDraftTitle(currentChapter.title);
    setIsEditingTitle(false);
  };

  // 제목 입력 키보드 이벤트
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

  // 콘텐츠에서 글자수 계산
  const characterCount = useMemo(() => {
    const text = extractText(content);
    return countCharacters(text, includeSpaces);
  }, [content, includeSpaces]);

  const handleExportTxt = () => {
    exportChapterAsText(content, currentChapter.title);
    toast.success("TXT 파일로 내보내기 완료");
  };

  const handleCopyToClipboard = async () => {
    const success = await copyChapterToClipboard(content);
    if (success) {
      toast.success("클립보드에 복사되었습니다");
    } else {
      toast.error("클립보드 복사에 실패했습니다");
    }
  };

  // 맞춤법 검사 실행
  const handleSpellCheck = useCallback(async () => {
    if (!content) {
      toast.error("검사할 내용이 없습니다");
      return;
    }

    setSpellCheckOpen(true);
    setSpellCheckLoading(true);
    setSpellCheckErrors([]);
    setSpellCheckMessage(undefined);
    setSpellCheckTruncated(false);
    setSpellCheckCheckedLength(undefined);
    setSpellCheckTotalLength(undefined);

    const text = extractTextForSpellCheck(content);
    if (!text) {
      setSpellCheckLoading(false);
      return;
    }

    const result = await checkSpelling(text);
    setSpellCheckLoading(false);

    if (result.success) {
      setSpellCheckErrors(result.errors);
      setSpellCheckTruncated(result.truncated ?? false);
      setSpellCheckCheckedLength(result.checkedLength);
      setSpellCheckTotalLength(result.totalLength);
    } else {
      setSpellCheckMessage(result.message);
    }
  }, [content]);

  // 맞춤법 오류 하나 적용
  const handleApplyCorrection = useCallback(
    (error: SpellCheckError) => {
      if (!content || !onContentChange || !error.suggestions[0]) return;

      const newContent = replaceTextInContent(
        content,
        error.token,
        error.suggestions[0]
      ) as JSONContent;

      onContentChange(newContent);
      toast.success(`"${error.token}" → "${error.suggestions[0]}" 적용됨`);
    },
    [content, onContentChange]
  );

  // 모든 맞춤법 오류 적용
  const handleApplyAllCorrections = useCallback(() => {
    if (!content || !onContentChange || spellCheckErrors.length === 0) return;

    const replacements = spellCheckErrors
      .filter((e) => e.suggestions[0])
      .map((e) => ({ from: e.token, to: e.suggestions[0] }));

    const newContent = replaceMultipleInContent(content, replacements) as JSONContent;

    onContentChange(newContent);
    toast.success(`${replacements.length}개의 오류가 수정되었습니다`);
  }, [content, onContentChange, spellCheckErrors]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop left sidebar - fixed (w-64 또는 w-12) */}
      <aside
        className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:flex-col lg:border-r lg:bg-background lg:z-20 transition-[width] duration-200 ${
          leftSidebarCollapsed ? "lg:w-12" : "lg:w-64"
        }`}
      >
        <EditorSidebar
          project={project}
          chapters={chapters}
          currentChapterId={currentChapter.id}
          collapsed={leftSidebarCollapsed}
          onToggle={handleLeftSidebarToggle}
        />
      </aside>

      {/* Mobile left sidebar - Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>회차 목록</SheetTitle>
          </SheetHeader>
          <EditorSidebar
            project={project}
            chapters={chapters}
            currentChapterId={currentChapter.id}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div
        className={`flex-1 transition-[padding] duration-200 ${
          leftSidebarCollapsed ? "lg:pl-12" : "lg:pl-64"
        } ${
          rightSidebarCollapsed ? "lg:pr-12" : "lg:pr-[50%]"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden shrink-0"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">메뉴 열기</span>
                </Button>

                {/* Desktop back link */}
                <Link
                  href={`/novels/${project.id}`}
                  className="hidden lg:flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  <span>목록</span>
                </Link>

                {/* Chapter title - inline editable */}
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="font-medium bg-transparent border-b border-primary outline-none min-w-[100px] max-w-full"
                    autoFocus
                  />
                ) : (
                  <h1
                    className={`font-medium truncate ${onTitleChange ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                    onClick={handleTitleClick}
                    title={onTitleChange ? "클릭하여 제목 수정" : undefined}
                  >
                    {currentChapter.title}
                  </h1>
                )}
              </div>

              {/* Share button - only for logged in users */}
              {isAuthenticated && (
                <ShareButton
                  project={project}
                  chapter={currentChapter}
                />
              )}
            </div>
          </div>
        </header>

        {/* Editor content */}
        <main className="mx-auto max-w-4xl px-4 py-8 pb-16">{children}</main>
      </div>

      {/* Desktop right sidebar - fixed */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:right-0 lg:z-20">
        <RightSidebar
          synopsis={synopsis}
          synopsisLoading={synopsisLoading}
          onSynopsisChange={handleSynopsisChange}
          characters={characters}
          relationships={relationships}
          onCharacterUpdate={handleCharacterUpdate}
          onCharacterDelete={handleCharacterDelete}
          chapters={chapters}
          currentChapterId={currentChapter.id}
          collapsed={rightSidebarCollapsed}
          onToggle={handleRightSidebarToggle}
          className="h-full"
        />
      </div>

      {/* 하단 상태바 */}
      <EditorStatusBar
        characterCount={characterCount}
        includeSpaces={includeSpaces}
        onToggleSpaces={() => setIncludeSpaces(!includeSpaces)}
        saveStatus={saveStatus}
        onExportTxt={handleExportTxt}
        onCopyToClipboard={handleCopyToClipboard}
        onSpellCheck={handleSpellCheck}
        rightSidebarCollapsed={rightSidebarCollapsed}
      />

      {/* 맞춤법 검사 Sheet */}
      <SpellCheckSheet
        open={spellCheckOpen}
        onOpenChange={setSpellCheckOpen}
        errors={spellCheckErrors}
        isLoading={spellCheckLoading}
        errorMessage={spellCheckMessage}
        truncated={spellCheckTruncated}
        checkedLength={spellCheckCheckedLength}
        totalLength={spellCheckTotalLength}
        onApply={handleApplyCorrection}
        onApplyAll={handleApplyAllCorrections}
      />
    </div>
  );
}
