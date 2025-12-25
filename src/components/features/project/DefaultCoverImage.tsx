import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultCoverImageProps {
  className?: string;
}

export function DefaultCoverImage({ className }: DefaultCoverImageProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded bg-muted w-[100px] h-[150px]",
        className
      )}
    >
      <BookOpen className="h-10 w-10 text-muted-foreground" />
    </div>
  );
}
