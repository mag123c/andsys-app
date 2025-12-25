"use client";

import { useMemo } from "react";
import { User } from "lucide-react";
import type { Relationship, Character } from "@/repositories/types";
import { RelationshipCard } from "./RelationshipCard";

interface CharacterRelationships {
  character: Character;
  relationships: Array<{
    relationship: Relationship;
    targetCharacter: Character;
    isReverse: boolean;
  }>;
}

interface RelationshipListProps {
  relationships: Relationship[];
  characters: Character[];
  onEdit: (relationship: Relationship) => void;
  onDelete: (id: string) => void;
}

export function RelationshipList({
  relationships,
  characters,
  onEdit,
  onDelete,
}: RelationshipListProps) {
  const characterMap = useMemo(() => {
    return new Map(characters.map((c) => [c.id, c]));
  }, [characters]);

  const groupedRelationships = useMemo(() => {
    const groups: Map<string, CharacterRelationships> = new Map();

    characters.forEach((character) => {
      groups.set(character.id, {
        character,
        relationships: [],
      });
    });

    relationships.forEach((rel) => {
      const fromChar = characterMap.get(rel.fromCharacterId);
      const toChar = characterMap.get(rel.toCharacterId);

      if (!fromChar || !toChar) return;

      // Add to fromCharacter's relationships
      const fromGroup = groups.get(rel.fromCharacterId);
      if (fromGroup) {
        fromGroup.relationships.push({
          relationship: rel,
          targetCharacter: toChar,
          isReverse: false,
        });
      }

      // If bidirectional, also add to toCharacter's relationships
      if (rel.bidirectional) {
        const toGroup = groups.get(rel.toCharacterId);
        if (toGroup) {
          toGroup.relationships.push({
            relationship: rel,
            targetCharacter: fromChar,
            isReverse: true,
          });
        }
      }
    });

    // Filter out characters with no relationships and sort by character order
    return Array.from(groups.values())
      .filter((g) => g.relationships.length > 0)
      .sort((a, b) => a.character.order - b.character.order);
  }, [relationships, characters, characterMap]);

  if (groupedRelationships.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {groupedRelationships.map(({ character, relationships: charRels }) => (
        <div key={character.id} className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
              {character.imageUrl ? (
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
            <h3 className="font-semibold">{character.name}의 관계</h3>
          </div>
          <div className="space-y-2 pl-11">
            {charRels.map(({ relationship, targetCharacter, isReverse }) => (
              <RelationshipCard
                key={`${relationship.id}-${isReverse ? "r" : "f"}`}
                relationship={relationship}
                targetCharacter={targetCharacter}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
