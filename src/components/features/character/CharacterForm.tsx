"use client";

import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import type {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
  CustomField,
} from "@/repositories/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { processCharacterImage } from "@/lib/image-utils";

const MBTI_OPTIONS = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

const GENDER_OPTIONS = ["남성", "여성", "기타"] as const;

interface CharacterFormData {
  name: string;
  nickname: string;
  age: string;
  gender: string;
  race: string;
  imageUrl: string | null;
  height: string;
  weight: string;
  appearance: string;
  mbti: string;
  personality: string;
  education: string;
  occupation: string;
  affiliation: string;
  background: string;
  customFields: CustomField[];
}

function characterToFormData(character?: Character): CharacterFormData {
  return {
    name: character?.name ?? "",
    nickname: character?.nickname ?? "",
    age: character?.age?.toString() ?? "",
    gender: character?.gender ?? "",
    race: character?.race ?? "",
    imageUrl: character?.imageUrl ?? null,
    height: character?.height?.toString() ?? "",
    weight: character?.weight?.toString() ?? "",
    appearance: character?.appearance ?? "",
    mbti: character?.mbti ?? "",
    personality: character?.personality ?? "",
    education: character?.education ?? "",
    occupation: character?.occupation ?? "",
    affiliation: character?.affiliation ?? "",
    background: character?.background ?? "",
    customFields: character?.customFields ?? [],
  };
}

function formDataToInput(
  data: CharacterFormData
): Omit<CreateCharacterInput, "projectId"> | UpdateCharacterInput {
  return {
    name: data.name,
    nickname: data.nickname || null,
    age: data.age ? parseInt(data.age, 10) : null,
    gender: data.gender || null,
    race: data.race || null,
    imageUrl: data.imageUrl,
    height: data.height ? parseInt(data.height, 10) : null,
    weight: data.weight ? parseInt(data.weight, 10) : null,
    appearance: data.appearance || null,
    mbti: data.mbti || null,
    personality: data.personality || null,
    education: data.education || null,
    occupation: data.occupation || null,
    affiliation: data.affiliation || null,
    background: data.background || null,
    customFields: data.customFields.filter((f) => f.key && f.value),
  };
}

interface CharacterFormProps {
  character?: Character;
  onSubmit: (
    data: Omit<CreateCharacterInput, "projectId"> | UpdateCharacterInput
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CharacterForm({
  character,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>(() =>
    characterToFormData(character)
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (field: keyof CharacterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await processCharacterImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: base64 }));
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleAddCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }],
    }));
  };

  const handleUpdateCustomField = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const handleRemoveCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const input = formDataToInput(formData);
    await onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      {/* 스크롤 가능한 폼 영역 */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* 이미지 및 기본 정보 */}
        <div className="flex gap-6">
          <div className="shrink-0">
            <Label className="text-sm font-medium mb-2 block">프로필 이미지</Label>
            <div className="relative w-[100px] h-[150px] rounded-lg border bg-muted overflow-hidden">
              {formData.imageUrl ? (
                <>
                  <img
                    src={formData.imageUrl}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={handleRemoveImage}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
                  <User className="h-8 w-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">
                    {isUploading ? "업로드 중..." : "클릭하여 업로드"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="캐릭터 이름"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="nickname">별명/호칭</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleChange("nickname", e.target.value)}
                  placeholder="별명"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="age">나이</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="25"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">성별</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="race">종족</Label>
                <Input
                  id="race"
                  value={formData.race}
                  onChange={(e) => handleChange("race", e.target.value)}
                  placeholder="인간"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 외형 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">외형</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="height">키 (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="180"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weight">몸무게 (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="75"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="appearance">외형 설명</Label>
            <textarea
              id="appearance"
              value={formData.appearance}
              onChange={(e) => handleChange("appearance", e.target.value)}
              placeholder="검은 머리, 날카로운 눈매..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* 성격 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">성격</h3>
          <div className="grid gap-2">
            <Label htmlFor="mbti">MBTI</Label>
            <Select
              value={formData.mbti}
              onValueChange={(value) => handleChange("mbti", value)}
            >
              <SelectTrigger id="mbti" className="w-full max-w-[200px]">
                <SelectValue placeholder="선택" />
              </SelectTrigger>
              <SelectContent>
                {MBTI_OPTIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="personality">성격 설명</Label>
            <textarea
              id="personality"
              value={formData.personality}
              onChange={(e) => handleChange("personality", e.target.value)}
              placeholder="과묵하지만 정의감이 강함..."
              rows={2}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* 배경 */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">배경</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="occupation">직업</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleChange("occupation", e.target.value)}
                placeholder="의적"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affiliation">소속</Label>
              <Input
                id="affiliation"
                value={formData.affiliation}
                onChange={(e) => handleChange("affiliation", e.target.value)}
                placeholder="활빈당"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="education">학력</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleChange("education", e.target.value)}
              placeholder="서당 수료"
              className="w-full"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="background">배경 스토리</Label>
            <textarea
              id="background"
              value={formData.background}
              onChange={(e) => handleChange("background", e.target.value)}
              placeholder="어린 시절 부모를 잃고..."
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* 커스텀 필드 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">커스텀 필드</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomField}
            >
              <Plus className="mr-1 h-3 w-3" />
              필드 추가
            </Button>
          </div>
          {formData.customFields.length > 0 && (
            <div className="space-y-2">
              {formData.customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={field.key}
                    onChange={(e) =>
                      handleUpdateCustomField(index, "key", e.target.value)
                    }
                    placeholder="필드명"
                    className="w-1/3"
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    value={field.value}
                    onChange={(e) =>
                      handleUpdateCustomField(index, "value", e.target.value)
                    }
                    placeholder="값"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleRemoveCustomField(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer 버튼 */}
      <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
          {character ? "저장" : "생성"}
        </Button>
      </div>
    </form>
  );
}
