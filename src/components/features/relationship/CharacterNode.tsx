"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CharacterNodeData extends Record<string, unknown> {
  name: string;
  imageUrl: string | null;
  nickname?: string | null;
  occupation?: string | null;
}

export type CharacterNodeType = Node<CharacterNodeData, "character">;

function CharacterNodeComponent({
  data,
  selected,
}: NodeProps<CharacterNodeType>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div
        className={cn(
          "px-3 py-2 rounded-lg border-2 bg-background shadow-sm transition-all",
          "min-w-[120px] max-w-[160px]",
          selected
            ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
            {data.imageUrl ? (
              <img
                src={data.imageUrl}
                alt={data.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm truncate">{data.name}</p>
            {(data.nickname || data.occupation) && (
              <p className="text-xs text-muted-foreground truncate">
                {data.nickname || data.occupation}
              </p>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </>
  );
}

export const CharacterNode = memo(CharacterNodeComponent);
