import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: Paper & Ink 버튼 스타일 - 미니멀하고 세련된
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans text-sm font-medium",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary: 메인 액션 - 잉크 블랙
        default: [
          "bg-primary text-primary-foreground",
          "rounded-md",
          "shadow-sm",
          "hover:bg-primary/90",
          "active:scale-[0.98]",
        ].join(" "),

        // Destructive: 위험 액션
        destructive: [
          "bg-destructive text-white",
          "rounded-md",
          "shadow-sm",
          "hover:bg-destructive/90",
          "active:scale-[0.98]",
        ].join(" "),

        // Outline: 테두리만
        outline: [
          "bg-transparent text-foreground",
          "border border-border",
          "rounded-md",
          "hover:bg-secondary hover:border-foreground/20",
          "active:scale-[0.98]",
        ].join(" "),

        // Secondary: 보조 액션
        secondary: [
          "bg-secondary text-secondary-foreground",
          "rounded-md",
          "hover:bg-secondary/80",
          "active:scale-[0.98]",
        ].join(" "),

        // Ghost: 투명 배경
        ghost: [
          "bg-transparent text-foreground",
          "rounded-md",
          "hover:bg-secondary",
          "active:bg-secondary/80",
        ].join(" "),

        // Link: 텍스트 링크
        link: [
          "text-accent bg-transparent p-0 h-auto",
          "hover:text-foreground",
          "underline-offset-4 hover:underline",
        ].join(" "),

        // Soft: 부드러운 배경색
        soft: [
          "bg-muted text-muted-foreground",
          "rounded-md",
          "hover:bg-muted/80 hover:text-foreground",
          "active:scale-[0.98]",
        ].join(" "),

        // Pixel: 액센트 버튼 (기존 pixel variant 호환용)
        pixel: [
          "bg-accent text-accent-foreground",
          "rounded-md",
          "shadow-sm",
          "hover:bg-accent/90",
          "active:scale-[0.98]",
        ].join(" "),

        // Quest: 강조 버튼 (기존 quest variant 호환용)
        quest: [
          "bg-accent text-accent-foreground",
          "rounded-md",
          "shadow-sm",
          "hover:bg-accent/90",
          "active:scale-[0.98]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base font-semibold",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
