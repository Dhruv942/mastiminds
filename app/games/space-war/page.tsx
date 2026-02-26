"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Player = "red" | "blue";

function playLaserSound() {
  try {
    const audio = new Audio("/laserShoot.wav");
    audio.volume = 0.5;
    audio.play().catch(() => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    });
  } catch {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (_) {}
  }
}

function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 200;
    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function playExplosionSound() {
  try {
    const audio = new Audio("/explosion.wav");
    audio.volume = 0.6;
    audio.play().catch(() => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        noise.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        noise.start(ctx.currentTime);
      } catch (_) {}
    });
  } catch {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      noise.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      noise.start(ctx.currentTime);
    } catch (_) {}
  }
}

function generateQuestion(): { question: string; answers: number[]; correct: number } {
  const count = 4;
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * 99) + 1);
  }
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);
  const biggest = Math.max(...numbers);
  return {
    question: "Which number is the BIGGEST?",
    answers: shuffled,
    correct: shuffled.indexOf(biggest),
  };
}

export default function SpaceWarPage() {
  const [showMenu, setShowMenu] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [redLives, setRedLives] = useState(5);
  const [blueLives, setBlueLives] = useState(5);
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [redQuestion, setRedQuestion] = useState(generateQuestion);
  const [blueQuestion, setBlueQuestion] = useState(generateQuestion);
  const [missiles, setMissiles] = useState<{ id: number; shooter: Player; active: boolean }[]>([]);
  const [explosion, setExplosion] = useState<{ show: boolean; target: Player | "center" | null }>({ show: false, target: null });
  const [showGameOver, setShowGameOver] = useState(false);
  const [winnerText, setWinnerText] = useState("");
  const [homeBtnStyle, setHomeBtnStyle] = useState<React.CSSProperties>({ display: "none" });
  const [fullscreenBtnStyle, setFullscreenBtnStyle] = useState<React.CSSProperties>({ display: "none" });
  const missileIdRef = useRef(0);
  const arenaRef = useRef<HTMLDivElement>(null);

  const loadNextQuestion = useCallback((player: Player) => {
    if (player === "red") setRedQuestion(generateQuestion());
    else setBlueQuestion(generateQuestion());
  }, []);

  const fireMissile = useCallback((shooter: Player) => {
    const id = missileIdRef.current++;
    setMissiles((m) => [...m, { id, shooter, active: true }]);
    setTimeout(() => {
      setMissiles((m) => m.filter((x) => x.id !== id));
    }, 2200);
  }, []);

  const checkAnswer = useCallback(
    (player: Player, selectedIndex: number) => {
      const q = player === "red" ? redQuestion : blueQuestion;
      const isCorrect = selectedIndex === q.correct;
      const target = player === "red" ? "blue" : "red";

      if (isCorrect) {
        playLaserSound();
        if (player === "red") {
          setRedScore((s) => s + 100);
          fireMissile("red");
        } else {
          setBlueScore((s) => s + 100);
          fireMissile("blue");
        }
        loadNextQuestion(player);

        setTimeout(() => {
          playExplosionSound();
          if (target === "red") setRedLives((l) => Math.max(0, l - 1));
          else setBlueLives((l) => Math.max(0, l - 1));
          setExplosion({ show: true, target });
          setTimeout(() => setExplosion({ show: false, target: null }), 600);
        }, 2000);
      } else {
        playWrongSound();
        const enemy = player === "red" ? "blue" : "red";
        fireMissile(enemy);
        loadNextQuestion(player);

        setTimeout(() => {
          playExplosionSound();
          if (player === "red") setRedLives((l) => Math.max(0, l - 1));
          else setBlueLives((l) => Math.max(0, l - 1));
          setExplosion({ show: true, target: player });
          setTimeout(() => setExplosion({ show: false, target: null }), 600);
        }, 2000);
      }
    },
    [redQuestion, blueQuestion, fireMissile, loadNextQuestion]
  );

  useEffect(() => {
    if (redLives <= 0 || blueLives <= 0) {
      const win = redLives <= 0 ? "blue" : "red";
      setWinnerText(win === "red" ? "Red Player Wins!" : "Blue Player Wins!");
      setShowGameOver(true);
    }
  }, [redLives, blueLives]);

  const selectGameType = () => {
    setShowCountdown(true);
    setCountdownIndex(0);
  };

  const countdownSequence = [
    { number: "3", text: "Red vs Blue...", isStart: false },
    { number: "2", text: "Ready Ships...", isStart: false },
    { number: "1", text: "Engage!", isStart: false },
    { number: "Go!", text: "Space War!", isStart: true },
  ];

  useEffect(() => {
    if (!showCountdown) return;
    const current = countdownSequence[countdownIndex];
    if (!current) {
      setTimeout(() => {
        setShowCountdown(false);
        setShowMenu(false);
        setShowGame(true);
        setHomeBtnStyle({ display: "flex" });
        setFullscreenBtnStyle({ display: "flex" });
      }, 500);
      return;
    }
    const delay = countdownIndex < countdownSequence.length - 1 ? 1000 : 800;
    const t = setTimeout(() => setCountdownIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [showCountdown, countdownIndex]);

  const restartGame = () => {
    setRedLives(5);
    setBlueLives(5);
    setRedScore(0);
    setBlueScore(0);
    setRedQuestion(generateQuestion());
    setBlueQuestion(generateQuestion());
    setShowGameOver(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    if (!showGame) return;
    const canvas = document.getElementById("spacewar-starfield") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars: { x: number; y: number; z: number; speed: number; size: number; opacity: number }[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < 150; i++) {
        const z = 1 + Math.floor(Math.random() * 3);
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z,
          speed: (4 - z) * 0.3,
          size: (4 - z) * 0.5,
          opacity: 0.3 + z * 0.2,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    let anim: number;
    const loop = () => {
      if (ctx && canvas) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        stars.forEach((s) => {
          s.y += s.speed;
          if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
          ctx!.fillStyle = `rgba(255,255,255,${s.opacity})`;
          ctx!.beginPath();
          ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx!.fill();
        });
      }
      anim = requestAnimationFrame(loop);
    };
    anim = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(anim);
      window.removeEventListener("resize", resize);
    };
  }, [showGame]);

  return (
    <>
      <button className="fullscreen-btn" onClick={toggleFullscreen} title="Fullscreen" style={fullscreenBtnStyle}>
        <svg className="fullscreen-icon expand" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
        <svg className="fullscreen-icon collapse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
      </button>

      <Link href="/play" className="home-btn" title="Back to Games" style={homeBtnStyle}>
        <img src="/icon_home.png" alt="Home" className="home-icon" />
      </Link>

      {showMenu && (
        <div className="menu-screen" style={{ display: "flex" }}>
          <div className="menu-container">
            <Link href="/play" className="back-home-link">← Back to Games</Link>
            <h1 className="menu-title">Space War</h1>
            <p className="menu-subtitle">2 Players! Red vs Blue. Answer questions to fire missiles and destroy enemy ship! 5 lives each.</p>
            <div className="menu-buttons">
              <button className="menu-btn game-type-btn" onClick={selectGameType}>
                <span style={{ fontSize: "2rem", marginRight: "8px" }}>🚀</span>
                <span>Play</span>
              </button>
            </div>
          </div>
          <div className="copyright-footer">
            <p>© MastiMinds 2025</p>
          </div>
        </div>
      )}

      {showGame && (
        <div className="spacewar-container">
          <canvas id="spacewar-starfield" className="spacewar-starfield" />
          <div className="spacewar-header">
            <div className="spacewar-lives red">
              <h3>RED</h3>
              <div className="lives-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`life ${i <= redLives ? "active" : "lost"}`}>❤️</span>
                ))}
              </div>
              <span className="score-label">Score: {redScore}</span>
            </div>
            <h1 className="spacewar-title">SPACE WAR</h1>
            <div className="spacewar-lives blue">
              <h3>BLUE</h3>
              <div className="lives-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`life ${i <= blueLives ? "active" : "lost"}`}>💙</span>
                ))}
              </div>
              <span className="score-label">Score: {blueScore}</span>
            </div>
          </div>

          <div className="spacewar-arena" ref={arenaRef}>
            <div className="spacewar-ship red-ship">
              <img src="/space_red.png" alt="Red Ship" onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentNode as HTMLElement)?.querySelector(".ship-fallback")?.classList.remove("hidden"); }} />
              <span className="ship-fallback hidden" style={{ fontSize: "4rem" }}>🚀</span>
            </div>
            <div className="spacewar-ship blue-ship">
              <img src="/space_blue.png" alt="Blue Ship" onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentNode as HTMLElement)?.querySelector(".ship-fallback")?.classList.remove("hidden"); }} />
              <span className="ship-fallback hidden" style={{ fontSize: "4rem" }}>🚀</span>
            </div>
            {missiles.map((m) => (
              <div key={m.id} className={`spacewar-missile ${m.shooter}-missile`}>
                <img src={m.shooter === "red" ? "/missile_red.png" : "/missile_blue.png"} alt="Missile" className={`missile-img ${m.shooter === "blue" ? "missile-flip" : ""}`} onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentNode as HTMLElement)?.querySelector(".missile-fallback")?.classList.remove("hidden"); }} />
                <span className="missile-fallback hidden">💥</span>
              </div>
            ))}
            {explosion.show && explosion.target && (
              <div className={`spacewar-explosion ${explosion.target}-explosion`}>
                <img src="/explode.png" alt="Explosion" className="explosion-img" onError={(e) => { e.currentTarget.style.display = "none"; (e.currentTarget.parentNode as HTMLElement)?.querySelector(".explosion-fallback")?.classList.remove("hidden"); }} />
                <span className="explosion-fallback hidden">💥</span>
              </div>
            )}
          </div>

          <div className="spacewar-panels">
            <div className="spacewar-panel red-panel">
              <p className="panel-question">{redQuestion.question}</p>
              <div className="panel-answers">
                {redQuestion.answers.map((ans, i) => (
                  <button key={i} className="answer-btn red-btn" onClick={() => checkAnswer("red", i)} disabled={showGameOver}>
                    {ans}
                  </button>
                ))}
              </div>
            </div>
            <div className="spacewar-panel blue-panel">
              <p className="panel-question">{blueQuestion.question}</p>
              <div className="panel-answers">
                {blueQuestion.answers.map((ans, i) => (
                  <button key={i} className="answer-btn blue-btn" onClick={() => checkAnswer("blue", i)} disabled={showGameOver}>
                    {ans}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`countdown-overlay ${showCountdown ? "show" : ""}`}>
        <div className="countdown-content">
          <div className={`countdown-number ${countdownSequence[countdownIndex]?.isStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.number ?? "3"}
          </div>
          <div className={`countdown-text ${countdownSequence[countdownIndex]?.isStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.text ?? "Red vs Blue..."}
          </div>
        </div>
      </div>

      <div className={`modal ${showGameOver ? "active" : ""}`} style={{ display: showGameOver ? "flex" : "none" }}>
        <div className="modal-content spacewar-modal">
          <h2>{winnerText}</h2>
          <p>Red: {redScore} | Blue: {blueScore}</p>
          <button className="play-again-btn" onClick={restartGame}>Play Again</button>
          <Link href="/play" className="menu-btn back-btn" style={{ marginTop: "12px", display: "inline-block", textDecoration: "none" }}>
            Back to Games
          </Link>
        </div>
      </div>
    </>
  );
}
