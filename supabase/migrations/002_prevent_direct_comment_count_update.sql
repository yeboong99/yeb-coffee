-- ============================================================
-- 002_prevent_direct_comment_count_update.sql
-- posts.comment_count 직접 수정 방지 트리거 추가
-- ============================================================

-- 기존 더미 데이터 초기화: 모든 comment_count를 0으로 리셋
UPDATE posts SET comment_count = 0;

-- comment_count 직접 수정 차단 함수
CREATE OR REPLACE FUNCTION prevent_direct_comment_count_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 트리거 내부에서 호출된 경우(trg_comment_count 등) 허용
  -- pg_trigger_depth() > 1 이면 다른 트리거가 호출한 UPDATE
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;
  -- 외부에서 직접 comment_count를 변경하려는 경우 차단
  IF NEW.comment_count != OLD.comment_count THEN
    RAISE EXCEPTION 'comment_count는 직접 수정할 수 없습니다. 댓글을 추가/삭제하세요.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- posts UPDATE 시 comment_count 직접 변경 차단 트리거
CREATE TRIGGER trg_prevent_comment_count_update
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION prevent_direct_comment_count_update();
