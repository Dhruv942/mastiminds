"use client";

import Link from "next/link";

export default function RaffleFightPage() {
  return (
    <div className="menu-screen" style={{ display: "flex" }}>
      <div className="menu-container">
        <Link href="/play" className="back-home-link">← Back to Games</Link>
        <h1 className="menu-title">Raffle Fight</h1>
        <p className="menu-subtitle">Battle in the raffle arena!</p>
        <div className="coming-soon-box">
          <span className="coming-soon-icon">🎲</span>
          <p>This game is coming soon!</p>
          <p style={{ fontSize: "0.9em", opacity: 0.8, marginTop: "0.5rem" }}>Check back later for updates.</p>
        </div>
        <Link href="/play" className="menu-btn back-btn" style={{ marginTop: "1.5rem", display: "inline-block", textDecoration: "none" }}>
          Back to Games
        </Link>
      </div>
    </div>
  );
}
