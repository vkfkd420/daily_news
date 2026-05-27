# 자동 연동 (복붙 없음)

## 먼저 알아둘 것

**ChatGPT 프로젝트-뉴스 채팅**을 앱이 직접 읽는 API는 **없습니다.**

자동화는 아래 중 **하나**를 씁니다.

---

## ✅ 방법 1 — OpenAI API (가장 쉬움, PC만 켜져 있으면 됨)

### 1) 한 번 설정

```powershell
npm run setup:automation
```

- API Key 입력
- **Windows 매일 8시** 작업 등록
- 테스트 생성

### 2) 매일

- **PC가 8시에 켜져 있으면** → 자동으로 `data/briefings/오늘.json` 생성
- `npm run dev` → 앱에 바로 표시

### 3) dev 서버 켜 두면 추가 기능

`.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
BRIEFING_SYNC_MODE=openai
BRIEFING_AUTO_SYNC=true
BRIEFING_SYNC_HOUR=8
BRIEFING_SYNC_MINUTE=0
```

- 앱 실행 시 오늘 파일 없으면 **자동 1회 생성**
- **매일 8:00 KST** 에 또 한 번 시도
- 터미널·`logs/auto-sync-날짜.log` 에 로그

---

## ✅ 방법 2 — JSON URL (ChatGPT 프로젝트 유지)

ChatGPT 결과를 Gist/GitHub 등에 올리고:

```env
BRIEFING_SYNC_URL=https://raw.githubusercontent.com/.../briefing.json
BRIEFING_SYNC_MODE=url
```

Zapier/Make로 **9시에 파일만 갱신** → 앱이 URL에서 자동 fetch.

---

## ✅ 방법 3 — inbox 폴더 (Power Automate 등)

어떤 도구든 JSON을 이 경로에 저장:

```
data/inbox/briefing.json
```

`npm run dev` 중이면 **파일 생기는 즉시** 앱에 반영 (폴더 감시).

Power Automate 예: ChatGPT 출력 → 파일 저장 → inbox

---

## 비교

| 방법 | ChatGPT 앱 | 복붙 | 9시 자동 |
|------|------------|------|----------|
| OpenAI API | 안 써도 됨 | ❌ | ✅ (PC 켜짐) |
| URL + Zapier | ✅ | ❌ | ✅ |
| inbox 파일 | ✅ | ❌ | ✅ (dev 켜짐) |
| 프로젝트 채팅 API | — | — | **불가** |

---

## 추천

**완전 자동 + 설정 간단** → `npm run setup:automation` (방법 1)

API 비용 싫으면 → Zapier + Gist (방법 2)
