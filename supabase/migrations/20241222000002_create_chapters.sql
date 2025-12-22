-- chapters 테이블 (챕터/회차)
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}' NOT NULL,
  content_text TEXT,
  word_count INTEGER DEFAULT 0 NOT NULL,
  "order" INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 인덱스
CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_project_order ON chapters(project_id, "order");
CREATE INDEX idx_chapters_updated_at ON chapters(updated_at DESC);

-- RLS 활성화
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트의 챕터만 접근
CREATE POLICY "Users can access own chapters"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 트리거
CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 글자수 자동 계산 함수
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_text IS NOT NULL THEN
    NEW.word_count = char_length(regexp_replace(NEW.content_text, '\s', '', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chapters_word_count
  BEFORE INSERT OR UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_word_count();
