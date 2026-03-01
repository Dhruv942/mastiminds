"use client";

import Link from "next/link";

const GAMES = [
  { id: "space-war", name: "Number Strike", href: "/games/space-war", icon: "🚀", desc: "2 Players! Red vs Blue. Answer to fire missiles, 5 lives!", available: true },
  { id: "math-battle", name: "Math Battle", href: "/games/math-battle", icon: "🧟", desc: "1 or 2 Players! Shoot zombies by solving math problems. Addition, subtraction, multiplication, division!", available: true },
];

export default function PlayPage() {
  return (
    <div className="menu-screen" style={{ display: "flex" }}>
      <div className="menu-container compact game-select">
        <Link href="/" className="back-home-link">← Home</Link>
        <h1 className="menu-title">Choose a Game</h1>
        <p className="menu-subtitle" style={{ marginBottom: "1.5rem" }}>Select one of the games below to play</p>
        <div className="game-select-grid">
          {GAMES.map((game) => (
            <Link key={game.id} href={game.href} className="game-card">
              <span className="game-card-icon">{game.icon}</span>
              <h3 className="game-card-title">{game.name}</h3>
              <p className="game-card-desc">{game.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      <div className="copyright-footer">
        <p>© MastiMinds 2025 | Created by dp | <a href="tel:+918320838017" style={{ color: "inherit", textDecoration: "none" }}>📞 8320838017</a></p>
      </div>
    </div>
  );
}
