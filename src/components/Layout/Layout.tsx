import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <Header />
      </header>

      <main className="layout__main">
        <div className="layout__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
