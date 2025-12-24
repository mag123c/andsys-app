"use client";

import { useState } from "react";
import { MoreVertical, Trash2, GripVertical, Pencil, User } from "lucide-react";
import type { Character } from "@/repositories/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function CharacterCard({
  character,
  onEdit,
  onDelete,
  dragHandleProps,
}: CharacterCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col rounded-lg border bg-card overflow-hidden transition-colors hover:bg-accent/50">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="absolute top-2 left-2 z-10 cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <div
          className="relative aspect-[2/3] bg-muted cursor-pointer"
          onClick={() => onEdit(character)}
        >
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-3 flex items-center justify-between gap-2">
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onEdit(character)}
          >
            <h3 className="font-medium truncate">{character.name}</h3>
            {character.nickname && (
              <p className="text-xs text-muted-foreground truncate">
                {character.nickname}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 shrink-0",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">메뉴 열기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(character)}>
                <Pencil className="mr-2 h-4 w-4" />
                편집
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>등장인물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{character.name}&quot;을(를) 삭제하시겠습니까?
              <br />
              삭제된 등장인물은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(character.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
