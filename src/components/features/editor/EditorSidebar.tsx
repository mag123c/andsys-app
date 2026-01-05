"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project, Chapter } from "@/repositories/types";
import { cn } from "@/lib/utils";
import { formatCharacterCount, formatEpisodeNumber } from "@/lib/format";
import { useAuth } from "@/components/providers/AuthProvider";
import { SidebarProfile } from "@/components/features/workspace";
import { SettingsModal } from "@/components/features/settings";

interface SortableSidebarItemProps {
  chapter: Chapter;
  projectId: string;
  currentChapterId: string;
  enableDrag?: boolean;
}

function SortableSidebarItem({
  chapter,
  projectId,
  currentChapterId,
  enableDrag = false,
}: SortableSidebarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id, disabled: !enableDrag });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = chapter.id === currentChapterId;

  return (
    <li ref={setNodeRef} style={style}>
      <div className="flex items-center">
        {enableDrag && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab text-muted-foreground hover:text-foreground p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3" />
          </div>
        )}
        <Link
          href={`/novels/${projectId}/chapters/${chapter.id}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors flex-1",
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          )}
        >
          <span className="text-xs shrink-0 w-10 text-center">
            {formatEpisodeNumber(chapter.order)}
          </span>
          <span className="truncate flex-1">{chapter.title}</span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatCharacterCount(chapter.wordCount)}
          </span>
        </Link>
      </div>
    </li>
  );
}

interface EditorSidebarProps {
  project: Project;
  chapters: Chapter[];
  currentChapterId: string;
  collapsed?: boolean;
  onToggle?: () => void;
  onReorder?: (chapterIds: string[]) => Promise<void>;
  className?: string;
}

export function EditorSidebar({
  project,
  chapters,
  currentChapterId,
  collapsed = false,
  onToggle,
  onReorder,
  className,
}: EditorSidebarProps) {
  const { auth } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [items, setItems] = useState(chapters);

  // chapters prop이 변경되면 items 동기화
  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  const isLoading = auth.status === "loading";
  const isGuest = auth.status === "guest";
  const userName = auth.status === "authenticated" ? auth.user.displayName || auth.user.email : null;
  const avatarUrl = auth.status === "authenticated" ? auth.user.avatarUrl : null;

  const enableDrag = !!onReorder;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // 서버에 순서 저장
      const chapterIds = newItems.map((item) => item.id);
      await onReorder(chapterIds);
    }
  };

  if (collapsed) {
    return (
      <>
        <aside className={cn("flex flex-col h-full w-12", className)}>
          <div className="flex-1 flex flex-col items-center py-4 gap-2">
            <Link
              href={`/novels/${project.id}`}
              className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
              title={project.title}
            >
              <FolderOpen className="h-4 w-4" />
            </Link>
          </div>
          <SidebarProfile
            isLoading={isLoading}
            isGuest={isGuest}
            userName={userName}
            avatarUrl={avatarUrl}
            collapsed={true}
            onToggle={onToggle}
            showToggle={!!onToggle}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        </aside>
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      </>
    );
  }

  return (
    <aside className={cn("flex flex-col h-full w-64", className)}>
      <div className="p-4 border-b">
        <Link
          href={`/novels/${project.id}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          <span className="font-medium truncate">{project.title}</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {enableDrag ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <ul className="space-y-1 group">
                {items.map((chapter) => (
                  <SortableSidebarItem
                    key={chapter.id}
                    chapter={chapter}
                    projectId={project.id}
                    currentChapterId={currentChapterId}
                    enableDrag={enableDrag}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <ul className="space-y-1">
            {chapters.map((chapter) => (
              <SortableSidebarItem
                key={chapter.id}
                chapter={chapter}
                projectId={project.id}
                currentChapterId={currentChapterId}
                enableDrag={false}
              />
            ))}
          </ul>
        )}
      </nav>

      <SidebarProfile
        isLoading={isLoading}
        isGuest={isGuest}
        userName={userName}
        avatarUrl={avatarUrl}
        collapsed={false}
        onToggle={onToggle}
        showToggle={!!onToggle}
        onSettingsClick={() => setSettingsOpen(true)}
      />
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  );
}
