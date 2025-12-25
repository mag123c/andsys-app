"use client";

import { useState } from "react";
import { History } from "lucide-react";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from "@/repositories/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CharacterForm } from "./CharacterForm";
import { VersionHistoryModal } from "@/components/features/history";

interface CharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character?: Character;
  onCreate?: (
    data: Omit<CreateCharacterInput, "projectId">
  ) => Promise<Character>;
  onUpdate?: (id: string, data: UpdateCharacterInput) => Promise<Character>;
}

export function CharacterDialog({
  open,
  onOpenChange,
  character,
  onCreate,
  onUpdate,
}: CharacterDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const isEditMode = !!character;

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
    if (!character || !onUpdate) return;

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

    await onUpdate(character.id, restoreData);
    onOpenChange(false);
  };

  // Reset history view when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setShowHistory(false);
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

          <CharacterForm
            character={character}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
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
