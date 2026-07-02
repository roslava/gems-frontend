import { Routes, Route, Link } from 'react-router-dom';
import CatalogPage from './pages/CatalogPage.jsx';
import MineralPage from './pages/MineralPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="site-header">
        <Link to="/" className="logo">
          Лито<span>тека</span>
        </Link>
        <span className="site-tag">тестовая витрина · данные из API</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/minerals/:slug" element={<MineralPage />} />
        </Routes>
      </main>
    </div>
  );
}
