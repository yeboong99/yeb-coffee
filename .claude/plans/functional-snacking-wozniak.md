# Plan: .mcp.json macOS 환경으로 수정

## Context
현재 .mcp.json이 Windows 환경 기준으로 `cmd /c npx` 방식으로 설정되어 있어, macOS에서 MCP 서버 연결이 실패하는 문제. macOS에서는 `cmd`가 없으므로 `npx`를 직접 실행하도록 수정 필요.

## 수정 파일

- `/Users/yeboong99/Desktop/claude-yeb-coffee/.mcp.json`

## 변경 내용

모든 MCP 서버 항목에 대해:
- `"command": "cmd"` → `"command": "npx"`
- `"args"` 에서 `"/c"`, `"npx"` 제거 (앞 2개 요소 제거), `-y` 부터 시작

### 변경 후 결과 예시

```json
{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp", "--api-key", "ctx7sk-6e93706e-2c8a-4391-811d-14f47b98edb7"],
      "env": {}
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "sequential-thinking": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "env": {}
    },
    "shadcn": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "shadcn@latest", "mcp"],
      "env": {}
    },
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": {}
    }
  }
}
```

## 검증 방법

1. 파일 수정 후 Claude Code 재시작 (또는 `/mcp` 명령으로 MCP 서버 상태 확인)
2. MCP 서버 목록에 모든 서버가 connected 상태로 표시되는지 확인
