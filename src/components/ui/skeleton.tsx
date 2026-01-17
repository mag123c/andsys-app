import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Pixel/Retro Skeleton: 로딩 표시
        "bg-muted/50",
        "border-2 border-foreground/20",
        // 픽셀 스캔라인 애니메이션
        "relative overflow-hidden",
        "after:absolute after:inset-0",
        "after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)]",
        "after:animate-shimmer after:bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
