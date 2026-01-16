import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base: Pixel/Retro 뱃지 스타일
  [
    "inline-flex items-center justify-center gap-1.5 px-3 py-1",
    "font-pixel text-[10px] uppercase tracking-wider",
    "w-fit whitespace-nowrap shrink-0 select-none",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "transition-all duration-100",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default: 기본 픽셀 뱃지
        default: [
          "bg-primary text-primary-foreground",
          "border-2 border-foreground/30",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
          "[a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px]",
          "[a&]:hover:shadow-[3px_3px_0_0_rgba(0,0,0,0.4)]",
        ].join(" "),

        // Secondary: 보조 뱃지
        secondary: [
          "bg-secondary text-secondary-foreground",
          "border-2 border-foreground/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.2)]",
          "[a&]:hover:bg-secondary/80",
        ].join(" "),

        // Destructive: 경고/위험
        destructive: [
          "bg-destructive text-white",
          "border-2 border-foreground/30",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
          // 깜빡임 효과
          "animate-pulse",
          "[a&]:hover:animate-none [a&]:hover:brightness-110",
        ].join(" "),

        // Outline: 아웃라인 뱃지
        outline: [
          "bg-transparent text-foreground",
          "border-2 border-current",
          "shadow-[2px_2px_0_0_currentColor]",
          "[a&]:hover:bg-primary/10 [a&]:hover:text-primary [a&]:hover:border-primary",
        ].join(" "),

        // Pixel: 순수 픽셀 스타일 (Game Boy)
        pixel: [
          "bg-background text-foreground",
          "border-2 border-foreground",
          "shadow-[2px_2px_0_0_var(--foreground)]",
          "[a&]:hover:bg-foreground [a&]:hover:text-background",
        ].join(" "),

        // Quest: 퀘스트 아이템 뱃지
        quest: [
          "bg-[var(--pixel-gold)] text-[var(--pixel-dark)]",
          "border-2 border-[var(--pixel-dark)]/30",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
        ].join(" "),

        // Rare: 레어 아이템 (보라색)
        rare: [
          "bg-[var(--pixel-purple)] text-white",
          "border-2 border-white/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
        ].join(" "),

        // Epic: 에픽 아이템 (주황색)
        epic: [
          "bg-[var(--pixel-coral)] text-white",
          "border-2 border-white/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
        ].join(" "),

        // Legendary: 전설 아이템 (금색 + 깜빡임)
        legendary: [
          "bg-gradient-to-r from-[var(--pixel-gold)] via-[var(--pixel-cream)] to-[var(--pixel-gold)]",
          "text-[var(--pixel-dark)]",
          "border-2 border-[var(--pixel-dark)]/30",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.4)]",
          "animate-shimmer bg-[length:200%_100%]",
        ].join(" "),

        // Success: 성공/완료
        success: [
          "bg-[var(--pixel-green)] text-white",
          "border-2 border-foreground/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]",
        ].join(" "),

        // Warning: 경고
        warning: [
          "bg-[var(--pixel-gold)] text-[var(--pixel-dark)]",
          "border-2 border-foreground/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]",
        ].join(" "),

        // Info: 정보
        info: [
          "bg-[var(--pixel-blue)] text-white",
          "border-2 border-foreground/20",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]",
        ].join(" "),

        // HP: 체력 바 스타일
        hp: [
          "bg-[var(--pixel-red)] text-white",
          "border-2 border-[var(--pixel-dark)]",
          "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.2)]",
        ].join(" "),

        // MP: 마나 바 스타일
        mp: [
          "bg-[var(--pixel-blue)] text-white",
          "border-2 border-[var(--pixel-dark)]",
          "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.2)]",
        ].join(" "),

        // XP: 경험치 바 스타일
        xp: [
          "bg-[var(--pixel-green)] text-white",
          "border-2 border-[var(--pixel-dark)]",
          "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.2)]",
        ].join(" "),
      },
      size: {
        default: "h-6 px-3 text-[10px]",
        sm: "h-5 px-2 text-[8px]",
        lg: "h-7 px-4 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
