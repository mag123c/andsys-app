"use client";

import { useState, useCallback } from "react";
import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import { extractTextForSpellCheck, replaceTextInContent, replaceMultipleInContent } from "@/lib/content-utils";
import { checkSpelling, type SpellCheckError } from "@/lib/spellcheck";

interface UseSpellCheckProps {
  content: JSONContent | null;
  onContentChange?: (content: JSONContent) => void;
}

interface UseSpellCheckReturn {
  // 상태
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
  errors: SpellCheckError[];
  errorMessage?: string;
  truncated: boolean;
  checkedLength?: number;
  totalLength?: number;

  // 액션
  runSpellCheck: () => Promise<void>;
  applyCorrection: (error: SpellCheckError) => void;
  applyAllCorrections: () => void;
}

export function useSpellCheck({
  content,
  onContentChange,
}: UseSpellCheckProps): UseSpellCheckReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<SpellCheckError[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [truncated, setTruncated] = useState(false);
  const [checkedLength, setCheckedLength] = useState<number>();
  const [totalLength, setTotalLength] = useState<number>();

  // 맞춤법 검사 실행
  const runSpellCheck = useCallback(async () => {
    if (!content) {
      toast.error("검사할 내용이 없습니다");
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setErrors([]);
    setErrorMessage(undefined);
    setTruncated(false);
    setCheckedLength(undefined);
    setTotalLength(undefined);

    const text = extractTextForSpellCheck(content);
    if (!text) {
      setIsLoading(false);
      return;
    }

    const result = await checkSpelling(text);
    setIsLoading(false);

    if (result.success) {
      setErrors(result.errors);
      setTruncated(result.truncated ?? false);
      setCheckedLength(result.checkedLength);
      setTotalLength(result.totalLength);
    } else {
      setErrorMessage(result.message);
    }
  }, [content]);

  // 맞춤법 오류 하나 적용
  const applyCorrection = useCallback(
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
  const applyAllCorrections = useCallback(() => {
    if (!content || !onContentChange || errors.length === 0) return;

    const replacements = errors
      .filter((e) => e.suggestions[0])
      .map((e) => ({ from: e.token, to: e.suggestions[0] }));

    const newContent = replaceMultipleInContent(content, replacements) as JSONContent;

    onContentChange(newContent);
    toast.success(`${replacements.length}개의 오류가 수정되었습니다`);
  }, [content, onContentChange, errors]);

  return {
    isOpen,
    setIsOpen,
    isLoading,
    errors,
    errorMessage,
    truncated,
    checkedLength,
    totalLength,
    runSpellCheck,
    applyCorrection,
    applyAllCorrections,
  };
}
