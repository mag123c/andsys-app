"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { User, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { Character, Relationship, UpdateCharacterInput } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// 편집 가능한 필드 정의
interface FieldConfig {
  key: keyof Character;
  label: string;
  type: "text" | "number" | "textarea";
}

const BASIC_FIELDS: FieldConfig[] = [
  { key: "nickname", label: "별명", type: "text" },
  { key: "age", label: "나이", type: "number" },
  { key: "gender", label: "성별", type: "text" },
  { key: "race", label: "종족", type: "text" },
  { key: "occupation", label: "직업", type: "text" },
];

const APPEARANCE_FIELDS: FieldConfig[] = [
  { key: "height", label: "키", type: "number" },
  { key: "weight", label: "몸무게", type: "number" },
  { key: "appearance", label: "외형", type: "textarea" },
];

const PERSONALITY_FIELDS: FieldConfig[] = [
  { key: "mbti", label: "MBTI", type: "text" },
  { key: "personality", label: "성격", type: "textarea" },
  { key: "education", label: "학력", type: "text" },
  { key: "affiliation", label: "소속", type: "text" },
  { key: "background", label: "배경", type: "textarea" },
];

interface CharacterWikiCardProps {
  character: Character;
  relationships: Relationship[];
  allCharacters: Character[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, data: UpdateCharacterInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRelationshipAdd?: (sourceId: string, targetId: string) => void;
  onRelationshipDelete?: (relationshipId: string) => Promise<void>;
  className?: string;
}

export function CharacterWikiCard({
  character,
  relationships,
  allCharacters,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  className,
}: CharacterWikiCardProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        {/* Header - 이름 */}
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-2 p-3 bg-primary/10 hover:bg-primary/15 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <span className="flex-1 font-medium truncate">{character.name}</span>
            {character.nickname && (
              <span className="text-sm text-muted-foreground">({character.nickname})</span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="divide-y">
            {/* 프로필 이미지 + 기본 정보 */}
            <div className="p-3">
              <div className="flex gap-3 mb-3">
                <div className="w-20 h-28 rounded bg-muted overflow-hidden shrink-0">
                  {character.imageUrl ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <EditableField
                    label="이름"
                    value={character.name}
                    type="text"
                    onSave={(value) => onUpdate(character.id, { name: value as string })}
                    required
                  />
                </div>
              </div>

              {/* 기본 정보 테이블 */}
              <WikiTable
                fields={BASIC_FIELDS}
                character={character}
                onUpdate={onUpdate}
              />
            </div>

            {/* 외형 섹션 */}
            <WikiSection title="외형">
              <WikiTable
                fields={APPEARANCE_FIELDS}
                character={character}
                onUpdate={onUpdate}
              />
            </WikiSection>

            {/* 성격/배경 섹션 */}
            <WikiSection title="성격/배경">
              <WikiTable
                fields={PERSONALITY_FIELDS}
                character={character}
                onUpdate={onUpdate}
              />
            </WikiSection>

            {/* 관계 섹션 */}
            <WikiSection title="관계">
              <RelationshipList
                characterId={character.id}
                relationships={relationships}
                allCharacters={allCharacters}
              />
            </WikiSection>

            {/* 삭제 버튼 */}
            {onDelete && (
              <div className="p-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(character.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// 섹션 컴포넌트
function WikiSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-3">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">{title}</h4>
      {children}
    </div>
  );
}

// 테이블 컴포넌트
function WikiTable({
  fields,
  character,
  onUpdate,
}: {
  fields: FieldConfig[];
  character: Character;
  onUpdate: (id: string, data: UpdateCharacterInput) => Promise<void>;
}) {
  return (
    <div className="border rounded overflow-hidden divide-y">
      {fields.map((field) => {
        const rawValue = character[field.key];
        // 편집 가능한 필드만 처리 (string | number | null)
        const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : null;
        const displayValue =
          value === null || value === undefined
            ? ""
            : field.key === "age"
              ? `${value}세`
              : field.key === "height"
                ? `${value}cm`
                : field.key === "weight"
                  ? `${value}kg`
                  : String(value);

        return (
          <EditableField
            key={field.key}
            label={field.label}
            value={value}
            displayValue={displayValue}
            type={field.type}
            onSave={(newValue) =>
              onUpdate(character.id, { [field.key]: newValue } as UpdateCharacterInput)
            }
          />
        );
      })}
    </div>
  );
}

// 편집 가능한 필드 컴포넌트
function EditableField({
  label,
  value,
  displayValue,
  type,
  onSave,
  required,
}: {
  label: string;
  value: string | number | null | undefined;
  displayValue?: string;
  type: "text" | "number" | "textarea";
  onSave: (value: string | number | null) => Promise<void>;
  required?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const startEdit = useCallback(() => {
    setDraft(value?.toString() ?? "");
    setIsEditing(true);
  }, [value]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setDraft("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (required && !draft.trim()) {
      cancelEdit();
      return;
    }

    let newValue: string | number | null;
    if (type === "number") {
      newValue = draft.trim() ? Number(draft) : null;
    } else {
      newValue = draft.trim() || null;
    }

    // 값이 변경되었을 때만 저장
    if (newValue !== value) {
      await onSave(newValue);
    }
    setIsEditing(false);
  }, [draft, type, value, required, onSave, cancelEdit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && type !== "textarea") {
        e.preventDefault();
        saveEdit();
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    },
    [saveEdit, cancelEdit, type]
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const showValue = displayValue ?? (value?.toString() || "");

  return (
    <div
      className="flex text-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 라벨 */}
      <div className="w-20 shrink-0 bg-muted px-2 py-1.5 text-muted-foreground">
        {label}
      </div>

      {/* 값 */}
      <div className="flex-1 px-2 py-1.5 min-w-0 relative group">
        {isEditing ? (
          type === "textarea" ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="h-20 text-sm resize-none"
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm"
            />
          )
        ) : (
          <>
            <span
              className={cn(
                "block truncate cursor-pointer",
                !showValue && "text-muted-foreground italic"
              )}
              onClick={startEdit}
            >
              {showValue || "(미입력)"}
            </span>
            {isHovered && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={startEdit}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 관계 목록 컴포넌트
function RelationshipList({
  characterId,
  relationships,
  allCharacters,
}: {
  characterId: string;
  relationships: Relationship[];
  allCharacters: Character[];
}) {
  // 이 캐릭터와 관련된 관계만 필터링
  const relatedRelationships = relationships.filter(
    (r) => r.fromCharacterId === characterId || r.toCharacterId === characterId
  );

  if (relatedRelationships.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-2">
        관계가 없습니다
      </p>
    );
  }

  // 관계 타입 라벨 맵
  const typeLabels: Record<string, string> = {
    family: "가족",
    friend: "친구",
    lover: "연인",
    rival: "라이벌",
    enemy: "적",
    colleague: "동료",
    master: "사제",
    custom: "기타",
  };

  return (
    <div className="border rounded overflow-hidden divide-y">
      {relatedRelationships.map((rel) => {
        const isFrom = rel.fromCharacterId === characterId;
        const otherId = isFrom ? rel.toCharacterId : rel.fromCharacterId;
        const other = allCharacters.find((c) => c.id === otherId);
        const typeLabel = typeLabels[rel.type] || rel.type;
        const label = rel.description || typeLabel;

        if (!other) return null;

        return (
          <div key={rel.id} className="flex text-sm">
            <div className="w-20 shrink-0 bg-muted px-2 py-1.5 truncate">
              {other.name}
            </div>
            <div className="flex-1 px-2 py-1.5 text-muted-foreground truncate">
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
