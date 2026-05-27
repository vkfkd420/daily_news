# ChatGPT Plus로 쓰기 (API 결제 없음)

**ChatGPT Plus(월 구독)** 와 **OpenAI API(사용량 과금)** 는 별개입니다.  
Plus만 있으면 **chatgpt.com / 프로젝트-뉴스**로 브리핑을 만들고, 앱에는 **붙여넣기**로 넣으면 됩니다.

---

## 1. 프로젝트 지시문 설정 (한 번만)

ChatGPT에서 **프로젝트-뉴스** (또는 새 프로젝트)를 열고, **지시문**에 아래 파일 내용을 **전부 복사**해 넣습니다.

```
data/prompts/project-news-instructions.md
```

이 파일이 앱·API와 **같은 규칙**(한국 5건, 별점, 8시 브리핑)을 씁니다.

---

## 2. 매일 아침 (8시 전후)

ChatGPT 채팅에 아래만 입력:

```
오늘 아침 한국경제 핵심 뉴스 JSON 브리핑 만들어줘. JSON만.
```

또는 `data/prompts/chatgpt-daily-prompt.txt` 내용을 복사해 붙여넣기.

응답이 **JSON만** 나오면 전체를 복사합니다. (``` 코드블록이면 블록 안만)

---

## 3. 앱에 반영

```powershell
npm run dev
```

브라우저 → 헤더 **「ChatGPT에서 붙여넣기」** → JSON 붙여넣기 → **저장하고 보기**

---

## 4. (선택) GitHub에 올리기 → 다른 기기/앱에서 URL로 읽기

붙여넣기로 로컬에 저장한 뒤:

```powershell
npm run briefing:push-github
```

→ `latest.json` 이 GitHub에 올라감. 앱은 `BRIEFING_SYNC_URL`로 자동 fetch.

상세: **[GITHUB_SYNC.md](./GITHUB_SYNC.md)**

---

## 5. (선택) 파일로 넣기 — dev 서버 켜 둔 경우

JSON을 파일로 저장:

```
data/inbox/briefing.json
```

`npm run dev` 중이면 **자동으로** `data/briefings/오늘.json`으로 옮깁니다.

`.env`:

```env
BRIEFING_SYNC_MODE=inbox
BRIEFING_AUTO_SYNC=true
```

---

## Plus vs API

| | ChatGPT Plus | OpenAI API (방법 A) |
|--|--------------|---------------------|
| 비용 | 월 구독만 | 사용량별 **추가** 과금 |
| 만드는 곳 | ChatGPT 앱/웹 | `npm run briefing:sync` |
| 앱 연동 | 붙여넣기 / inbox | 자동 (8시 스케줄러) |
| 완전 무인 자동 | ❌ (채팅 1번 필요) | ✅ (PC+API) |

Plus로 **완전 무인**은 불가능합니다. (ChatGPT 채팅을 외부에서 읽는 API가 없음)

---

## 자주 묻는 것

**Q. Plus 쓰는데 API quota 오류가 나요**  
→ `.env`에서 `OPENAI_API_KEY`를 지우고 `BRIEFING_SYNC_MODE=none` 으로 두세요.

**Q. 지시문 수정은?**  
→ `data/prompts/project-news-instructions.md` 수정 후 ChatGPT 프로젝트 지시문에도 다시 반영.
