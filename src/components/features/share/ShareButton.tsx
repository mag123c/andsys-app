"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShareDialog } from "./ShareDialog";
import type { Chapter, Project } from "@/repositories/types";

interface ShareButtonProps {
  project: Project;
  chapter: Chapter;
  disabled?: boolean;
}

export function ShareButton({ project, chapter, disabled }: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">공유</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>이 회차를 공유 링크로 공유합니다</TooltipContent>
      </Tooltip>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={project}
        chapter={chapter}
      />
    </>
  );
}
