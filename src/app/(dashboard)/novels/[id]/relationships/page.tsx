"use client";

import { use, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useCharacters } from "@/hooks/useCharacters";
import type { Relationship, UpdateRelationshipInput } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  RelationshipDialog,
  EmptyRelationships,
  RelationshipGraph,
} from "@/components/features/relationship";

interface RelationshipsPageProps {
  params: Promise<{ id: string }>;
}

export default function RelationshipsPage({ params }: RelationshipsPageProps) {
  const { id: projectId } = use(params);
  const {
    relationships,
    isLoading: isRelationshipsLoading,
    error: relationshipsError,
    createRelationship,
    updateRelationship,
    deleteRelationship,
  } = useRelationships(projectId);

  const {
    characters,
    isLoading: isCharactersLoading,
    error: charactersError,
  } = useCharacters(projectId);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRelationship, setEditingRelationship] =
    useState<Relationship | null>(null);

  const isLoading = isRelationshipsLoading || isCharactersLoading;
  const error = relationshipsError || charactersError;

  const handleCreate = useCallback(
    async (data: Parameters<typeof createRelationship>[0]) => {
      try {
        const created = await createRelationship(data);
        toast.success("관계가 추가되었습니다.");
        return created;
      } catch {
        toast.error("관계 추가에 실패했습니다.");
        throw new Error("Failed to create relationship");
      }
    },
    [createRelationship]
  );

  const handleUpdate = useCallback(
    async (id: string, data: UpdateRelationshipInput) => {
      try {
        const updated = await updateRelationship(id, data);
        toast.success("관계가 수정되었습니다.");
        return updated;
      } catch {
        toast.error("관계 수정에 실패했습니다.");
        throw new Error("Failed to update relationship");
      }
    },
    [updateRelationship]
  );

  const handleDelete = useCallback(
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

  const handleEdit = useCallback((relationship: Relationship) => {
    setEditingRelationship(relationship);
  }, []);

  if (isLoading) {
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

  const hasCharacters = characters.length >= 2;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">관계도</h2>
        <Button onClick={() => setShowCreateDialog(true)} disabled={!hasCharacters}>
          <Plus className="mr-2 h-4 w-4" />
          관계 추가
        </Button>
      </div>

      {!hasCharacters ? (
        <EmptyRelationships hasCharacters={false} />
      ) : relationships.length === 0 ? (
        <EmptyRelationships hasCharacters={true} />
      ) : (
        <RelationshipGraph
          characters={characters}
          relationships={relationships}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <RelationshipDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        characters={characters}
        onCreate={handleCreate}
      />

      <RelationshipDialog
        open={!!editingRelationship}
        onOpenChange={(open) => !open && setEditingRelationship(null)}
        characters={characters}
        relationship={editingRelationship ?? undefined}
        onUpdate={handleUpdate}
      />
    </>
  );
}
