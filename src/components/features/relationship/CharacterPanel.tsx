"use client";

import { useMemo } from "react";
import { Users } from "lucide-react";
import type { Character } from "@/repositories/types";
import { DraggableCharacter } from "./DraggableCharacter";

interface CharacterPanelProps {
  characters: Character[];
  nodesOnGraph: Set<string>;
  onDragStart: (event: React.DragEvent, character: Character) => void;
}

export function CharacterPanel({
  characters,
  nodesOnGraph,
  onDragStart,
}: CharacterPanelProps) {
  const sortedCharacters = useMemo(() => {
    // 그래프에 없는 캐릭터를 위로
    return [...characters].sort((a, b) => {
      const aOnGraph = nodesOnGraph.has(a.id);
      const bOnGraph = nodesOnGraph.has(b.id);
      if (aOnGraph === bOnGraph) return a.order - b.order;
      return aOnGraph ? 1 : -1;
    });
  }, [characters, nodesOnGraph]);

  const availableCount = characters.length - nodesOnGraph.size;

  return (
    <div className="w-64 border-l bg-background flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">등장인물</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {availableCount > 0
            ? `${availableCount}명 추가 가능`
            : "모든 캐릭터가 그래프에 있습니다"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Users className="h-8 w-8 mb-2" />
            <p className="text-sm">등장인물이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedCharacters.map((character) => (
              <DraggableCharacter
                key={character.id}
                character={character}
                isOnGraph={nodesOnGraph.has(character.id)}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-muted/30 space-y-1">
        <p className="text-xs text-muted-foreground text-center">
          캐릭터를 그래프로 드래그하세요
        </p>
        <p className="text-xs text-muted-foreground text-center">
          선택 후 Delete로 삭제
        </p>
      </div>
    </div>
  );
}
