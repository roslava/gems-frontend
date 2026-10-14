import { TextScanner } from './ui/animated-text-10';

export default function HeroTitle({ paused = false }: { paused?: boolean }) {
  return <div className="hero-title-overlay">
    <h1 className="hero-title">
      {paused
        ? <span className="hero-title-static">Lithoteka</span>
        : <TextScanner text="Lithoteka" className="hero-title-scanner" inkColor="#f4eee2" accentColor="#ef946e" duration={3.6} />}
    </h1>
  </div>;
}
