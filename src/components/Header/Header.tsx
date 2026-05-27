import SyncBriefing from '../SyncBriefing/SyncBriefing';
import './Header.css';

export default function Header() {
  const appName = import.meta.env.VITE_APP_NAME || 'Daily News';

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo" aria-hidden="true">
            DN
          </div>
          <div>
            <h1 className="header__title">{appName}</h1>
            <p className="header__tagline">프로젝트-뉴스 · 자동 동기화</p>
          </div>
        </div>
        <SyncBriefing />
      </div>
    </header>
  );
}
