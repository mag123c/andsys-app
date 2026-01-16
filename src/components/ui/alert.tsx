import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  // Pixel/Retro Alert: RPG 시스템 메시지 스타일
  [
    "relative w-full p-4",
    "border-4 border-foreground",
    "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.1),inset_4px_4px_0_0_rgba(255,255,255,0.2),4px_4px_0_0_rgba(0,0,0,0.4)]",
    "grid has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] grid-cols-[0_1fr]",
    "has-[>svg]:gap-x-3 gap-y-1 items-start",
    "[&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default: 기본 시스템 메시지
        default: [
          "bg-card text-card-foreground",
          "border-foreground/70",
        ].join(" "),

        // Destructive: 경고/에러 메시지
        destructive: [
          "bg-destructive/10 text-destructive",
          "border-destructive",
          "[&>svg]:text-destructive",
          "*:data-[slot=alert-description]:text-destructive/80",
          // 경고 깜빡임
          "animate-pulse",
        ].join(" "),

        // Success: 성공 메시지 (퀘스트 완료 스타일)
        success: [
          "bg-[var(--pixel-green)]/10 text-[var(--pixel-green)]",
          "border-[var(--pixel-green)]",
          "[&>svg]:text-[var(--pixel-green)]",
        ].join(" "),

        // Warning: 주의 메시지
        warning: [
          "bg-[var(--pixel-gold)]/10 text-[var(--pixel-dark)]",
          "border-[var(--pixel-gold)]",
          "[&>svg]:text-[var(--pixel-gold)]",
        ].join(" "),

        // Info: 정보 메시지 (NPC 대화 스타일)
        info: [
          "bg-[var(--pixel-blue)]/10 text-[var(--pixel-blue)]",
          "border-[var(--pixel-blue)]",
          "[&>svg]:text-[var(--pixel-blue)]",
        ].join(" "),

        // Quest: 퀘스트 알림 (황금 테두리)
        quest: [
          "bg-card text-card-foreground",
          "border-[var(--pixel-gold)]",
          // 반짝임 효과
          "before:absolute before:inset-2 before:border-2 before:border-[var(--pixel-gold)]/30 before:pointer-events-none",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4",
        "font-pixel text-xs uppercase tracking-wider",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1",
        "font-retro text-base leading-relaxed",
        "text-muted-foreground",
        "[&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
