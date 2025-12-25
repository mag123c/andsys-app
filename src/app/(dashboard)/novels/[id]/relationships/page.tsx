"use client";

import { use, useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRelationships } from "@/hooks/useRelationships";
import { useCharacters } from "@/hooks/useCharacters";
import type { Relationship, UpdateRelationshipInput } from "@/repositories/types";
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

  const [editingRelationship, setEditingRelationship] =
    useState<Relationship | null>(null);

  // 새 관계 생성 시 사전 선택된 캐릭터
  const [pendingConnection, setPendingConnection] = useState<{
    fromCharacterId: string;
    toCharacterId: string;
  } | null>(null);

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

  // 그래프에서 노드 연결 시 호출
  const handleCreateFromGraph = useCallback(
    (fromCharacterId: string, toCharacterId: string) => {
      setPendingConnection({ fromCharacterId, toCharacterId });
    },
    []
  );

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

  const hasCharacters = characters.length >= 1;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">관계도</h2>
      </div>

      {!hasCharacters ? (
        <EmptyRelationships hasCharacters={false} />
      ) : (
        <RelationshipGraph
          characters={characters}
          relationships={relationships}
          onDelete={handleDelete}
          onCreate={handleCreateFromGraph}
        />
      )}

      {/* 노드 연결로 새 관계 생성 */}
      <RelationshipDialog
        open={!!pendingConnection}
        onOpenChange={(open) => !open && setPendingConnection(null)}
        characters={characters}
        initialFromCharacterId={pendingConnection?.fromCharacterId}
        initialToCharacterId={pendingConnection?.toCharacterId}
        onCreate={handleCreate}
      />

      {/* 기존 관계 편집 */}
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
