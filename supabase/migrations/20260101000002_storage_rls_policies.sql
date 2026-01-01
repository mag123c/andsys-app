-- Storage RLS 정책: project-covers, character-images 버킷

-- =============================================
-- project-covers 버킷 정책
-- 파일 경로: {user_id}/{project_id}.{ext}
-- =============================================

-- 업로드: 본인 폴더에만
CREATE POLICY "Users can upload own project covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-covers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 조회: 본인 파일만
CREATE POLICY "Users can view own project covers"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 수정: 본인 파일만
CREATE POLICY "Users can update own project covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 삭제: 본인 파일만
CREATE POLICY "Users can delete own project covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-covers'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================
-- character-images 버킷 정책
-- 파일 경로: {user_id}/{character_id}.{ext}
-- =============================================

CREATE POLICY "Users can upload own character images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'character-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own character images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'character-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own character images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'character-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own character images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'character-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
