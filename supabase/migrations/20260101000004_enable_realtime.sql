-- Supabase Realtime 활성화
-- UPDATE/DELETE 이벤트에서 old_record를 받기 위해 REPLICA IDENTITY FULL 설정

-- projects 테이블
ALTER TABLE projects REPLICA IDENTITY FULL;

-- chapters 테이블
ALTER TABLE chapters REPLICA IDENTITY FULL;

-- synopses 테이블
ALTER TABLE synopses REPLICA IDENTITY FULL;

-- characters 테이블
ALTER TABLE characters REPLICA IDENTITY FULL;

-- relationships 테이블
ALTER TABLE relationships REPLICA IDENTITY FULL;

-- supabase_realtime publication에 테이블 추가
-- Supabase는 기본적으로 supabase_realtime publication을 사용
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE chapters;
ALTER PUBLICATION supabase_realtime ADD TABLE synopses;
ALTER PUBLICATION supabase_realtime ADD TABLE characters;
ALTER PUBLICATION supabase_realtime ADD TABLE relationships;
