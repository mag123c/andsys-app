import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // Base: Paper & Ink 뱃지 스타일 - 미니멀하고 세련된
  [
    "inline-flex items-center justify-center gap-1 px-2.5 py-0.5",
    "font-sans text-xs font-medium",
    "w-fit whitespace-nowrap shrink-0 select-none",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "transition-colors duration-200",
    "rounded-md",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default: 기본 뱃지
        default: [
          "bg-primary text-primary-foreground",
        ].join(" "),

        // Secondary: 보조 뱃지
        secondary: [
          "bg-secondary text-secondary-foreground",
        ].join(" "),

        // Destructive: 경고/위험
        destructive: [
          "bg-destructive text-white",
        ].join(" "),

        // Outline: 아웃라인 뱃지
        outline: [
          "bg-transparent text-foreground",
          "border border-border",
        ].join(" "),

        // Success: 성공/완료
        success: [
          "bg-emerald-100 text-emerald-800",
          "dark:bg-emerald-900/30 dark:text-emerald-400",
        ].join(" "),

        // Warning: 경고
        warning: [
          "bg-amber-100 text-amber-800",
          "dark:bg-amber-900/30 dark:text-amber-400",
        ].join(" "),

        // Info: 정보
        info: [
          "bg-sky-100 text-sky-800",
          "dark:bg-sky-900/30 dark:text-sky-400",
        ].join(" "),

        // Muted: 연한 뱃지
        muted: [
          "bg-muted text-muted-foreground",
        ].join(" "),

        // Pixel: 액센트 뱃지 (기존 pixel variant 호환용)
        pixel: [
          "bg-accent text-accent-foreground",
        ].join(" "),

        // Quest: 강조 뱃지 (기존 quest variant 호환용)
        quest: [
          "bg-accent text-accent-foreground",
        ].join(" "),

        // HP: 상태 뱃지 (기존 hp variant 호환용)
        hp: [
          "bg-rose-100 text-rose-800",
          "dark:bg-rose-900/30 dark:text-rose-400",
        ].join(" "),

        // MP: 상태 뱃지 (기존 mp variant 호환용)
        mp: [
          "bg-sky-100 text-sky-800",
          "dark:bg-sky-900/30 dark:text-sky-400",
        ].join(" "),

        // Legendary: 전설 등급 (기존 legendary variant 호환용)
        legendary: [
          "bg-amber-100 text-amber-900",
          "dark:bg-amber-900/30 dark:text-amber-300",
        ].join(" "),

        // Epic: 에픽 등급 (기존 epic variant 호환용)
        epic: [
          "bg-purple-100 text-purple-800",
          "dark:bg-purple-900/30 dark:text-purple-400",
        ].join(" "),

        // Rare: 레어 등급 (기존 rare variant 호환용)
        rare: [
          "bg-blue-100 text-blue-800",
          "dark:bg-blue-900/30 dark:text-blue-400",
        ].join(" "),
      },
      size: {
        default: "h-5 px-2.5 text-xs",
        sm: "h-4 px-2 text-[10px]",
        lg: "h-6 px-3 text-sm",
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
