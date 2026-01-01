-- RLS 정책 수정: INSERT 시 WITH CHECK 명시적 추가
-- 기존 FOR ALL 정책을 개별 정책으로 분리하여 명확하게 처리

-- =============================================
-- chapters 테이블 RLS 정책 수정
-- =============================================
DROP POLICY IF EXISTS "Users can access own chapters" ON chapters;

-- SELECT 정책
CREATE POLICY "Users can select own chapters"
  ON chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- INSERT 정책: 본인 프로젝트에만 챕터 생성 가능
CREATE POLICY "Users can insert own chapters"
  ON chapters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

-- UPDATE 정책
CREATE POLICY "Users can update own chapters"
  ON chapters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

-- DELETE 정책
CREATE POLICY "Users can delete own chapters"
  ON chapters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- synopses 테이블 RLS 정책 수정
-- =============================================
DROP POLICY IF EXISTS "Users can access own synopses" ON synopses;

CREATE POLICY "Users can select own synopses"
  ON synopses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = synopses.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own synopses"
  ON synopses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own synopses"
  ON synopses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = synopses.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own synopses"
  ON synopses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = synopses.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- characters 테이블 RLS 정책 수정
-- =============================================
DROP POLICY IF EXISTS "Users can access own characters" ON characters;

CREATE POLICY "Users can select own characters"
  ON characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own characters"
  ON characters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = characters.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- =============================================
-- relationships 테이블 RLS 정책 수정
-- =============================================
DROP POLICY IF EXISTS "Users can access own relationships" ON relationships;

CREATE POLICY "Users can select own relationships"
  ON relationships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own relationships"
  ON relationships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own relationships"
  ON relationships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own relationships"
  ON relationships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = relationships.project_id
      AND projects.user_id = auth.uid()
    )
  );
