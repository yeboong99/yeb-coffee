# 슬랙 알림 한글 깨짐(???) 수정 계획

## Context
`.claude/hooks/slack-notify.sh`가 슬랙으로 한글 알림을 보내지만, Windows MINGW64 환경에서 UTF-8 인코딩이 보장되지 않아 한글이 `???`(물음표)로 깨져서 도착하는 문제.

## 원인
- MINGW64 기본 코드페이지가 UTF-8이 아님 → 스크립트 내 한글 리터럴이 jq/curl로 전달될 때 바이트 손실
- curl Content-Type에 charset=utf-8 미명시

## 수정 사항

**파일:** `.claude/hooks/slack-notify.sh`

### 1. UTF-8 환경 설정 추가 (9행 `set -euo pipefail` 직후)
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
if command -v chcp.com &>/dev/null; then
  chcp.com 65001 &>/dev/null || true
fi
```

### 2. curl Content-Type에 charset 추가 (148행)
```
-H "Content-Type: application/json; charset=utf-8" \
```

## 검증
- 수정 후 Claude Code 사용 시 슬랙 알림에서 한글("권한 승인 요청", "작업 완료" 등)이 정상 표시되는지 확인
