"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { History, Plus, X, User, Network } from "lucide-react";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
  Relationship,
  CreateRelationshipInput,
  RelationshipType,
} from "@/repositories/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CharacterForm } from "./CharacterForm";
import { VersionHistoryModal } from "@/components/features/history";
import { RELATIONSHIP_TYPES, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants";

interface CharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character;
  onCreate?: (
    data: Omit<CreateCharacterInput, "projectId">
  ) => Promise<Character>;
  onUpdate?: (id: string, data: UpdateCharacterInput) => Promise<Character>;
  /** 히스토리 복원 전용 (버전 생성 완료 대기) */
  onRestore?: (id: string, data: UpdateCharacterInput) => Promise<Character>;
  /** 관계 편집용 props (편집 모드에서만 사용) */
  relationships?: Relationship[];
  allCharacters?: Character[];
  onRelationshipCreate?: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete?: (id: string) => Promise<void>;
}

export function CharacterDialog({
  open,
  onOpenChange,
  character,
  onCreate,
  onUpdate,
  onRestore,
  relationships = [],
  allCharacters = [],
  onRelationshipCreate,
  onRelationshipDelete,
}: CharacterDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "relationship">("info");
  const isEditMode = !!character;

  // 관계 섹션에서 사용하는 핸들러들
  const canShowRelationships = isEditMode && onRelationshipCreate && onRelationshipDelete;

  const handleSubmit = async (
    data: Omit<CreateCharacterInput, "projectId"> | UpdateCharacterInput
  ) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && onUpdate) {
        await onUpdate(character.id, data as UpdateCharacterInput);
      } else if (onCreate) {
        await onCreate(data as Omit<CreateCharacterInput, "projectId">);
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestore = async (snapshot: Record<string, unknown>) => {
    const restoreHandler = onRestore || onUpdate;
    if (!character || !restoreHandler) return;

    const restoreData: UpdateCharacterInput = {
      name: snapshot.name as string,
      nickname: snapshot.nickname as string | null,
      age: snapshot.age as number | null,
      gender: snapshot.gender as string | null,
      race: snapshot.race as string | null,
      imageUrl: snapshot.imageUrl as string | null,
      height: snapshot.height as number | null,
      weight: snapshot.weight as number | null,
      appearance: snapshot.appearance as string | null,
      mbti: snapshot.mbti as string | null,
      personality: snapshot.personality as string | null,
      education: snapshot.education as string | null,
      occupation: snapshot.occupation as string | null,
      affiliation: snapshot.affiliation as string | null,
      background: snapshot.background as string | null,
      customFields: snapshot.customFields as Array<{ key: string; value: string }>,
    };

    await restoreHandler(character.id, restoreData);
    onOpenChange(false);
  };

  // Reset states when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowHistory(false);
      setActiveTab("info");
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {isEditMode ? "등장인물 편집" : "등장인물 추가"}
              </DialogTitle>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="mr-6"
                >
                  <History className="h-4 w-4 mr-1" />
                  히스토리
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* 탭 버튼 (편집 모드 + 관계 기능 있을 때만) */}
          {canShowRelationships && (
            <div className="px-6 pb-2 flex gap-2 border-b">
              <Button
                variant={activeTab === "info" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("info")}
              >
                기본 정보
              </Button>
              <Button
                variant={activeTab === "relationship" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("relationship")}
              >
                <Network className="h-4 w-4 mr-1" />
                관계
              </Button>
            </div>
          )}

          {/* 기본 정보 탭 */}
          {activeTab === "info" && (
            <CharacterForm
              character={character}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
            />
          )}

          {/* 관계 탭 */}
          {activeTab === "relationship" && canShowRelationships && character && (
            <RelationshipSection
              character={character}
              relationships={relationships}
              allCharacters={allCharacters}
              onRelationshipCreate={onRelationshipCreate}
              onRelationshipDelete={onRelationshipDelete}
              onClose={() => onOpenChange(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {character && (
        <VersionHistoryModal
          open={showHistory}
          onOpenChange={setShowHistory}
          entityType="character"
          entityId={character.id}
          entityName={character.name}
          onRestore={handleRestore}
        />
      )}
    </>
  );
}

// 관계 섹션 컴포넌트
interface RelationshipSectionProps {
  character: Character;
  relationships: Relationship[];
  allCharacters: Character[];
  onRelationshipCreate: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

function RelationshipSection({
  character,
  relationships,
  allCharacters,
  onRelationshipCreate,
  onRelationshipDelete,
  onClose,
}: RelationshipSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<RelationshipType>("friend");
  const [description, setDescription] = useState("");

  // 이 캐릭터와 관련된 관계만 필터링
  const relatedRelationships = relationships.filter(
    (r) => r.fromCharacterId === character.id || r.toCharacterId === character.id
  );

  // 관계 추가 가능한 캐릭터 목록 (자기 자신 제외)
  const availableTargets = allCharacters.filter((c) => c.id !== character.id);

  const handleAdd = useCallback(async () => {
    if (!selectedTargetId) return;

    await onRelationshipCreate({
      projectId: character.projectId,
      fromCharacterId: character.id,
      toCharacterId: selectedTargetId,
      type: selectedType,
      bidirectional: true,
      description: description || null,
    });

    setIsAdding(false);
    setSelectedTargetId("");
    setSelectedType("friend");
    setDescription("");
  }, [selectedTargetId, selectedType, description, character.id, character.projectId, onRelationshipCreate]);

  const handleDelete = useCallback(async (id: string) => {
    await onRelationshipDelete(id);
  }, [onRelationshipDelete]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto px-6">
        <div className="py-4 space-y-4">
          {/* 현재 관계 목록 */}
          <ScrollArea className="max-h-[400px]">
            {relatedRelationships.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">설정된 관계가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {relatedRelationships.map((rel) => {
                  const isFrom = rel.fromCharacterId === character.id;
                  const otherId = isFrom ? rel.toCharacterId : rel.fromCharacterId;
                  const other = allCharacters.find((c) => c.id === otherId);
                  const typeLabel = RELATIONSHIP_TYPE_LABELS[rel.type] || rel.type;
                  const label = rel.description || typeLabel;

                  if (!other) return null;

                  return (
                    <div
                      key={rel.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card group"
                    >
                      {/* 상대 캐릭터 이미지 */}
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 relative">
                        {other.imageUrl ? (
                          <Image
                            src={other.imageUrl}
                            alt={other.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{other.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {label}
                        </div>
                      </div>

                      {/* 삭제 버튼 */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(rel.id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* 관계 추가 폼 */}
          {isAdding ? (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
                  <SelectTrigger>
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
                <Select
                  value={selectedType}
                  onValueChange={(v) => setSelectedType(v as RelationshipType)}
                >
                  <SelectTrigger>
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
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedTargetId}
                >
                  추가
                </Button>
              </div>
            </div>
          ) : (
            availableTargets.length > 0 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                관계 추가
              </Button>
            )
          )}
        </div>
      </div>

      {/* Footer 버튼 */}
      <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t bg-background">
        <Button variant="outline" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
