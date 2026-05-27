import { useState } from 'react';
import { importBriefing } from '../../api/briefingClient';
import './ImportBriefing.css';

export default function ImportBriefing() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const handleImport = async (force: boolean) => {
    if (!raw.trim()) {
      setError('JSON을 붙여넣어 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await importBriefing(raw, force);
      setRaw('');
      close();
      window.dispatchEvent(new CustomEvent('briefing:refresh'));
    } catch (err) {
      const message = err instanceof Error ? err.message : '가져오기 실패';
      if (!force && message.includes('이미 있습니다')) {
        const overwrite = confirm(`${message}\n덮어쓸까요?`);
        if (overwrite) {
          try {
            await importBriefing(raw, true);
            setRaw('');
            close();
            window.dispatchEvent(new CustomEvent('briefing:refresh'));
          } catch (e2) {
            setError(e2 instanceof Error ? e2.message : '가져오기 실패');
          }
          return;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" className="import-briefing__open" onClick={() => setOpen(true)}>
        ChatGPT에서 붙여넣기
      </button>

      {open && (
        <div className="import-briefing__overlay" role="dialog" aria-modal="true" aria-labelledby="import-title">
          <div className="import-briefing__modal">
            <header className="import-briefing__header">
              <h2 id="import-title">ChatGPT 브리핑 가져오기</h2>
              <button type="button" className="import-briefing__close" onClick={close} aria-label="닫기">
                ✕
              </button>
            </header>

            <ol className="import-briefing__steps">
              <li>
                <strong>ChatGPT Plus</strong> → 프로젝트-뉴스 (지시문:{' '}
                <code>data/prompts/project-news-instructions.md</code>)
              </li>
              <li>
                채팅에 「오늘 아침 한국경제 JSON 브리핑」 요청 → 응답 <strong>JSON 전체</strong> 복사
                (매일 프롬프트: <code>data/prompts/chatgpt-daily-prompt.txt</code>)
              </li>
              <li>아래에 붙여넣고 「저장하고 보기」 (API 추가 결제 없음)</li>
            </ol>

            <textarea
              className="import-briefing__textarea"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder='{"date":"2026-05-26","title":"데일리 글로벌 증시 브리핑",...}'
              spellCheck={false}
            />

            {error && <p className="import-briefing__error">{error}</p>}

            <footer className="import-briefing__footer">
              <button type="button" className="import-briefing__cancel" onClick={close} disabled={loading}>
                취소
              </button>
              <button
                type="button"
                className="import-briefing__submit"
                onClick={() => handleImport(false)}
                disabled={loading}
              >
                {loading ? '저장 중…' : '저장하고 보기'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
