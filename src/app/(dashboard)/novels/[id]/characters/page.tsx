"use client";

import { use, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useCharacters } from "@/hooks/useCharacters";
import { useRelationships } from "@/hooks/useRelationships";
import type { Character, UpdateCharacterInput, CreateRelationshipInput } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  CharacterDialog,
  SortableCharacterGrid,
  EmptyCharacters,
  RelationshipEditorDialog,
} from "@/components/features/character";

interface CharactersPageProps {
  params: Promise<{ id: string }>;
}

export default function CharactersPage({ params }: CharactersPageProps) {
  const { id: projectId } = use(params);
  const {
    characters,
    isLoading,
    error,
    createCharacter,
    updateCharacter,
    restoreCharacter,
    deleteCharacter,
    reorderCharacters,
  } = useCharacters(projectId);

  const {
    relationships,
    isLoading: relationshipsLoading,
    createRelationship,
    deleteRelationship,
  } = useRelationships(projectId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [relationshipEditingCharacter, setRelationshipEditingCharacter] =
    useState<Character | null>(null);

  const handleCreate = useCallback(
    async (data: Parameters<typeof createCharacter>[0]) => {
      try {
        await createCharacter(data);
        toast.success("등장인물이 추가되었습니다.");
        return {} as Character;
      } catch {
        toast.error("등장인물 추가에 실패했습니다.");
        throw new Error("Failed to create character");
      }
    },
    [createCharacter]
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateCharacterInput) => {
      try {
        const updated = await updateCharacter(id, data);
        toast.success("등장인물이 수정되었습니다.");
        return updated;
      } catch {
        toast.error("등장인물 수정에 실패했습니다.");
        throw new Error("Failed to update character");
      }
    },
    [updateCharacter]
  );

  const handleRestore = useCallback(
    async (id: string, data: UpdateCharacterInput) => {
      try {
        const restored = await restoreCharacter(id, data);
        toast.success("등장인물이 복원되었습니다.");
        return restored;
      } catch {
        toast.error("등장인물 복원에 실패했습니다.");
        throw new Error("Failed to restore character");
      }
    },
    [restoreCharacter]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteCharacter(id);
        toast.success("등장인물이 삭제되었습니다.");
      } catch {
        toast.error("등장인물 삭제에 실패했습니다.");
      }
    },
    [deleteCharacter]
  );

  const handleReorder = useCallback(
    async (characterIds: string[]) => {
      try {
        await reorderCharacters(characterIds);
      } catch {
        toast.error("순서 변경에 실패했습니다.");
      }
    },
    [reorderCharacters]
  );

  const handleEdit = useCallback((character: Character) => {
    setEditingCharacter(character);
  }, []);

  const handleEditRelationship = useCallback((character: Character) => {
    setRelationshipEditingCharacter(character);
  }, []);

  const handleRelationshipCreate = useCallback(
    async (data: CreateRelationshipInput) => {
      try {
        await createRelationship(data);
        toast.success("관계가 추가되었습니다.");
      } catch {
        toast.error("관계 추가에 실패했습니다.");
      }
    },
    [createRelationship]
  );

  const handleRelationshipDelete = useCallback(
    async (id: string) => {
      try {
        await deleteRelationship(id);
        toast.success("관계가 삭제되었습니다.");
      } catch {
        toast.error("관계 삭제에 실패했습니다.");
      }
    },
    [deleteRelationship]
  );

  if (isLoading || relationshipsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-destructive">오류가 발생했습니다: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">등장인물</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          추가
        </Button>
      </div>

      {characters.length === 0 ? (
        <EmptyCharacters />
      ) : (
        <SortableCharacterGrid
          characters={characters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onEditRelationship={handleEditRelationship}
          onReorder={handleReorder}
        />
      )}

      <CharacterDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />

      <CharacterDialog
        open={!!editingCharacter}
        onOpenChange={(open) => !open && setEditingCharacter(null)}
        character={editingCharacter ?? undefined}
        onUpdate={handleUpdate}
        onRestore={handleRestore}
      />

      {relationshipEditingCharacter && (
        <RelationshipEditorDialog
          open={!!relationshipEditingCharacter}
          onOpenChange={(open) => !open && setRelationshipEditingCharacter(null)}
          character={relationshipEditingCharacter}
          allCharacters={characters}
          relationships={relationships}
          onRelationshipCreate={handleRelationshipCreate}
          onRelationshipDelete={handleRelationshipDelete}
        />
      )}
    </>
  );
}
