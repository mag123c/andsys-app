"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Pixel/Retro 오버레이: CRT 스캔라인 효과
        "fixed inset-0 z-50",
        "bg-[var(--pixel-dark)]/80",
        // 스캔라인 패턴
        "bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]",
        // 애니메이션
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      {/* 중앙 정렬 wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Content
          data-slot="dialog-content"
          aria-describedby={undefined}
          className={cn(
            // Pixel/Retro Dialog: RPG 대화창 스타일
            "w-full max-w-lg grid gap-4 p-6 outline-none",
            "bg-card text-card-foreground",
            // 픽셀 이중 테두리
            "border-4 border-foreground",
            // 3D 픽셀 효과
            "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.15),inset_4px_4px_0_0_rgba(255,255,255,0.3),8px_8px_0_0_rgba(0,0,0,0.5)]",
            // 코너 장식 (RPG 윈도우 스타일)
            "relative",
            "before:absolute before:inset-2 before:border-2 before:border-foreground/20 before:pointer-events-none",
            // 애니메이션 (픽셀 스케일 효과)
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "duration-100",
            className
          )}
          {...props}
        >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              // 픽셀 닫기 버튼
              "absolute top-2 right-2 size-8",
              "flex items-center justify-center",
              "bg-destructive text-white",
              "border-2 border-foreground/30",
              "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.2),2px_2px_0_0_rgba(0,0,0,0.4)]",
              "font-pixel text-xs",
              // 호버 효과
              "hover:translate-x-[-1px] hover:translate-y-[-1px]",
              "hover:shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.3),inset_2px_2px_0_0_rgba(255,255,255,0.2),3px_3px_0_0_rgba(0,0,0,0.4)]",
              // 클릭 효과
              "active:translate-x-[1px] active:translate-y-[1px]",
              "active:shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.3)]",
              "transition-all duration-100",
              "disabled:pointer-events-none"
            )}
          >
            {/* 픽셀 X 아이콘 */}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="2" height="2" />
              <rect x="2" y="2" width="2" height="2" />
              <rect x="4" y="4" width="2" height="2" />
              <rect x="6" y="2" width="2" height="2" />
              <rect x="8" y="0" width="2" height="2" />
              <rect x="0" y="8" width="2" height="2" />
              <rect x="2" y="6" width="2" height="2" />
              <rect x="6" y="6" width="2" height="2" />
              <rect x="8" y="8" width="2" height="2" />
            </svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        // 하단 픽셀 구분선
        "pb-4 border-b-4 border-foreground/20",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        // 상단 픽셀 구분선
        "pt-4 border-t-4 border-foreground/20",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        // 픽셀 폰트 타이틀
        "font-pixel text-sm leading-tight tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "font-retro text-base text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
