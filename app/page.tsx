"use client";

import Link from "next/link";

const features = [
  {
    title: "NEP 2020 Alignment",
    desc: "Built on core principles from India's National Education Policy 2020, promoting experiential and joyful learning as outlined in Section 4.34-4.35 (page 18).",
  },
  {
    title: "Activity-Based Design",
    desc: "Shifts from rote learning to hands-on challenges, inquiry-driven tasks, and real-world applications for holistic student development.",
  },
  {
    title: "Gamified Engagement",
    desc: "Features math battles, quick solves, multiplayer competitions, points, badges, and leaderboards to make learning fun and competitive.",
  },
  {
    title: "Multidisciplinary Integration",
    desc: "Supports play-based activities from foundational stage, integrating arts, sports, and subjects per CBSE/NEP guidelines.",
  },
  {
    title: "Educational Impact",
    desc: "Fosters competency-based skills, critical thinking, and collaboration—perfect for modern classrooms and edtech innovation.",
  },
];

export default function HomePage() {
  return (
    <div className="home-screen">
      <div className="home-container">
        <h1 className="home-title">MastiMinds</h1>
        <p className="home-subtitle">Select Play to choose your game!</p>
        <Link href="/play" className="home-play-btn">
          <span className="play-icon">▶</span>
          <span>Play</span>
        </Link>

        <div className="home-features">
          <h2 className="home-features-title">Our Approach</h2>
          {features.map((f, i) => (
            <div key={i} className="home-feature-item">
              <div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="copyright-footer home-footer-inbox">
          <p>© MastiMinds 2025 | <span>v2.0.0</span></p>
          <p style={{ marginTop: 5, fontSize: "0.9em", opacity: 0.8 }}>Created by dp</p>
          <p className="footer-collab">Open for collaboration in making games. Reach out if you would like to collaborate.</p>
          <p className="footer-contact"><a href="tel:+918320838017">8320838017</a></p>
        </div>
      </div>
    </div>
  );
}
