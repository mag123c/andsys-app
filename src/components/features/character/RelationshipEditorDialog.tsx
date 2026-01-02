"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Plus, X, User, Network } from "lucide-react";
import type { Character, Relationship, CreateRelationshipInput, RelationshipType } from "@/repositories/types";
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
import { RELATIONSHIP_TYPES, RELATIONSHIP_TYPE_LABELS } from "@/lib/constants";

interface RelationshipEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  allCharacters: Character[];
  relationships: Relationship[];
  onRelationshipCreate: (data: CreateRelationshipInput) => Promise<void>;
  onRelationshipDelete: (id: string) => Promise<void>;
}

export function RelationshipEditorDialog({
  open,
  onOpenChange,
  character,
  allCharacters,
  relationships,
  onRelationshipCreate,
  onRelationshipDelete,
}: RelationshipEditorDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            {character.name}의 관계
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 현재 관계 목록 */}
          <ScrollArea className="max-h-[300px]">
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
      </DialogContent>
    </Dialog>
  );
}
