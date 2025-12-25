"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import type {
  Relationship,
  Character,
  RelationshipType,
  CreateRelationshipInput,
  UpdateRelationshipInput,
} from "@/repositories/types";
import { RELATIONSHIP_TYPES } from "@/repositories/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface RelationshipFormData {
  fromCharacterId: string;
  toCharacterId: string;
  type: RelationshipType;
  description: string;
  bidirectional: boolean;
}

function getInitialFormData(relationship?: Relationship): RelationshipFormData {
  return {
    fromCharacterId: relationship?.fromCharacterId ?? "",
    toCharacterId: relationship?.toCharacterId ?? "",
    type: relationship?.type ?? "custom",
    description: relationship?.description ?? "",
    bidirectional: relationship?.bidirectional ?? true,
  };
}

interface RelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characters: Character[];
  relationship?: Relationship;
  /** 사전 선택된 캐릭터 (노드 연결 시 사용) */
  initialFromCharacterId?: string;
  initialToCharacterId?: string;
  onCreate?: (
    data: Omit<CreateRelationshipInput, "projectId">
  ) => Promise<Relationship>;
  onUpdate?: (id: string, data: UpdateRelationshipInput) => Promise<Relationship>;
}

export function RelationshipDialog({
  open,
  onOpenChange,
  characters,
  relationship,
  initialFromCharacterId,
  initialToCharacterId,
  onCreate,
  onUpdate,
}: RelationshipDialogProps) {
  const [formData, setFormData] = useState<RelationshipFormData>(() =>
    getInitialFormData(relationship)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!relationship;

  useEffect(() => {
    if (open) {
      const initial = getInitialFormData(relationship);
      // 사전 선택된 캐릭터가 있으면 적용
      if (initialFromCharacterId && !relationship) {
        initial.fromCharacterId = initialFromCharacterId;
      }
      if (initialToCharacterId && !relationship) {
        initial.toCharacterId = initialToCharacterId;
      }
      setFormData(initial);
    }
  }, [open, relationship, initialFromCharacterId, initialToCharacterId]);

  const handleChange = (field: keyof RelationshipFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromCharacterId || !formData.toCharacterId) {
      return;
    }

    if (formData.fromCharacterId === formData.toCharacterId) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && onUpdate && relationship) {
        await onUpdate(relationship.id, {
          type: formData.type,
          description: formData.description || null,
          bidirectional: formData.bidirectional,
        });
      } else if (onCreate) {
        await onCreate({
          fromCharacterId: formData.fromCharacterId,
          toCharacterId: formData.toCharacterId,
          type: formData.type,
          description: formData.description || null,
          bidirectional: formData.bidirectional,
        });
      }
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableToCharacters = characters.filter(
    (c) => c.id !== formData.fromCharacterId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "관계 편집" : "관계 추가"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 캐릭터 1 */}
            <div className="grid gap-2">
              <Label htmlFor="fromCharacter">캐릭터 1</Label>
              <Select
                value={formData.fromCharacterId}
                onValueChange={(value) => handleChange("fromCharacterId", value)}
                disabled={isEditMode}
              >
                <SelectTrigger id="fromCharacter">
                  <SelectValue placeholder="캐릭터 선택" />
                </SelectTrigger>
                <SelectContent>
                  {characters.map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-muted overflow-hidden">
                          {char.imageUrl ? (
                            <img
                              src={char.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-0.5 text-muted-foreground" />
                          )}
                        </div>
                        {char.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 관계 유형 */}
            <div className="grid gap-2">
              <Label htmlFor="type">관계 유형</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value as RelationshipType)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((t) => (
                    <SelectItem key={t.type} value={t.type}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                        />
                        <span>{t.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 캐릭터 2 */}
            <div className="grid gap-2">
              <Label htmlFor="toCharacter">캐릭터 2</Label>
              <Select
                value={formData.toCharacterId}
                onValueChange={(value) => handleChange("toCharacterId", value)}
                disabled={isEditMode || !formData.fromCharacterId}
              >
                <SelectTrigger id="toCharacter">
                  <SelectValue placeholder="캐릭터 선택" />
                </SelectTrigger>
                <SelectContent>
                  {availableToCharacters.map((char) => (
                    <SelectItem key={char.id} value={char.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-muted overflow-hidden">
                          {char.imageUrl ? (
                            <img
                              src={char.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-full w-full p-0.5 text-muted-foreground" />
                          )}
                        </div>
                        {char.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 양방향 여부 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bidirectional"
                checked={formData.bidirectional}
                onCheckedChange={(checked) =>
                  handleChange("bidirectional", checked === true)
                }
              />
              <Label htmlFor="bidirectional" className="font-normal cursor-pointer">
                양방향 관계
              </Label>
            </div>

            {/* 설명 */}
            <div className="grid gap-2">
              <Label htmlFor="description">설명 (선택)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="관계에 대한 상세 설명..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.fromCharacterId ||
                !formData.toCharacterId ||
                formData.fromCharacterId === formData.toCharacterId
              }
            >
              {isEditMode ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
