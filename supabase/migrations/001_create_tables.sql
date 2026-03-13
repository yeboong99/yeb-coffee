-- ============================================================
-- 001_create_tables.sql
-- 캡슐 커피 커뮤니티 - 초기 테이블 생성 및 RLS 정책 설정
-- ============================================================

-- ============================================================
-- 1. reviews 테이블
-- ============================================================
CREATE TABLE reviews (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_id    TEXT        NOT NULL,
  capsule_slug  TEXT        NOT NULL,
  author_nickname TEXT      NOT NULL,
  rating        SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 캡슐 슬러그 기반 조회 최적화
CREATE INDEX idx_reviews_capsule_slug ON reviews(capsule_slug);

-- ============================================================
-- 2. posts 테이블
-- ============================================================
CREATE TABLE posts (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  category        TEXT        NOT NULL CHECK (category IN ('정보공유', '추천', '질문', '잡담')),
  author_nickname TEXT        NOT NULL,
  view_count      INTEGER     DEFAULT 0,
  comment_count   INTEGER     DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 카테고리 필터 및 최신순 정렬 최적화
CREATE INDEX idx_posts_category   ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- ============================================================
-- 3. comments 테이블
-- ============================================================
CREATE TABLE comments (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id         UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_nickname TEXT        NOT NULL,
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 게시글별 댓글 조회 최적화
CREATE INDEX idx_comments_post_id ON comments(post_id);

-- ============================================================
-- 4. comment_count 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_comment_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ============================================================
-- 5. RLS 정책 설정
-- ============================================================

-- reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_policy" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_policy" ON reviews
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- posts RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_policy" ON posts
  FOR SELECT USING (true);

CREATE POLICY "posts_insert_policy" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "posts_update_policy" ON posts
  FOR UPDATE USING (auth.role() = 'service_role');

-- comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_policy" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_policy" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
