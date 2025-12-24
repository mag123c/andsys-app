"use client";

import { useState } from "react";
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
import { CharacterForm } from "./CharacterForm";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "등장인물 편집" : "등장인물 추가"}
          </DialogTitle>
        </DialogHeader>
        <CharacterForm
          character={character}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
