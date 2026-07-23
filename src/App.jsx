import { Routes, Route, Link, NavLink } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import MineralPage from './pages/MineralPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          Лито<span>тека</span>
        </Link>
        <nav className="site-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Каталог
          </NavLink>
          <NavLink to="/articles" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Статьи
          </NavLink>
        </nav>
        <span className="site-tag">тестовая витрина · данные из API</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/minerals/:slug" element={<MineralPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
        </Routes>
      </main>
    </div>
  );
}