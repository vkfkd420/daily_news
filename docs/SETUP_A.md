# 방법 A — OpenAI API 완전 자동 (3분 설정)

ChatGPT 앱 없이, **매일 8시** 같은 형식 브리핑이 `data/briefings/`에 생성됩니다.

## 1. API 키 발급

https://platform.openai.com/api-keys → **Create new secret key**

## 2. `.env`에 키 넣기

프로젝트 루트 `.env` 파일:

```env
OPENAI_API_KEY=sk-여기에_본인_키
```

(나머지는 이미 설정됨: `gpt-4o-mini`, `BRIEFING_SYNC_MODE=openai`, 8시 자동)

## 3. 한 번 실행

```powershell
cd c:\workspace\개인용\daily_news
npm run setup:a
```

- 테스트로 오늘 브리핑 1건 생성
- Windows **매일 08:00** 작업 `DailyNewsBriefing9AM` 등록

키를 인자로 넘기려면:

```powershell
.\scripts\setup-automation.ps1 -ApiKey "sk-..." -NonInteractive
```

## 4. 매일

| 상황 | 동작 |
|------|------|
| PC 8시에 켜짐 | 스케줄러가 JSON 생성 |
| `npm run dev` | 오늘 파일 없으면 시작 시 1회 생성 시도 |

## 5. 앱 보기

```powershell
npm run dev
```

→ http://localhost:3000

## 문제 해결

| 증상 | 확인 |
|------|------|
| sync 실패 | `.env`의 `OPENAI_API_KEY`, OpenAI 잔액 |
| 8시에 안 됨 | 작업 스케줄러 → `DailyNewsBriefing9AM` 활성 여부, PC 절전 |
| 수동 생성 | `npm run briefing:sync` 또는 `npm run briefing:sync:force` |

로그: `logs/sync-YYYY-MM-DD.log`
