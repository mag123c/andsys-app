"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle, SpellCheck, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SpellCheckError } from "@/lib/spellcheck";

interface SpellCheckSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errors: SpellCheckError[];
  isLoading: boolean;
  errorMessage?: string;
  /** 텍스트가 잘렸는지 여부 */
  truncated?: boolean;
  /** 검사된 텍스트 길이 */
  checkedLength?: number;
  /** 전체 텍스트 길이 */
  totalLength?: number;
  onApply: (error: SpellCheckError) => void;
  onApplyAll: () => void;
}

export function SpellCheckSheet({
  open,
  onOpenChange,
  errors,
  isLoading,
  errorMessage,
  truncated,
  checkedLength,
  totalLength,
  onApply,
  onApplyAll,
}: SpellCheckSheetProps) {
  const [appliedTokens, setAppliedTokens] = useState<Set<string>>(new Set());

  const handleApply = (error: SpellCheckError) => {
    onApply(error);
    setAppliedTokens((prev) => new Set(prev).add(error.token));
  };

  const handleApplyAll = () => {
    onApplyAll();
    setAppliedTokens(new Set(errors.map((e) => e.token)));
  };

  // Sheet가 닫힐 때 적용 상태 초기화
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setAppliedTokens(new Set());
    }
    onOpenChange(newOpen);
  };

  const unappliedErrors = errors.filter((e) => !appliedTokens.has(e.token));

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SpellCheck className="h-5 w-5" />
            맞춤법 검사
          </SheetTitle>
          <SheetDescription>
            {isLoading
              ? "검사 중..."
              : errors.length > 0
                ? `${errors.length}개의 맞춤법 오류가 발견되었습니다.`
                : "맞춤법 오류가 없습니다."}
          </SheetDescription>
        </SheetHeader>

        {truncated && !isLoading && (
          <Alert variant="default" className="mt-4 border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-500 text-sm">
              전체 {totalLength?.toLocaleString()}자 중 앞 {checkedLength?.toLocaleString()}자만 검사되었습니다.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex-1 min-h-0 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                맞춤법을 검사하고 있습니다...
              </p>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="text-sm text-center">{errorMessage}</p>
            </div>
          ) : errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-green-600">
              <Check className="h-8 w-8" />
              <p className="text-sm">맞춤법 오류가 없습니다!</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)] -mx-6 px-6">
              <div className="space-y-3">
                {errors.map((error, index) => {
                  const isApplied = appliedTokens.has(error.token);

                  return (
                    <div
                      key={`${error.token}-${index}`}
                      className={`rounded-lg border p-3 transition-colors ${
                        isApplied
                          ? "bg-muted/50 border-green-500/30"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-destructive line-through font-medium">
                              {error.token}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-green-600 font-medium">
                              {error.suggestions[0]}
                            </span>
                            {isApplied && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 text-xs"
                              >
                                적용됨
                              </Badge>
                            )}
                          </div>

                          {error.suggestions.length > 1 && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              다른 제안:{" "}
                              {error.suggestions.slice(1).join(", ")}
                            </div>
                          )}

                          {error.type && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {error.type === "space"
                                ? "띄어쓰기 오류"
                                : error.type === "spell"
                                  ? "맞춤법 오류"
                                  : error.type}
                            </p>
                          )}
                        </div>

                        <Button
                          variant={isApplied ? "ghost" : "secondary"}
                          size="sm"
                          onClick={() => handleApply(error)}
                          disabled={isApplied}
                          className="shrink-0"
                        >
                          {isApplied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            "적용"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {errors.length > 0 && !isLoading && (
          <div className="flex gap-2 pt-4 border-t mt-4 -mx-6 px-6 pb-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
            >
              닫기
            </Button>
            <Button
              className="flex-1"
              onClick={handleApplyAll}
              disabled={unappliedErrors.length === 0}
            >
              {unappliedErrors.length === 0
                ? "모두 적용됨"
                : `모두 적용 (${unappliedErrors.length}개)`}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
