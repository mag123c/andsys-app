"use client";

import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import { Menu, ArrowLeft } from "lucide-react";
import { EditorStatusBar } from "./EditorStatusBar";
import { PlotMemo } from "./PlotMemo";
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
import { extractText, countCharacters } from "@/lib/content-utils";
import { synopsisLocalRepository } from "@/storage/local/synopsis.local";
import { characterLocalRepository } from "@/storage/local/character.local";
import { relationshipLocalRepository } from "@/storage/local/relationship.local";
import type { UpdateCharacterInput, CreateRelationshipInput } from "@/repositories/types";
import { useUserSettings } from "@/hooks/useUserSettings";
import { exportChapterAsText, copyChapterToClipboard } from "@/lib/export";
import { useSpellCheck } from "@/hooks/useSpellCheck";
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
  onPlotChange?: (plot: string | null) => void;
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
  onPlotChange,
}: EditorLayoutProps) {
  const { auth } = useAuth();
  const { settings } = useUserSettings();
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

  // 맞춤법 검사 훅
  const spellCheck = useSpellCheck({ content, onContentChange });

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
    const newState = !leftSidebarCollapsed;
    setLeftSidebarCollapsed(newState);
    // 우측이 열려있으면 이전 상태도 업데이트 (닫을 때 올바른 상태로 복원)
    if (!rightSidebarCollapsed) {
      setLeftSidebarPreviousState(newState);
    }
  };

  // 시놉시스 변경 핸들러 (JSONContent 직접 저장)
  const handleSynopsisChange = useCallback(async (synopsisContent: JSONContent) => {
    if (!synopsis) return;
    await synopsisLocalRepository.update(synopsis.id, { content: synopsisContent });
  }, [synopsis]);

  // 캐릭터 업데이트 핸들러
  const handleCharacterUpdate = useCallback(async (id: string, data: UpdateCharacterInput) => {
    await characterLocalRepository.update(id, data);
  }, []);

  // 캐릭터 삭제 핸들러
  const handleCharacterDelete = useCallback(async (id: string) => {
    await characterLocalRepository.delete(id);
  }, []);

  // 관계 생성 핸들러
  const handleRelationshipCreate = useCallback(async (data: CreateRelationshipInput) => {
    await relationshipLocalRepository.create(data);
  }, []);

  // 관계 삭제 핸들러
  const handleRelationshipDelete = useCallback(async (id: string) => {
    await relationshipLocalRepository.delete(id);
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

        {/* Plot memo */}
        <div className="mx-auto max-w-4xl">
          <PlotMemo
            plot={currentChapter.plot}
            onPlotChange={onPlotChange}
          />
        </div>

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
          onRelationshipCreate={handleRelationshipCreate}
          onRelationshipDelete={handleRelationshipDelete}
          chapters={chapters}
          currentChapterId={currentChapter.id}
          collapsed={rightSidebarCollapsed}
          onToggle={handleRightSidebarToggle}
          defaultFont={settings.defaultFont}
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
        onSpellCheck={spellCheck.runSpellCheck}
        rightSidebarCollapsed={rightSidebarCollapsed}
      />

      {/* 맞춤법 검사 Sheet */}
      <SpellCheckSheet
        open={spellCheck.isOpen}
        onOpenChange={spellCheck.setIsOpen}
        errors={spellCheck.errors}
        isLoading={spellCheck.isLoading}
        errorMessage={spellCheck.errorMessage}
        truncated={spellCheck.truncated}
        checkedLength={spellCheck.checkedLength}
        totalLength={spellCheck.totalLength}
        onApply={spellCheck.applyCorrection}
        onApplyAll={spellCheck.applyAllCorrections}
      />
    </div>
  );
}
