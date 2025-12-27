-- relationships 테이블 (캐릭터 관계)
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- 관계 당사자
  from_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  to_character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- 관계 정보
  type TEXT NOT NULL CHECK (type IN ('family', 'friend', 'lover', 'rival', 'enemy', 'colleague', 'master', 'custom')),
  description TEXT,

  -- 양방향 여부
  bidirectional BOOLEAN DEFAULT false NOT NULL,

  -- 메타
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- 같은 두 캐릭터 간 중복 관계 방지
  CONSTRAINT unique_relationship UNIQUE (project_id, from_character_id, to_character_id),
  -- 자기 자신과의 관계 방지
  CONSTRAINT no_self_relationship CHECK (from_character_id != to_character_id)
);

-- 인덱스
CREATE INDEX idx_relationships_project_id ON relationships(project_id);
CREATE INDEX idx_relationships_from_character ON relationships(from_character_id);
CREATE INDEX idx_relationships_to_character ON relationships(to_character_id);
CREATE INDEX idx_relationships_updated_at ON relationships(updated_at DESC);

-- RLS 활성화
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- 정책: 본인 프로젝트의 관계만 접근
CREATE POLICY "Users can access own relationships"
  ON relationships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- updated_at 자동 갱신 트리거
CREATE TRIGGER relationships_updated_at
  BEFORE UPDATE ON relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
