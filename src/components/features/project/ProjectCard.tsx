"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Trash2 } from "lucide-react";
import type { Project } from "@/repositories/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { DefaultCoverImage } from "./DefaultCoverImage";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="group transition-shadow hover:shadow-md">
        <div className="flex p-4 gap-4">
          {/* Cover Image */}
          <Link href={`/novels/${project.id}`} className="shrink-0">
            {project.coverImageUrl ? (
              <img
                src={project.coverImageUrl}
                alt={`${project.title} 표지`}
                className="w-[50px] h-[75px] rounded object-cover"
              />
            ) : (
              <DefaultCoverImage size="sm" />
            )}
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <CardHeader className="p-0">
              <Link href={`/novels/${project.id}`} className="block">
                <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                  {project.title}
                </CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {project.description}
                  </CardDescription>
                )}
              </Link>
              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </CardHeader>
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {project.genre && (
                  <span className="rounded-full bg-secondary px-2 py-0.5">
                    {project.genre}
                  </span>
                )}
                <span>수정: {formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>소설 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{project.title}&quot; 소설을 삭제하시겠습니까?
              <br />
              삭제된 소설은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => onDelete(project.id)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
