"use client";

import { User } from "lucide-react";
import type { Character } from "@/repositories/types";
import { cn } from "@/lib/utils";

interface DraggableCharacterProps {
  character: Character;
  isOnGraph: boolean;
  onDragStart: (event: React.DragEvent, character: Character) => void;
}

export function DraggableCharacter({
  character,
  isOnGraph,
  onDragStart,
}: DraggableCharacterProps) {
  const handleDragStart = (event: React.DragEvent) => {
    if (isOnGraph) {
      event.preventDefault();
      return;
    }
    onDragStart(event, character);
  };

  return (
    <div
      draggable={!isOnGraph}
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
        isOnGraph
          ? "opacity-50 cursor-not-allowed bg-muted/50"
          : "cursor-grab hover:bg-accent active:cursor-grabbing"
      )}
    >
      <div className="h-8 w-8 rounded-full bg-muted overflow-hidden shrink-0">
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
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{character.name}</p>
        {character.nickname && (
          <p className="text-xs text-muted-foreground truncate">
            {character.nickname}
          </p>
        )}
      </div>
      {isOnGraph && (
        <span className="text-xs text-muted-foreground shrink-0">추가됨</span>
      )}
    </div>
  );
}
