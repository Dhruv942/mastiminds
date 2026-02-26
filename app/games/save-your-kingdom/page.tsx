"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const TOTAL_SETS = 10;

type Player = "left" | "right";

function generateNumbersSet(): { numbers: number[]; biggest: number } {
  const count = 3 + Math.floor(Math.random() * 2); // 3 or 4 numbers
  const numbers: number[] = [];
  for (let i = 0; i < count; i++) {
    numbers.push(Math.floor(Math.random() * 99) + 1);
  }
  const shuffled = [...numbers].sort(() => Math.random() - 0.5);
  const biggest = Math.max(...numbers);
  return { numbers: shuffled, biggest };
}

export default function SaveYourKingdomPage() {
  const [showMenu, setShowMenu] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [countdownIsStart, setCountdownIsStart] = useState(false);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [leftSet, setLeftSet] = useState<{ numbers: number[]; biggest: number } | null>(null);
  const [rightSet, setRightSet] = useState<{ numbers: number[]; biggest: number } | null>(null);
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [rightSelected, setRightSelected] = useState<number | null>(null);
  const [shooting, setShooting] = useState(false);
  const [shooter, setShooter] = useState<Player | null>(null);
  const [leftVillainHit, setLeftVillainHit] = useState(false);
  const [rightVillainHit, setRightVillainHit] = useState(false);
  const [leftVillainDown, setLeftVillainDown] = useState(false);
  const [rightVillainDown, setRightVillainDown] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [winnerText, setWinnerText] = useState("");
  const [leftWrong, setLeftWrong] = useState(false);
  const [rightWrong, setRightWrong] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [homeBtnStyle, setHomeBtnStyle] = useState<React.CSSProperties>({ display: "none" });
  const [fullscreenBtnStyle, setFullscreenBtnStyle] = useState<React.CSSProperties>({ display: "none" });

  const generateNewSet = useCallback(() => {
    setLeftSet(generateNumbersSet());
    setRightSet(generateNumbersSet());
    setLeftSelected(null);
    setRightSelected(null);
    setLeftWrong(false);
    setRightWrong(false);
    setWaitingForNext(false);
  }, []);

  const selectGameType = () => {
    setShowCountdown(true);
    setCountdownIndex(0);
    setCountdownIsStart(false);
  };

  const countdownSequence = [
    { number: "3", text: "Player 1 (Left) vs Player 2 (Right)...", isStart: false },
    { number: "2", text: "Ready Your Army...", isStart: false },
    { number: "1", text: "Fight the Villain!", isStart: false },
    { number: "Go!", text: "Both choose BIGGEST!", isStart: true },
  ];

  useEffect(() => {
    if (!showCountdown) return;
    setHomeBtnStyle({ display: "none" });
    setFullscreenBtnStyle({ display: "none" });

    const current = countdownSequence[countdownIndex];
    if (!current) {
      setTimeout(() => {
        setShowCountdown(false);
        setShowMenu(false);
        setShowGame(true);
        setHomeBtnStyle({ display: "flex" });
        setFullscreenBtnStyle({ display: "flex" });
        setLeftScore(0);
        setRightScore(0);
        setSetNumber(1);
        setLeftVillainDown(false);
        setRightVillainDown(false);
        generateNewSet();
      }, 500);
      return;
    }
    setCountdownIsStart(current.isStart);
    const delay = countdownIndex < countdownSequence.length - 1 ? 1000 : 800;
    const t = setTimeout(() => setCountdownIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [showCountdown, countdownIndex, generateNewSet]);

  const checkBothAndAdvance = useCallback(() => {
    if (!leftSet || !rightSet || leftSelected === null || rightSelected === null || waitingForNext) return;
    setWaitingForNext(true);

    let leftCorrect = leftSelected === leftSet.biggest;
    let rightCorrect = rightSelected === rightSet.biggest;
    if (!leftCorrect) setLeftWrong(true);
    if (!rightCorrect) setRightWrong(true);

    const newLeft = leftScore + (leftCorrect ? 1 : 0);
    const newRight = rightScore + (rightCorrect ? 1 : 0);

    const shooters: Player[] = [];
    if (leftCorrect) shooters.push("left");
    if (rightCorrect) shooters.push("right");

    const doShoot = (idx: number) => {
      if (idx >= shooters.length) {
        setTimeout(() => {
          setShooting(false);
          setShooter(null);
          setLeftVillainHit(false);
          setRightVillainHit(false);
          setLeftScore(newLeft);
          setRightScore(newRight);
          setLeftWrong(false);
          setRightWrong(false);
          if (setNumber >= TOTAL_SETS) {
            setLeftVillainDown(true);
            setRightVillainDown(true);
            setTimeout(() => {
              if (newLeft > newRight) setWinnerText("🎉 Left Player Wins! 🎉");
              else if (newRight > newLeft) setWinnerText("🎉 Right Player Wins! 🎉");
              else setWinnerText("🤝 It's a Draw! 🤝");
              setShowVictory(true);
            }, 1200);
          } else {
            setSetNumber((n) => n + 1);
            generateNewSet();
          }
        }, 400);
        return;
      }
      const who = shooters[idx];
      setShooter(who);
      setShooting(true);
      if (who === "left") setTimeout(() => setLeftVillainHit(true), 150);
      else setTimeout(() => setRightVillainHit(true), 150);
      setTimeout(() => {
        if (who === "left") setLeftVillainHit(false);
        else setRightVillainHit(false);
        if (idx + 1 < shooters.length) {
          setTimeout(() => doShoot(idx + 1), 300);
        } else {
          doShoot(shooters.length);
        }
      }, 400);
    };

    if (shooters.length > 0) doShoot(0);
    else {
      setLeftScore(newLeft);
      setRightScore(newRight);
      setTimeout(() => {
        setLeftWrong(false);
        setRightWrong(false);
        if (setNumber >= TOTAL_SETS) {
          setLeftVillainDown(true);
          setRightVillainDown(true);
          setTimeout(() => {
            if (newLeft > newRight) setWinnerText("🎉 Left Player Wins! 🎉");
            else if (newRight > newLeft) setWinnerText("🎉 Right Player Wins! 🎉");
            else setWinnerText("🤝 It's a Draw! 🤝");
            setShowVictory(true);
          }, 1200);
        } else {
          setSetNumber((n) => n + 1);
          generateNewSet();
        }
      }, 500);
    }
  }, [leftSet, rightSet, leftSelected, rightSelected, leftScore, rightScore, setNumber, waitingForNext, generateNewSet]);

  useEffect(() => {
    if (leftSelected !== null && rightSelected !== null && !waitingForNext && !(leftVillainDown && rightVillainDown)) {
      checkBothAndAdvance();
    }
  }, [leftSelected, rightSelected, waitingForNext, leftVillainDown, rightVillainDown, checkBothAndAdvance]);

  const handleAnswer = (value: number, player: Player) => {
    if ((leftVillainDown && rightVillainDown) || waitingForNext) return;
    if (player === "left") {
      if (leftSelected !== null) return;
      setLeftSelected(value);
    } else {
      if (rightSelected !== null) return;
      setRightSelected(value);
    }
  };

  const closeVictory = () => {
    setShowVictory(false);
    setShowMenu(true);
    setShowGame(false);
    setHomeBtnStyle({ display: "none" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      (document.documentElement as any).requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }, []);

  return (
    <>
      <button className="fullscreen-btn" onClick={toggleFullscreen} title="Toggle Fullscreen" style={fullscreenBtnStyle}>
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
            <h1 className="menu-title">Save Your Kingdom</h1>
            <p className="menu-subtitle">2 Players! Each has own villain. Both get options, find BIGGEST. Your King shoots YOUR villain! 10 sets!</p>
            <div className="menu-buttons">
              <button className="menu-btn game-type-btn" onClick={selectGameType}>
                <span style={{ fontSize: "2rem", marginRight: "8px" }}>🏰</span>
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
        <div className="kingdom-game-container kingdom-2player kingdom-both-options">
          <div className="kingdom-header">
            <h1>Save Your Kingdom</h1>
            <div className="kingdom-scores">
              <span className="kingdom-score-box left">
                Left: <strong>{leftScore}</strong>
              </span>
              <span className="kingdom-set">Set {setNumber}/{TOTAL_SETS}</span>
              <span className="kingdom-score-box right">
                Right: <strong>{rightScore}</strong>
              </span>
            </div>
            <p className="kingdom-turn">Both choose the BIGGEST number!</p>
          </div>

          <div className="kingdom-arena kingdom-two-villains">
            <div className="kingdom-side left-side">
              <div className="kingdom-king left-king">
                <img src="/king.png" alt="King" className="king-img" />
                <span className="king-label">Left</span>
                {shooting && shooter === "left" && <div className="bullet bullet-left" />}
              </div>
              <div className={`kingdom-villain left-villain ${leftVillainHit ? "villain-hit" : ""} ${leftVillainDown ? "villain-down" : ""}`}>
                <img src="/villain.png" alt="Villain" className="villain-img" />
                <span className="villain-label">Left Villain</span>
              </div>
            </div>
            <div className="kingdom-side right-side">
              <div className={`kingdom-villain right-villain ${rightVillainHit ? "villain-hit" : ""} ${rightVillainDown ? "villain-down" : ""}`}>
                <img src="/villain.png" alt="Villain" className="villain-img" />
                <span className="villain-label">Right Villain</span>
              </div>
              <div className="kingdom-king right-king">
                <img src="/king.png" alt="King" className="king-img" />
                <span className="king-label">Right</span>
                {shooting && shooter === "right" && <div className="bullet bullet-right" />}
              </div>
            </div>
          </div>

          <div className="kingdom-options-row">
            <div className={`kingdom-player-options left ${leftWrong ? "shake-wrong" : ""}`}>
              <p className="kingdom-player-label">Left — Find BIGGEST</p>
              <div className="kingdom-options-inner">
                {leftSet?.numbers.map((num, i) => (
                  <button
                    key={`left-${num}-${i}`}
                    className={`kingdom-option-btn ${leftSelected === num ? "selected" : ""}`}
                    onClick={() => handleAnswer(num, "left")}
                    disabled={(leftVillainDown && rightVillainDown) || waitingForNext || leftSelected !== null}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            <div className={`kingdom-player-options right ${rightWrong ? "shake-wrong" : ""}`}>
              <p className="kingdom-player-label">Right — Find BIGGEST</p>
              <div className="kingdom-options-inner">
                {rightSet?.numbers.map((num, i) => (
                  <button
                    key={`right-${num}-${i}`}
                    className={`kingdom-option-btn ${rightSelected === num ? "selected" : ""}`}
                    onClick={() => handleAnswer(num, "right")}
                    disabled={(leftVillainDown && rightVillainDown) || waitingForNext || rightSelected !== null}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="countdownOverlay" className={`countdown-overlay ${showCountdown ? "show" : ""}`}>
        <div className="countdown-content">
          <div className={`countdown-number ${countdownIsStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.number ?? "3"}
          </div>
          <div className={`countdown-text ${countdownIsStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.text ?? "Defend Your Kingdom..."}
          </div>
        </div>
      </div>

      <div id="victoryModal" className="modal" style={{ display: showVictory ? "flex" : "none" }}>
        <div className="modal-content">
          <h2>{winnerText}</h2>
          <p>Both villains defeated! Kingdom saved!</p>
          <button className="play-again-btn" onClick={closeVictory}>Play Again</button>
          <Link href="/play" className="menu-btn back-btn" style={{ marginTop: "12px", display: "inline-block", textDecoration: "none" }}>
            Back to Games
          </Link>
        </div>
      </div>
    </>
  );
}
