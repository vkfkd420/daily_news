# GitHub — 이 프로젝트(daily_news)와 같이 쓰기

**별도 `market-news` repo 없이**, 이 프로젝트 안 `data/briefings/` 를 GitHub에 올리면 됩니다.

```
daily_news/                    ← 이 repo 하나
  src/ ...
  data/briefings/
    latest.json                ← 항상 최신 (앱 URL 동기화용)
    2026-05-28.json            ← 날짜별 보관
```

로컬 저장 = GitHub 경로 = 동일합니다.

---

## 1. GitHub repo 연결 (한 번)

GitHub에서 **daily_news** (또는 원하는 이름) 빈 repo 생성 후:

```powershell
npm run setup:git
```

또는 수동:

```powershell
git init
git remote add origin https://github.com/아이디/daily_news.git
git add .
git commit -m "init: daily news"
git push -u origin main
```

---

## 2. Token → `.env`

```env
GITHUB_TOKEN=github_pat_...
GITHUB_OWNER=아이디
GITHUB_REPO=daily_news
GITHUB_BRANCH=main
# 경로 변경 시만:
# GITHUB_BRIEFINGS_PREFIX=data/briefings
```

`GITHUB_OWNER` / `GITHUB_REPO` 는 **`git remote`에서 자동 추론**됩니다 (`.env` 생략 가능).

---

## 3. 매일 (ChatGPT Plus)

1. ChatGPT → JSON
2. 앱 **「ChatGPT에서 붙여넣기」** → `data/briefings/오늘.json` + `latest.json` 저장
3. GitHub에 반영:

```powershell
npm run briefing:push-github
```

(API로 repo 파일만 올림 — `git push`와 별개)

---

## 4. 앱이 이 repo에서 읽기

public repo 기준:

```env
BRIEFING_SYNC_URL=https://raw.githubusercontent.com/아이디/daily_news/main/data/briefings/latest.json
BRIEFING_SYNC_MODE=url
VITE_AUTO_SYNC_ON_LOAD=true
```

`npm run dev` → GitHub `latest.json` 을 pull 해서 표시.

---

## 5. (선택) git push로 같이 올리기

브리핑 JSON을 커밋에 포함해도 됩니다 (`data/briefings/*.json`).

```powershell
git add data/briefings/
git commit -m "briefing: 2026-05-28"
git push
```

`briefing:push-github` 는 **GitHub API**로만 파일을 갱신합니다 (로컬에 git 없어도 동작).

---

## 6. (선택) GitHub Actions — 같은 repo

`.github/workflows/daily-briefing-github.yml`

- OpenAI API로 생성 → **이 repo**의 `data/briefings/` 에 push
- Secrets: `OPENAI_API_KEY`, `GITHUB_TOKEN`
- Plus만으로는 Actions에서 ChatGPT 호출 불가

---

## 명령

| 명령 | 설명 |
|------|------|
| `npm run setup:git` | git init + remote 안내 |
| `npm run briefing:push-github` | `data/briefings/` → GitHub (동일 경로) |
| `npm run briefing:sync` | `BRIEFING_SYNC_URL` → 로컬 |

---

## 별도 repo를 쓰고 싶다면

`.env`에서 `GITHUB_REPO=market-news` 만 바꾸면 됩니다.  
기본은 **이 프로젝트와 같은 repo** 입니다.
