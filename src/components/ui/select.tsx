"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

import { cn } from "@/lib/utils"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Pixel/Retro Select Trigger
        "flex w-fit items-center justify-between gap-2 px-4 py-2",
        "font-retro text-lg",
        "bg-card text-card-foreground",
        // 픽셀 보더
        "border-4 border-foreground",
        "shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.1),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),4px_4px_0_0_rgba(0,0,0,0.4)]",
        // 플레이스홀더
        "data-[placeholder]:text-muted-foreground",
        // 사이즈
        "data-[size=default]:h-10 data-[size=sm]:h-8 data-[size=sm]:text-base",
        // 호버
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        "hover:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.1),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),6px_6px_0_0_rgba(0,0,0,0.4)]",
        // 포커스
        "focus:border-primary focus:outline-none",
        // 에러 상태
        "aria-invalid:border-destructive",
        // 비활성화
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
        // 트랜지션
        "transition-all duration-100",
        // Value 스타일링
        "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        {/* 픽셀 화살표 아이콘 */}
        <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor" className="ml-2 opacity-70">
          <rect x="0" y="0" width="2" height="2" />
          <rect x="2" y="2" width="2" height="2" />
          <rect x="4" y="4" width="2" height="2" />
          <rect x="6" y="4" width="2" height="2" />
          <rect x="8" y="2" width="2" height="2" />
          <rect x="10" y="0" width="2" height="2" />
        </svg>
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // Pixel/Retro Select Content: 드롭다운 메뉴 스타일
          "relative z-50 min-w-[8rem] overflow-hidden",
          "bg-popover text-popover-foreground",
          // 픽셀 보더
          "border-4 border-foreground",
          "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.1),inset_4px_4px_0_0_rgba(255,255,255,0.2),8px_8px_0_0_rgba(0,0,0,0.5)]",
          // 애니메이션
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
          "duration-100",
          // 위치 조정
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-2",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "font-pixel text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-1.5",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Pixel/Retro Select Item
        "relative flex w-full cursor-pointer items-center gap-2 py-2 pr-8 pl-3",
        "font-retro text-base",
        "outline-none select-none",
        // 호버/포커스 상태
        "focus:bg-primary/20 focus:text-primary",
        // 선택된 아이템은 하이라이트
        "data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary",
        // 픽셀 밑줄 호버 효과
        "relative after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-current after:scale-x-0",
        "focus:after:scale-x-100 after:transition-transform after:duration-100",
        // 비활성화
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-4 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          {/* 픽셀 체크 아이콘 */}
          <svg width="10" height="8" viewBox="0 0 10 8" fill="currentColor">
            <rect x="0" y="4" width="2" height="2" />
            <rect x="2" y="6" width="2" height="2" />
            <rect x="4" y="4" width="2" height="2" />
            <rect x="6" y="2" width="2" height="2" />
            <rect x="8" y="0" width="2" height="2" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        // 픽셀 구분선
        "pointer-events-none -mx-1 my-2 h-1 bg-foreground/20",
        className
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1",
        "hover:bg-primary/10",
        className
      )}
      {...props}
    >
      {/* 픽셀 위쪽 화살표 */}
      <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
        <rect x="4" y="0" width="2" height="2" />
        <rect x="6" y="0" width="2" height="2" />
        <rect x="2" y="2" width="2" height="2" />
        <rect x="8" y="2" width="2" height="2" />
        <rect x="0" y="4" width="2" height="2" />
        <rect x="10" y="4" width="2" height="2" />
      </svg>
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-pointer items-center justify-center py-1",
        "hover:bg-primary/10",
        className
      )}
      {...props}
    >
      {/* 픽셀 아래쪽 화살표 */}
      <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
        <rect x="0" y="0" width="2" height="2" />
        <rect x="10" y="0" width="2" height="2" />
        <rect x="2" y="2" width="2" height="2" />
        <rect x="8" y="2" width="2" height="2" />
        <rect x="4" y="4" width="2" height="2" />
        <rect x="6" y="4" width="2" height="2" />
      </svg>
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
