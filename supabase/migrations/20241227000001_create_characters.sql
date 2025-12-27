-- characters 테이블 (등장인물)
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- 기본 정보
  name TEXT NOT NULL,
  nickname TEXT,
  age INTEGER,
  gender TEXT,
  race TEXT,
  image_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,

  -- 외형
  height INTEGER,
  weight INTEGER,
  appearance TEXT,

  -- 성격/배경
  mbti TEXT,
  personality TEXT,
  education TEXT,
  occupation TEXT,
  affiliation TEXT,
  background TEXT,

  -- 확장 (커스텀 필드)
  custom_fields JSONB DEFAULT '[]' NOT NULL,

  -- 메타
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_characters_project_order ON characters(project_id, "order");
CREATE INDEX idx_characters_updated_at ON characters(updated_at DESC);

-- RLS 활성화
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트의 캐릭터만 접근
CREATE POLICY "Users can access own characters"
  ON characters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 트리거
CREATE TRIGGER characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
