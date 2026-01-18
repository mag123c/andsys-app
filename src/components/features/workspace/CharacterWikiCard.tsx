"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { User, ChevronDown, Pencil, Trash2, Plus, X } from "lucide-react";
import type { Character, Relationship, UpdateCharacterInput, CreateRelationshipInput, RelationshipType } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { RELATIONSHIP_TYPES, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants";

const MBTI_OPTIONS = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

const GENDER_OPTIONS = ["남성", "여성", "기타"] as const;

// 편집 가능한 필드 정의
interface FieldConfig {
  key: keyof Character;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  options?: readonly string[];
  suffix?: string;
  grid?: boolean; // true면 2열 그리드
}

// 라벨 너비 상수 (일관성 유지)
const LABEL_WIDTH = "w-20";

// 기본 정보 (이름 제외 - 별도 처리)
const BASIC_FIELDS: FieldConfig[] = [
  { key: "nickname", label: "별명/호칭", type: "text" },
  { key: "age", label: "나이", type: "number", suffix: "세" },
  { key: "gender", label: "성별", type: "select", options: GENDER_OPTIONS },
  { key: "race", label: "종족", type: "text" },
];

// 외형
const APPEARANCE_FIELDS: FieldConfig[] = [
  { key: "height", label: "키", type: "number", suffix: "cm", grid: true },
  { key: "weight", label: "몸무게", type: "number", suffix: "kg", grid: true },
  { key: "appearance", label: "외형 설명", type: "textarea" },
];

// 성격
const PERSONALITY_FIELDS: FieldConfig[] = [
  { key: "mbti", label: "MBTI", type: "select", options: MBTI_OPTIONS },
  { key: "personality", label: "성격 설명", type: "textarea" },
];

// 배경
const BACKGROUND_FIELDS: FieldConfig[] = [
  { key: "occupation", label: "직업", type: "text", grid: true },
  { key: "affiliation", label: "소속", type: "text", grid: true },
  { key: "education", label: "학력", type: "text" },
  { key: "background", label: "배경 스토리", type: "textarea" },
];

interface CharacterWikiCardProps {
  character: Character;
  relationships: Relationship[];
  allCharacters: Character[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (id: string, data: UpdateCharacterInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRelationshipCreate?: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete?: (id: string) => Promise<void>;
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
  onRelationshipCreate,
  onRelationshipDelete,
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
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden shrink-0 relative">
              {character.imageUrl ? (
                <Image
                  src={character.imageUrl}
                  alt=""
                  fill
                  sizes="32px"
                  className="object-cover"
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
                <div className="w-16 h-24 rounded bg-muted overflow-hidden shrink-0 relative">
                  {character.imageUrl ? (
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
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

            {/* 성격 섹션 */}
            <WikiSection title="성격">
              <WikiTable
                fields={PERSONALITY_FIELDS}
                character={character}
                onUpdate={onUpdate}
              />
            </WikiSection>

            {/* 배경 섹션 */}
            <WikiSection title="배경">
              <WikiTable
                fields={BACKGROUND_FIELDS}
                character={character}
                onUpdate={onUpdate}
              />
            </WikiSection>

            {/* 커스텀 필드 섹션 */}
            {character.customFields && character.customFields.length > 0 && (
              <WikiSection title="커스텀 필드">
                <div className="border rounded overflow-hidden divide-y">
                  {character.customFields.map((field, index) => (
                    <div key={index} className="flex text-sm">
                      <div className={cn("shrink-0 bg-muted px-2 py-1.5 text-muted-foreground truncate", LABEL_WIDTH)}>
                        {field.key}
                      </div>
                      <div className="flex-1 px-2 py-1.5 truncate">
                        {field.value}
                      </div>
                    </div>
                  ))}
                </div>
              </WikiSection>
            )}

            {/* 관계 섹션 */}
            <WikiSection title="관계">
              <RelationshipEditor
                characterId={character.id}
                projectId={character.projectId}
                relationships={relationships}
                allCharacters={allCharacters}
                onRelationshipCreate={onRelationshipCreate}
                onRelationshipDelete={onRelationshipDelete}
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
  // 그리드 필드들 분리
  const gridFields = fields.filter((f) => f.grid);
  const normalFields = fields.filter((f) => !f.grid);

  return (
    <div className="border rounded overflow-hidden divide-y">
      {/* 2열 그리드 필드들 */}
      {gridFields.length > 0 && (
        <div className="grid grid-cols-2 divide-x">
          {gridFields.map((field) => {
            const rawValue = character[field.key];
            const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : null;
            const displayValue = formatDisplayValue(value, field);

            return (
              <EditableField
                key={field.key}
                label={field.label}
                value={value}
                displayValue={displayValue}
                type={field.type}
                options={field.options}
                onSave={(newValue) =>
                  onUpdate(character.id, { [field.key]: newValue } as UpdateCharacterInput)
                }
              />
            );
          })}
        </div>
      )}
      {/* 일반 필드들 */}
      {normalFields.map((field) => {
        const rawValue = character[field.key];
        const value = typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : null;
        const displayValue = formatDisplayValue(value, field);

        return (
          <EditableField
            key={field.key}
            label={field.label}
            value={value}
            displayValue={displayValue}
            type={field.type}
            options={field.options}
            onSave={(newValue) =>
              onUpdate(character.id, { [field.key]: newValue } as UpdateCharacterInput)
            }
          />
        );
      })}
    </div>
  );
}

function formatDisplayValue(value: string | number | null, field: FieldConfig): string {
  if (value === null || value === undefined || value === "") return "";
  if (field.suffix) return `${value}${field.suffix}`;
  return String(value);
}

// 편집 가능한 필드 컴포넌트
function EditableField({
  label,
  value,
  displayValue,
  type,
  options,
  onSave,
  required,
}: {
  label: string;
  value: string | number | null | undefined;
  displayValue?: string;
  type: "text" | "number" | "textarea" | "select";
  options?: readonly string[];
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

  // Select 타입은 클릭 시 바로 Select 표시
  if (type === "select" && options) {
    return (
      <div className="flex text-sm">
        <div className={cn("shrink-0 bg-muted px-2 py-1.5 text-muted-foreground", LABEL_WIDTH)}>
          {label}
        </div>
        <div className="flex-1 px-2 py-1.5 min-w-0">
          <Select
            value={value?.toString() || ""}
            onValueChange={async (v) => {
              await onSave(v || null);
            }}
          >
            <SelectTrigger className="h-6 text-xs border-0 p-0 shadow-none focus:ring-0">
              <SelectValue placeholder="(미입력)" />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex text-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 라벨 */}
      <div className={cn("shrink-0 bg-muted px-2 py-1.5 text-muted-foreground", LABEL_WIDTH)}>
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
              className="h-16 text-xs resize-none"
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="h-6 text-xs"
            />
          )
        ) : (
          <>
            <span
              className={cn(
                "block cursor-pointer",
                type === "textarea" ? "whitespace-pre-wrap" : "truncate",
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
                className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5"
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

// 관계 편집 컴포넌트
function RelationshipEditor({
  characterId,
  projectId,
  relationships,
  allCharacters,
  onRelationshipCreate,
  onRelationshipDelete,
}: {
  characterId: string;
  projectId: string;
  relationships: Relationship[];
  allCharacters: Character[];
  onRelationshipCreate?: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete?: (id: string) => Promise<void>;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<RelationshipType>("friend");
  const [description, setDescription] = useState("");

  // allCharacters를 Map으로 캐싱 (O(1) 조회)
  const characterMap = useMemo(
    () => new Map(allCharacters.map((c) => [c.id, c])),
    [allCharacters]
  );

  // 이 캐릭터와 관련된 관계만 필터링
  const relatedRelationships = relationships.filter(
    (r) => r.fromCharacterId === characterId || r.toCharacterId === characterId
  );

  // 관계 추가 가능한 캐릭터 목록 (자기 자신 제외)
  const availableTargets = allCharacters.filter((c) => c.id !== characterId);

  const handleAdd = async () => {
    if (!selectedTargetId || !onRelationshipCreate) return;

    await onRelationshipCreate({
      projectId,
      fromCharacterId: characterId,
      toCharacterId: selectedTargetId,
      type: selectedType,
      bidirectional: true,
      description: description || null,
    });

    setIsAdding(false);
    setSelectedTargetId("");
    setSelectedType("friend");
    setDescription("");
  };

  return (
    <div className="space-y-2">
      {relatedRelationships.length === 0 && !isAdding ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          관계가 없습니다
        </p>
      ) : (
        <div className="border rounded overflow-hidden divide-y">
          {relatedRelationships.map((rel) => {
            const isFrom = rel.fromCharacterId === characterId;
            const otherId = isFrom ? rel.toCharacterId : rel.fromCharacterId;
            const other = characterMap.get(otherId);
            const typeLabel = RELATIONSHIP_TYPE_LABELS[rel.type] || rel.type;
            const label = rel.description || typeLabel;

            if (!other) return null;

            return (
              <div key={rel.id} className="flex items-center text-sm group">
                <div className={cn("shrink-0 bg-muted px-2 py-1.5 truncate", LABEL_WIDTH)}>
                  {other.name}
                </div>
                <div className="flex-1 px-2 py-1.5 text-muted-foreground truncate">
                  {label}
                </div>
                {onRelationshipDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity mr-1"
                    onClick={() => onRelationshipDelete(rel.id)}
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 관계 추가 폼 */}
      {isAdding ? (
        <div className="border rounded p-2 space-y-2 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="캐릭터 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as RelationshipType)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="관계 설명 (선택)"
            className="h-7 text-xs"
          />
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setIsAdding(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              className="h-6 text-xs"
              onClick={handleAdd}
              disabled={!selectedTargetId}
            >
              추가
            </Button>
          </div>
        </div>
      ) : (
        onRelationshipCreate && availableTargets.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            관계 추가
          </Button>
        )
      )}
    </div>
  );
}
