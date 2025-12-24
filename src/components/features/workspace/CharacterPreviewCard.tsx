"use client";

import { User, X } from "lucide-react";
import type { Character } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CharacterPreviewCardProps {
  character: Character;
  onClose: () => void;
  className?: string;
}

export function CharacterPreviewCard({
  character,
  onClose,
  className,
}: CharacterPreviewCardProps) {
  return (
    <div className={cn("border rounded-lg bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h4 className="font-medium text-sm truncate">{character.name}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">닫기</span>
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Image + Basic Info */}
        <div className="flex gap-3">
          <div className="w-12 h-18 rounded bg-muted overflow-hidden shrink-0">
            {character.imageUrl ? (
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 text-xs space-y-1">
            {character.nickname && (
              <p className="text-muted-foreground truncate">
                별명: {character.nickname}
              </p>
            )}
            {character.age && (
              <p className="text-muted-foreground">나이: {character.age}세</p>
            )}
            {character.gender && (
              <p className="text-muted-foreground">성별: {character.gender}</p>
            )}
            {character.occupation && (
              <p className="text-muted-foreground truncate">
                직업: {character.occupation}
              </p>
            )}
          </div>
        </div>

        {/* Personality */}
        {character.personality && (
          <div>
            <p className="text-xs font-medium mb-1">성격</p>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {character.personality}
            </p>
          </div>
        )}

        {/* Background */}
        {character.background && (
          <div>
            <p className="text-xs font-medium mb-1">배경</p>
            <p className="text-xs text-muted-foreground line-clamp-3">
              {character.background}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
