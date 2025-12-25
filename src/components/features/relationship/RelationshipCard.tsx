"use client";

import { useState } from "react";
import { Pencil, Trash2, User } from "lucide-react";
import type { Relationship, Character } from "@/repositories/types";
import { RELATIONSHIP_TYPES } from "@/repositories/types";
import { Button } from "@/components/ui/button";
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

interface RelationshipCardProps {
  relationship: Relationship;
  targetCharacter: Character;
  onEdit: (relationship: Relationship) => void;
  onDelete: (id: string) => void;
}

export function RelationshipCard({
  relationship,
  targetCharacter,
  onEdit,
  onDelete,
}: RelationshipCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const typeConfig = RELATIONSHIP_TYPES.find((t) => t.type === relationship.type);

  return (
    <>
      <div className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted overflow-hidden">
          {targetCharacter.imageUrl ? (
            <img
              src={targetCharacter.imageUrl}
              alt={targetCharacter.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{targetCharacter.name}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs"
              style={{ backgroundColor: `${typeConfig?.color}20`, color: typeConfig?.color }}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: typeConfig?.color }}
              />
              {typeConfig?.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(relationship)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">편집</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">삭제</span>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>관계 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 관계를 삭제하시겠습니까?
              <br />
              삭제된 관계는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(relationship.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
