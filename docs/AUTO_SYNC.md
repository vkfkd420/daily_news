# 복붙 없이 자동으로 가져오기

ChatGPT **프로젝트-뉴스** 채팅 내용을 API로 직접 읽어오는 기능은 **없습니다.**  
(OpenAI가 프로젝트 대화 기록을 외부에 공개하는 API를 제공하지 않음)

대신 아래 방법으로 **복붙 없이** 앱에 데이터를 넣을 수 있습니다.

---

## 방법 1 — JSON URL (추천, GPT 프로젝트 유지)

ChatGPT가 JSON을 **어딘가에 저장**만 하면, 앱이 URL에서 매일 가져옵니다.

1. JSON을 호스팅 (예: GitHub raw, Gist, 개인 서버)
2. `.env` 설정:

```env
BRIEFING_SYNC_URL=https://raw.githubusercontent.com/YOU/repo/main/briefing.json
BRIEFING_SYNC_MODE=url
```

3. `npm run dev` → **자동 가져오기** 또는 앱 열 때 자동 시도

**9시 자동화 예:** Zapier / Make / Power Automate로 ChatGPT 출력을 해당 URL 파일에 업데이트

---

## 방법 2 — OpenAI API (프로젝트와 같은 지시문)

프로젝트-뉴스 **지시문**을 한 번만 파일에 복사:

`data/prompts/project-news-instructions.md`

`.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
BRIEFING_SYNC_MODE=openai
```

매일 9시 Windows 작업 스케줄러:

```powershell
npm run briefing:sync
```

→ ChatGPT 앱을 열지 않아도 같은 형식 JSON이 생성됩니다.

---

## 방법 3 — GPT → 웹훅 (고급)

Custom GPT **Actions**로 브리핑 생성 시 서버로 POST:

- 엔드포인트: `POST /api/briefings/import`
- 로컬 테스트: [ngrok](https://ngrok.com)으로 `https://xxxx.ngrok.io` 노출

`docs/gpt-webhook-action.yaml` 스키마 참고.

---

## 방법 4 — inbox 폴더

자동화 스크립트가 ChatGPT 결과를 파일로 저장:

```
data/inbox/briefing.json
```

`.env`: `BRIEFING_SYNC_MODE=inbox`  
**자동 가져오기** 시 파일을 읽고 `data/briefings/`로 이동합니다.

---

## 앱 동작

| 동작 | 설명 |
|------|------|
| 앱 열 때 | 오늘 파일 없으면 1회 `sync` 시도 (`VITE_AUTO_SYNC_ON_LOAD`) |
| 자동 가져오기 버튼 | 수동 sync |
| 수동 붙여넣기 | 백업용 (Import) |

우선순위 (`BRIEFING_SYNC_MODE=auto` 기본): **URL → inbox 파일 → OpenAI**
