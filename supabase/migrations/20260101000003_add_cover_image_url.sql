-- projects 테이블에 cover_image_url 컬럼 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
