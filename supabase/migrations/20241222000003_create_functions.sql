-- 게스트 데이터를 회원 계정으로 마이그레이션
CREATE OR REPLACE FUNCTION migrate_guest_data(p_guest_id UUID)
RETURNS void AS $$
BEGIN
  -- projects 이전 (chapters는 CASCADE로 자동 처리)
  UPDATE projects
  SET user_id = auth.uid(),
      guest_id = NULL,
      updated_at = now()
  WHERE guest_id = p_guest_id
    AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
