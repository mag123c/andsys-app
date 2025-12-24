import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DefaultCoverImageProps {
  className?: string;
  size?: "sm" | "md";
}

export function DefaultCoverImage({
  className,
  size = "md",
}: DefaultCoverImageProps) {
  const sizeClasses = {
    sm: "w-[50px] h-[75px]",
    md: "w-[100px] h-[150px]",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded bg-muted",
        sizeClasses[size],
        className
      )}
    >
      <BookOpen className={cn("text-muted-foreground", iconSizes[size])} />
    </div>
  );
}
