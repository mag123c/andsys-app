"use client";

import { useRef, useState } from "react";
import { Loader2, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DefaultCoverImage } from "./DefaultCoverImage";

interface CoverImageUploadProps {
  imageUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function CoverImageUpload({
  imageUrl,
  onUpload,
  onRemove,
  disabled,
  className,
}: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = isUploading || isRemoving;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClick = () => {
    if (!isLoading && !disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading || disabled}
        className={cn(
          "relative w-[100px] h-[150px] rounded overflow-hidden",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-opacity",
          isLoading && "opacity-50 cursor-wait",
          !isLoading && !disabled && "cursor-pointer hover:opacity-80"
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="표지 이미지"
            className="w-full h-full object-cover"
          />
        ) : (
          <DefaultCoverImage />
        )}

        {/* Overlay */}
        {!isLoading && !imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <ImagePlus className="h-6 w-6 text-white" />
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </button>

      {/* Remove button */}
      {imageUrl && !isLoading && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6"
          onClick={handleRemove}
          disabled={disabled}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">표지 이미지 삭제</span>
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading || disabled}
      />
    </div>
  );
}
