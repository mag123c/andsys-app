"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, Users, Plus, Network } from "lucide-react";
import type { Character, Relationship, UpdateCharacterInput } from "@/repositories/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CharacterWikiCard } from "./CharacterWikiCard";

interface RightSidebarCharactersProps {
  characters: Character[];
  relationships: Relationship[];
  onCharacterUpdate?: (id: string, data: UpdateCharacterInput) => Promise<void>;
  onCharacterDelete?: (id: string) => Promise<void>;
  onCharacterAdd?: () => void;
  onShowRelationshipGraph?: () => void;
  className?: string;
}

export function RightSidebarCharacters({
  characters,
  relationships,
  onCharacterUpdate,
  onCharacterDelete,
  onCharacterAdd,
  onShowRelationshipGraph,
  className,
}: RightSidebarCharactersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCharacters = useMemo(() => {
    if (!searchQuery.trim()) return characters;
    const query = searchQuery.toLowerCase();
    return characters.filter(
      (char) =>
        char.name.toLowerCase().includes(query) ||
        char.nickname?.toLowerCase().includes(query) ||
        char.occupation?.toLowerCase().includes(query)
    );
  }, [characters, searchQuery]);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdate = useCallback(
    async (id: string, data: UpdateCharacterInput) => {
      if (onCharacterUpdate) {
        await onCharacterUpdate(id, data);
      }
    },
    [onCharacterUpdate]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (onCharacterDelete) {
        await onCharacterDelete(id);
        if (expandedId === id) {
          setExpandedId(null);
        }
      }
    },
    [onCharacterDelete, expandedId]
  );

  if (characters.length === 0) {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="p-3 border-b shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">등장인물</span>
            </div>
            {onCharacterAdd && (
              <Button variant="ghost" size="sm" className="h-7" onClick={onCharacterAdd}>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">등장인물이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-3 border-b shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              등장인물 ({characters.length})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onCharacterAdd && (
              <Button variant="ghost" size="sm" className="h-7" onClick={onCharacterAdd}>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            )}
            {onShowRelationshipGraph && characters.length >= 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7"
                onClick={onShowRelationshipGraph}
              >
                <Network className="h-4 w-4 mr-1" />
                관계도
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="이름, 별명, 직업..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      {/* Character List - Wiki Style */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredCharacters.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            검색 결과가 없습니다
          </p>
        ) : (
          filteredCharacters.map((character) => (
            <CharacterWikiCard
              key={character.id}
              character={character}
              relationships={relationships}
              allCharacters={characters}
              isExpanded={expandedId === character.id}
              onToggle={() => handleToggle(character.id)}
              onUpdate={handleUpdate}
              onDelete={onCharacterDelete ? handleDelete : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
