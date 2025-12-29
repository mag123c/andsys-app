"use client";

import { Download, Copy, SpellCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SaveStatus } from "./SaveStatus";
import type { SaveStatus as SaveStatusType } from "@/hooks/useEditor";
import { formatCharacterCount } from "@/lib/format";

interface EditorStatusBarProps {
  /** 글자수 */
  characterCount: number;
  /** 공백 포함 여부 */
  includeSpaces: boolean;
  /** 공백 포함 토글 */
  onToggleSpaces: () => void;
  /** 저장 상태 */
  saveStatus: SaveStatusType;
  /** TXT 내보내기 핸들러 */
  onExportTxt: () => void;
  /** 클립보드 복사 핸들러 */
  onCopyToClipboard: () => void;
  /** 맞춤법 검사 핸들러 */
  onSpellCheck: () => void;
  /** 우측 사이드바 접힘 상태 */
  rightSidebarCollapsed: boolean;
}

export function EditorStatusBar({
  characterCount,
  includeSpaces,
  onToggleSpaces,
  saveStatus,
  onExportTxt,
  onCopyToClipboard,
  onSpellCheck,
  rightSidebarCollapsed,
}: EditorStatusBarProps) {
  // 저장되지 않은 상태(unsaved, saving)에서는 유틸리티 비활성화
  // 현재 UI 콘텐츠와 저장된 콘텐츠가 다를 수 있음
  const isNotSaved = saveStatus === "saving" || saveStatus === "unsaved";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[padding] duration-200 lg:left-64 ${
        rightSidebarCollapsed ? "lg:right-12" : "lg:right-72"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4">
        <div className="flex h-10 items-center justify-between gap-4">
          {/* 좌측: 글자수 */}
          <button
            onClick={onToggleSpaces}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            title={includeSpaces ? "공백 포함 (클릭: 공백 제외)" : "공백 제외 (클릭: 공백 포함)"}
          >
            {formatCharacterCount(characterCount)}
            <span className="ml-1 text-xs">
              ({includeSpaces ? "공백 포함" : "공백 제외"})
            </span>
          </button>

          {/* 중앙: 저장 상태 */}
          <div className="flex-1 flex justify-center">
            <SaveStatus status={saveStatus} />
          </div>

          {/* 우측: 유틸리티 버튼 */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onSpellCheck}
                  disabled={isNotSaved}
                >
                  <SpellCheck className="h-4 w-4" />
                  <span className="sr-only">맞춤법 검사</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>맞춤법 검사</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onCopyToClipboard}
                  disabled={isNotSaved}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">클립보드에 복사</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>클립보드에 복사</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onExportTxt}
                  disabled={isNotSaved}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">TXT로 내보내기</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>TXT로 내보내기</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
