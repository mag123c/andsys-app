"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // Pixel/Retro Separator: 픽셀 구분선
        "shrink-0 bg-foreground/30",
        // 수평
        "data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full",
        // 수직
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1",
        // 픽셀 점선 패턴 (선택적)
        // "data-[orientation=horizontal]:bg-[repeating-linear-gradient(90deg,var(--foreground)_0_4px,transparent_4px_8px)]",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
