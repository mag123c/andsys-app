"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // Pixel/Retro Tooltip: RPG 말풍선 스타일
          "z-50 w-fit px-3 py-2",
          "font-retro text-sm leading-tight",
          "bg-[var(--pixel-dark)] text-[var(--pixel-cream)]",
          // 픽셀 보더
          "border-2 border-[var(--pixel-cream)]",
          "shadow-[2px_2px_0_0_rgba(0,0,0,0.5)]",
          // 애니메이션
          "animate-in fade-in-0 zoom-in-95 duration-100",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
        {/* 픽셀 화살표 (CSS로 구현) */}
        <TooltipPrimitive.Arrow
          className={cn(
            "fill-[var(--pixel-dark)]",
            "drop-shadow-[1px_1px_0_var(--pixel-cream)]",
          )}
          width={12}
          height={6}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

// 추가: 아이템 정보 툴팁 (RPG 아이템 설명 스타일)
function ItemTooltip({
  className,
  sideOffset = 4,
  children,
  rarity = "common",
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  rarity?: "common" | "rare" | "epic" | "legendary"
}) {
  const rarityColors = {
    common: "border-foreground/50",
    rare: "border-[var(--pixel-purple)]",
    epic: "border-[var(--pixel-coral)]",
    legendary: "border-[var(--pixel-gold)]",
  }

  const rarityGlow = {
    common: "",
    rare: "",
    epic: "",
    legendary: "",
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          // 아이템 툴팁 스타일
          "z-50 w-fit min-w-[200px] px-4 py-3",
          "font-retro text-sm leading-relaxed",
          "bg-[var(--pixel-dark)] text-[var(--pixel-cream)]",
          // 레어도별 보더 색상
          "border-4",
          rarityColors[rarity],
          rarityGlow[rarity],
          // 내부 3D 효과
          "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.1),4px_4px_0_0_rgba(0,0,0,0.5)]",
          // 애니메이션
          "animate-in fade-in-0 zoom-in-95 duration-100",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, ItemTooltip }
