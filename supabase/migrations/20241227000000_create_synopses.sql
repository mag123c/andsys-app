-- synopses 테이블 (시놉시스)
CREATE TABLE IF NOT EXISTS synopses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}' NOT NULL,
  plain_text TEXT,
  word_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- 프로젝트당 시놉시스는 하나만 존재
  CONSTRAINT unique_synopsis_per_project UNIQUE (project_id)
);

-- 인덱스
CREATE INDEX idx_synopses_project_id ON synopses(project_id);
CREATE INDEX idx_synopses_updated_at ON synopses(updated_at DESC);

-- RLS 활성화
ALTER TABLE synopses ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트의 시놉시스만 접근
CREATE POLICY "Users can access own synopses"
  ON synopses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = synopses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 트리거
CREATE TRIGGER synopses_updated_at
  BEFORE UPDATE ON synopses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 글자수 자동 계산 트리거
CREATE OR REPLACE FUNCTION update_synopsis_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plain_text IS NOT NULL THEN
    NEW.word_count = char_length(regexp_replace(NEW.plain_text, '\s', '', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER synopses_word_count
  BEFORE INSERT OR UPDATE ON synopses
  FOR EACH ROW
  EXECUTE FUNCTION update_synopsis_word_count();
