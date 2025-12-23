"use client";

import { useState, useEffect } from "react";
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
import type { Chapter, UpdateChapterInput } from "@/repositories/types";
import { ChapterCard } from "./ChapterCard";

interface SortableChapterItemProps {
  chapter: Chapter;
  projectId: string;
  onDelete: (id: string) => void;
  onUpdate: (data: UpdateChapterInput) => Promise<void>;
}

function SortableChapterItem({
  chapter,
  projectId,
  onDelete,
  onUpdate,
}: SortableChapterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ChapterCard
        chapter={chapter}
        projectId={projectId}
        onDelete={onDelete}
        onUpdate={onUpdate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

interface SortableChapterListProps {
  chapters: Chapter[];
  projectId: string;
  onDelete: (id: string) => void;
  onUpdate: (chapterId: string, data: UpdateChapterInput) => Promise<void>;
  onReorder: (chapterIds: string[]) => Promise<void>;
}

export function SortableChapterList({
  chapters,
  projectId,
  onDelete,
  onUpdate,
  onReorder,
}: SortableChapterListProps) {
  const [items, setItems] = useState(chapters);

  // chapters prop이 변경되면 items 동기화
  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

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

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // 서버에 순서 저장
      const chapterIds = newItems.map((item) => item.id);
      await onReorder(chapterIds);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((chapter) => (
            <SortableChapterItem
              key={chapter.id}
              chapter={chapter}
              projectId={projectId}
              onDelete={onDelete}
              onUpdate={(data) => onUpdate(chapter.id, data)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
