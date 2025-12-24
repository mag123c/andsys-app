"use client";

import { useState, useMemo } from "react";
import { Search, User, Users } from "lucide-react";
import type { Character } from "@/repositories/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CharacterPreviewCard } from "./CharacterPreviewCard";

interface RightSidebarCharactersProps {
  characters: Character[];
  className?: string;
}

export function RightSidebarCharacters({
  characters,
  className,
}: RightSidebarCharactersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

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

  if (characters.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">등장인물</span>
        </div>
        <p className="text-xs text-muted-foreground text-center py-4">
          등장인물이 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            등장인물 ({characters.length})
          </span>
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

      {/* Selected Character Preview */}
      {selectedCharacter && (
        <div className="p-2 border-b">
          <CharacterPreviewCard
            character={selectedCharacter}
            onClose={() => setSelectedCharacter(null)}
          />
        </div>
      )}

      {/* Character List */}
      <div className="flex-1 overflow-y-auto">
        {filteredCharacters.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            검색 결과가 없습니다
          </p>
        ) : (
          <ul className="p-2 space-y-1">
            {filteredCharacters.map((character) => (
              <li key={character.id}>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCharacter(
                      selectedCharacter?.id === character.id ? null : character
                    )
                  }
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm",
                    "hover:bg-accent transition-colors",
                    selectedCharacter?.id === character.id &&
                      "bg-accent text-accent-foreground"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-muted overflow-hidden shrink-0">
                    {character.imageUrl ? (
                      <img
                        src={character.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <span className="truncate">{character.name}</span>
                  {character.nickname && (
                    <span className="text-xs text-muted-foreground truncate">
                      ({character.nickname})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
