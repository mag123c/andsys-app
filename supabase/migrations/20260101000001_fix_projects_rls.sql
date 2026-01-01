-- projects 테이블 RLS 정책 수정 (기존 정책 모두 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
DROP POLICY IF EXISTS "Users can access own projects" ON projects;
DROP POLICY IF EXISTS "Users can select own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- SELECT
CREATE POLICY "Users can select own projects"
  ON projects FOR SELECT
  USING (user_id = auth.uid());

-- INSERT
CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE
CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = auth.uid());
