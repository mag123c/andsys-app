import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: Pixel/Retro RPG 버튼 스타일
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-pixel text-xs",
    "transition-all duration-100 ease-linear",
    "disabled:pointer-events-none disabled:opacity-50 disabled:grayscale",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
    "outline-none cursor-pointer select-none uppercase tracking-wider",
    // 기본 픽셀 보더 시스템
    "border-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primary: RPG 메인 액션 버튼 (3D 픽셀 효과)
        default: [
          "bg-primary text-primary-foreground",
          // 3D 픽셀 보더 효과
          "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.2),4px_4px_0_0_rgba(0,0,0,0.5)]",
          // 호버: 살짝 들어올림
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.2),6px_6px_0_0_rgba(0,0,0,0.5)]",
          // 클릭: 눌림 효과
          "active:translate-x-[2px] active:translate-y-[2px]",
          "active:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.3),inset_-2px_-2px_0_0_rgba(255,255,255,0.1)]",
          // 포커스
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ].join(" "),

        // Destructive: 위험 액션 (빨간 픽셀 버튼)
        destructive: [
          "bg-destructive text-white",
          "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.4),inset_4px_4px_0_0_rgba(255,255,255,0.15),4px_4px_0_0_rgba(0,0,0,0.5)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.4),inset_4px_4px_0_0_rgba(255,255,255,0.15),6px_6px_0_0_rgba(0,0,0,0.5)]",
          "active:translate-x-[2px] active:translate-y-[2px]",
          "active:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.4)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive",
        ].join(" "),

        // Outline: 픽셀 아웃라인 (인벤토리 슬롯 스타일)
        outline: [
          "bg-transparent text-foreground",
          "border-4 border-current",
          "shadow-[4px_4px_0_0_currentColor]",
          "hover:bg-primary/10 hover:text-primary hover:border-primary",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[6px_6px_0_0_currentColor]",
          "active:translate-x-[2px] active:translate-y-[2px]",
          "active:shadow-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ].join(" "),

        // Secondary: 보조 액션 (연한 픽셀 버튼)
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-[inset_-3px_-3px_0_0_rgba(0,0,0,0.2),inset_3px_3px_0_0_rgba(255,255,255,0.3),3px_3px_0_0_rgba(0,0,0,0.3)]",
          "hover:translate-x-[-1px] hover:translate-y-[-1px]",
          "hover:shadow-[inset_-3px_-3px_0_0_rgba(0,0,0,0.2),inset_3px_3px_0_0_rgba(255,255,255,0.3),4px_4px_0_0_rgba(0,0,0,0.3)]",
          "active:translate-x-[1px] active:translate-y-[1px]",
          "active:shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.2)]",
        ].join(" "),

        // Ghost: 투명 (메뉴 아이템 스타일)
        ghost: [
          "bg-transparent text-foreground",
          "hover:bg-primary/20 hover:text-primary",
          "active:bg-primary/30",
          // 픽셀 밑줄 효과
          "relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-1 after:bg-current",
          "hover:after:w-full after:transition-all after:duration-200",
        ].join(" "),

        // Link: 텍스트 링크 (8bit 스타일)
        link: [
          "text-primary bg-transparent p-0 h-auto",
          "hover:text-primary/80",
          // 픽셀 점선 밑줄
          "underline decoration-2 decoration-dotted underline-offset-4",
          "hover:decoration-solid",
        ].join(" "),

        // Quest: 퀘스트 수락 버튼 (특별 스타일)
        quest: [
          "bg-[var(--pixel-gold)] text-[var(--pixel-dark)]",
          "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.4),4px_4px_0_0_rgba(0,0,0,0.5)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.4),6px_6px_0_0_rgba(0,0,0,0.5)]",
          "active:translate-x-[2px] active:translate-y-[2px]",
          "active:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.3)]",
        ].join(" "),

        // Pixel: 순수 픽셀 보더 (Game Boy 스타일)
        pixel: [
          "bg-background text-foreground",
          "border-4 border-foreground",
          "hover:bg-foreground hover:text-background",
          "active:bg-foreground/80",
          // 단순한 그림자
          "shadow-[4px_4px_0_0_var(--foreground)]",
          "hover:shadow-[2px_2px_0_0_var(--foreground)]",
          "active:shadow-none active:translate-x-1 active:translate-y-1",
        ].join(" "),

        // Retro: CRT 스타일
        retro: [
          "bg-[var(--pixel-green)] text-white",
          "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.2),4px_4px_0_0_rgba(0,0,0,0.5)]",
          "hover:translate-x-[-2px] hover:translate-y-[-2px]",
          "hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3),inset_4px_4px_0_0_rgba(255,255,255,0.2),6px_6px_0_0_rgba(0,0,0,0.5)]",
          "active:translate-x-[2px] active:translate-y-[2px]",
          "active:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.3)]",
        ].join(" "),
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 px-4 text-[10px] has-[>svg]:px-3",
        lg: "h-12 px-8 text-sm has-[>svg]:px-6",
        xl: "h-14 px-10 text-base font-bold has-[>svg]:px-8",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
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
