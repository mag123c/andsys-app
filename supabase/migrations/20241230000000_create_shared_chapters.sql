-- 공유 링크 테이블
CREATE TABLE shared_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 관계
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL,
  chapter_id UUID NOT NULL,

  -- 공유 설정
  share_token VARCHAR(21) NOT NULL UNIQUE,
  password_hash VARCHAR(255),

  -- 스냅샷 (공유 시점의 내용 저장)
  project_title VARCHAR(255) NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  chapter_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  character_count INTEGER NOT NULL,

  -- 만료 설정
  expires_at TIMESTAMPTZ,

  -- 통계
  view_count INTEGER DEFAULT 0,

  -- 상태
  is_active BOOLEAN DEFAULT true,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_shared_chapters_token ON shared_chapters(share_token);
CREATE INDEX idx_shared_chapters_user ON shared_chapters(user_id);
CREATE INDEX idx_shared_chapters_expires ON shared_chapters(expires_at) WHERE is_active = true;

-- RLS 활성화
ALTER TABLE shared_chapters ENABLE ROW LEVEL SECURITY;

-- 정책: 소유자만 자신의 공유 링크 관리 가능
CREATE POLICY "Users can manage own shared chapters"
  ON shared_chapters
  FOR ALL
  USING (auth.uid() = user_id);

-- 정책: 공개 읽기 (share_token으로 접근, 활성 상태이고 만료되지 않은 것만)
CREATE POLICY "Anyone can view active shared chapters by token"
  ON shared_chapters
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- updated_at 자동 갱신 트리거
CREATE TRIGGER shared_chapters_updated_at
  BEFORE UPDATE ON shared_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 조회수 증가 RPC 함수 (SECURITY DEFINER로 anon도 호출 가능)
CREATE OR REPLACE FUNCTION increment_shared_chapter_view_count(chapter_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE shared_chapters
  SET view_count = view_count + 1
  WHERE id = chapter_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;
