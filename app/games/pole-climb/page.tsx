"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const WINNING_STEPS = 7;
const TOTAL_STEPS = 7;
const MAX_HEIGHT_PERCENT = 75;

function generateAscendingNumbers(): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

type Player = "left" | "right";

type DragState = {
  player: Player;
  value: number;
  fromSlot: number | null;
};

export default function PoleClimbPage() {
  const [showMenu, setShowMenu] = useState(true);
  const [showGame, setShowGame] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [countdownIsStart, setCountdownIsStart] = useState(false);
  const [homeBtnStyle, setHomeBtnStyle] = useState<React.CSSProperties>({ display: "none" });
  const [fullscreenBtnStyle, setFullscreenBtnStyle] = useState<React.CSSProperties>({});
  const [modalDisplay, setModalDisplay] = useState<React.CSSProperties>({ display: "none" });
  const [winnerText, setWinnerText] = useState("🎉 Player Wins! 🎉");
  const [winnerMessage, setWinnerMessage] = useState("Congratulations! You reached the top of the pole!");

  const [leftClimbPosition, setLeftClimbPosition] = useState(0);
  const [rightClimbPosition, setRightClimbPosition] = useState(0);
  const [leftNumbers, setLeftNumbers] = useState<number[]>([7, 3, 9, 2]);
  const [rightNumbers, setRightNumbers] = useState<number[]>([7, 3, 9, 2]);
  const [leftSlots, setLeftSlots] = useState<(number | null)[]>([null, null, null, null]);
  const [rightSlots, setRightSlots] = useState<(number | null)[]>([null, null, null, null]);
  const [leftLastQuestion, setLeftLastQuestion] = useState("");
  const [rightLastQuestion, setRightLastQuestion] = useState("");
  const [leftCorrect, setLeftCorrect] = useState(false);
  const [rightCorrect, setRightCorrect] = useState(false);
  const [leftWrong, setLeftWrong] = useState(false);
  const [rightWrong, setRightWrong] = useState(false);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 });
  const [selectedNum, setSelectedNum] = useState<{ player: Player; value: number; fromSlot: number | null } | null>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const processDropRef = useRef<(player: Player, value: number, fromSlot: number | null, x: number, y: number) => void>(() => {});

  const gameContainerRef = useRef<HTMLDivElement>(null);

  const forceFitToScreen = useCallback(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
    document.documentElement.style.setProperty("--vw", `${vw * 0.01}px`);
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "manipulation";
  }, []);

  const generateNewQuestion = useCallback((player: Player) => {
    const getLastQuestion = player === "left" ? leftLastQuestion : rightLastQuestion;
    const setLastQuestion = player === "left" ? setLeftLastQuestion : setRightLastQuestion;
    let numbers: number[] = [];
    let questionText = "";
    let retries = 0;
    do {
      numbers = generateAscendingNumbers();
      questionText = numbers.join(",");
      retries++;
      if (retries >= 20) break;
    } while (questionText === getLastQuestion && getLastQuestion !== "");

    setLastQuestion(questionText);
    if (player === "left") {
      setLeftNumbers(numbers);
      setLeftSlots([null, null, null, null]);
      setSelectedNum((s) => (s?.player === "left" ? null : s));
    } else {
      setRightNumbers(numbers);
      setRightSlots([null, null, null, null]);
      setSelectedNum((s) => (s?.player === "right" ? null : s));
    }
  }, [leftLastQuestion, rightLastQuestion]);

  const checkAnswer = useCallback((player: Player) => {
    const slots = player === "left" ? leftSlots : rightSlots;
    const nums = slots.filter((n): n is number => n !== null);
    if (nums.length !== 4) return;

    const correctSorted = [...nums].sort((a, b) => a - b);
    const correctAnswer = correctSorted.join("");
    const playerAnswer = nums.join("");

    if (playerAnswer === correctAnswer) {
      if (player === "left") {
        setLeftCorrect(true);
        setTimeout(() => setLeftCorrect(false), 300);
        setLeftClimbPosition((p) => {
          const next = Math.min(p + 1, WINNING_STEPS);
          if (next >= WINNING_STEPS) {
            setTimeout(() => {
              setWinnerText(`🎉 Left Player Wins! 🎉`);
              setWinnerMessage("Congratulations! You reached the top of the pole!");
              setModalDisplay({ display: "flex" });
            }, 600);
          } else {
            setTimeout(() => generateNewQuestion("left"), 500);
          }
          return next;
        });
      } else {
        setRightCorrect(true);
        setTimeout(() => setRightCorrect(false), 300);
        setRightClimbPosition((p) => {
          const next = Math.min(p + 1, WINNING_STEPS);
          if (next >= WINNING_STEPS) {
            setTimeout(() => {
              setWinnerText(`🎉 Right Player Wins! 🎉`);
              setWinnerMessage("Congratulations! You reached the top of the pole!");
              setModalDisplay({ display: "flex" });
            }, 600);
          } else {
            setTimeout(() => generateNewQuestion("right"), 500);
          }
          return next;
        });
      }
    } else {
      if (player === "left") {
        setLeftWrong(true);
        setTimeout(() => setLeftWrong(false), 500);
        setLeftClimbPosition((p) => (p > 0 ? p - 1 : 0));
      } else {
        setRightWrong(true);
        setTimeout(() => setRightWrong(false), 500);
        setRightClimbPosition((p) => (p > 0 ? p - 1 : 0));
      }
    }
  }, [leftSlots, rightSlots, generateNewQuestion]);

  const checkedLeftRef = useRef<string>("");
  const checkedRightRef = useRef<string>("");

  useEffect(() => {
    const leftFilled = leftSlots.every((s) => s !== null);
    const rightFilled = rightSlots.every((s) => s !== null);
    const leftKey = leftSlots.map((s) => s ?? "_").join("");
    const rightKey = rightSlots.map((s) => s ?? "_").join("");
    if (leftFilled && leftKey !== checkedLeftRef.current && leftClimbPosition < WINNING_STEPS) {
      checkedLeftRef.current = leftKey;
      checkAnswer("left");
    } else if (!leftFilled) checkedLeftRef.current = "";
    if (rightFilled && rightKey !== checkedRightRef.current && rightClimbPosition < WINNING_STEPS) {
      checkedRightRef.current = rightKey;
      checkAnswer("right");
    } else if (!rightFilled) checkedRightRef.current = "";
  }, [leftSlots, rightSlots, checkAnswer, leftClimbPosition, rightClimbPosition]);

  const processDrop = useCallback(
    (player: Player, value: number, fromSlot: number | null, x: number, y: number) => {
      const dropTarget = document.elementFromPoint(x, y);
      const dropZone = dropTarget?.closest("[data-drop]");
      const dropData = dropZone?.getAttribute("data-drop");
      if (!dropData || !dropData.startsWith(`${player}-`)) return;

      const setNumbers = player === "left" ? setLeftNumbers : setRightNumbers;
      const setSlots = player === "left" ? setLeftSlots : setRightSlots;
      const numbers = player === "left" ? [...leftNumbers] : [...rightNumbers];
      const slots = player === "left" ? [...leftSlots] : [...rightSlots];

      if (dropData === `${player}-row`) {
        if (fromSlot === null) return;
        slots[fromSlot] = null;
        numbers.push(value);
        setSlots(slots);
        setNumbers(numbers);
        return;
      }

      const slotMatch = dropData.match(new RegExp(`${player}-slot-(\\d)`));
      if (slotMatch) {
        const slotIndex = parseInt(slotMatch[1], 10);
        if (fromSlot === slotIndex) return;
        const existingInSlot = slots[slotIndex];

        if (fromSlot !== null) {
          slots[fromSlot] = existingInSlot;
          slots[slotIndex] = value;
          setSlots(slots);
        } else {
          const numIdx = numbers.indexOf(value);
          if (numIdx === -1) return;
          numbers.splice(numIdx, 1);
          if (existingInSlot !== null) numbers.push(existingInSlot);
          slots[slotIndex] = value;
          setNumbers(numbers);
          setSlots(slots);
        }
      }
    },
    [leftNumbers, rightNumbers, leftSlots, rightSlots]
  );

  processDropRef.current = processDrop;

  const handleSlotClick = useCallback(
    (player: Player, slotIndex: number) => {
      if (!selectedNum || selectedNum.player !== player) return;
      const numbers = player === "left" ? [...leftNumbers] : [...rightNumbers];
      const slots = player === "left" ? [...leftSlots] : [...rightSlots];
      const setNumbers = player === "left" ? setLeftNumbers : setRightNumbers;
      const setSlots = player === "left" ? setLeftSlots : setRightSlots;
      const existingInSlot = slots[slotIndex];
      if (selectedNum.fromSlot !== null) {
        slots[selectedNum.fromSlot] = existingInSlot;
        slots[slotIndex] = selectedNum.value;
        setSlots(slots);
      } else {
        const numIdx = numbers.indexOf(selectedNum.value);
        if (numIdx === -1) return;
        numbers.splice(numIdx, 1);
        if (existingInSlot !== null) numbers.push(existingInSlot);
        slots[slotIndex] = selectedNum.value;
        setNumbers(numbers);
        setSlots(slots);
      }
      setSelectedNum(null);
    },
    [selectedNum, leftNumbers, rightNumbers, leftSlots, rightSlots]
  );

  const handleNumberClick = useCallback((player: Player, value: number, fromSlot: number | null) => {
    setSelectedNum((prev) => (prev?.player === player && prev?.value === value && prev?.fromSlot === fromSlot ? null : { player, value, fromSlot }));
  }, []);

  const handleNumbersRowClick = useCallback(
    (player: Player) => {
      if (selectedNum?.player === player && selectedNum.fromSlot !== null) {
        const setSlots = player === "left" ? setLeftSlots : setRightSlots;
        const setNumbers = player === "left" ? setLeftNumbers : setRightNumbers;
        const slots = player === "left" ? [...leftSlots] : [...rightSlots];
        const numbers = player === "left" ? [...leftNumbers] : [...rightNumbers];
        slots[selectedNum.fromSlot] = null;
        numbers.push(selectedNum.value);
        setSlots(slots);
        setNumbers(numbers);
        setSelectedNum(null);
      }
    },
    [selectedNum, leftNumbers, rightNumbers, leftSlots, rightSlots]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, player: Player, value: number, fromSlot: number | null) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture?.(e.pointerId);
      setDragState({ player, value, fromSlot });
      setGhostPos({ x: e.clientX, y: e.clientY });

      const onMove = (ev: PointerEvent) => {
        setGhostPos({ x: ev.clientX, y: ev.clientY });
      };

      const onUp = (ev: PointerEvent) => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
        try { target.releasePointerCapture?.(ev.pointerId); } catch (_) {}
        const x = ev.clientX;
        const y = ev.clientY;
        setDragState(null);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            processDropRef.current(player, value, fromSlot, x, y);
          });
        });
      };

      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
    },
    []
  );

  const resetGame = useCallback(() => {
    setLeftClimbPosition(0);
    setRightClimbPosition(0);
    setLeftLastQuestion("");
    setRightLastQuestion("");
    generateNewQuestion("left");
    generateNewQuestion("right");
  }, [generateNewQuestion]);

  const selectGameType = () => {
    setShowCountdown(true);
    setCountdownIndex(0);
    setCountdownIsStart(false);
  };

  const countdownSequence = [
    { number: "3", text: "Get Ready...", isStart: false },
    { number: "2", text: "Concentrate...", isStart: false },
    { number: "1", text: "Focus...", isStart: false },
    { number: "Go!", text: "Let's Go!!!", isStart: true },
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
        resetGame();
      }, 500);
      return;
    }

    setCountdownIsStart(current.isStart);

    const delay = countdownIndex < countdownSequence.length - 1 ? 1000 : 800;
    const t = setTimeout(() => setCountdownIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [showCountdown, countdownIndex]);

  const closeModal = () => {
    setModalDisplay({ display: "none" });
    setHomeBtnStyle({ display: "flex" });
    setFullscreenBtnStyle({ display: "flex" });
    selectGameType();
  };

  const backToMenu = () => {
    setShowMenu(true);
    setShowGame(false);
    setHomeBtnStyle({ display: "none" });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      (document.documentElement as any).requestFullscreen?.()?.then(forceFitToScreen);
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    forceFitToScreen();
    const onResize = () => { clearTimeout((window as any)._resizeT); (window as any)._resizeT = setTimeout(forceFitToScreen, 100); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [forceFitToScreen]);

  const createConfetti = () => {
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"];
    const end = Date.now() + 3000;
    const iv = setInterval(() => {
      if (Date.now() > end) return clearInterval(iv);
      for (let i = 0; i < 3; i++) {
        const el = document.createElement("div");
        el.className = "confetti";
        el.style.left = Math.random() * 100 + "%";
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = 2 + Math.random() * 2 + "s";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }
    }, 50);
  };

  useEffect(() => {
    if (modalDisplay.display === "flex") createConfetti();
  }, [modalDisplay.display]);

  const getClimberStyle = (player: Player) => {
    const pos = player === "left" ? leftClimbPosition : rightClimbPosition;
    const cappedPos = Math.min(pos, TOTAL_STEPS);
    const heightPct = Math.min(MAX_HEIGHT_PERCENT, (cappedPos / TOTAL_STEPS) * MAX_HEIGHT_PERCENT);
    return { bottom: `${heightPct}%` } as React.CSSProperties;
  };

  const PlayerSection = ({ player }: { player: Player }) => {
    const numbers = player === "left" ? leftNumbers : rightNumbers;
    const slots = player === "left" ? leftSlots : rightSlots;
    const score = player === "left" ? leftClimbPosition : rightClimbPosition;
    const correct = player === "left" ? leftCorrect : rightCorrect;
    const wrong = player === "left" ? leftWrong : rightWrong;
    const isDragging = dragState?.player === player;

    const isSelected = (value: number, fromSlot: number | null) =>
      selectedNum?.player === player && selectedNum?.value === value && selectedNum?.fromSlot === fromSlot;

    return (
      <div className={`player-section ${player}-player`}>
        <div className="question-label">Tap number → tap slot (or drag)</div>
        <div className={`drag-answer-area ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}>
          <div
            className="numbers-row"
            data-player={player}
            data-drop={`${player}-row`}
            onClick={() => handleNumbersRowClick(player)}
          >
            {numbers.map((num, i) => (
              <div
                key={`${player}-num-${i}-${num}`}
                className={`number-box ${isDragging && dragState?.fromSlot === null && dragState?.value === num ? "dragging" : ""} ${isSelected(num, null) ? "selected" : ""}`}
                onPointerDown={(e) => handlePointerDown(e, player, num, null)}
                onClick={(e) => { e.stopPropagation(); handleNumberClick(player, num, null); }}
                style={{ touchAction: "none" }}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="slots-row" data-player={player}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={`${player}-slot-${i}`}
                className={`drop-slot ${selectedNum?.player === player ? "can-drop" : ""}`}
                data-drop={`${player}-slot-${i}`}
                onClick={(e) => { e.stopPropagation(); handleSlotClick(player, i); }}
              >
                {slots[i] !== null ? (
                  <div
                    className={`number-box ${isDragging && dragState?.fromSlot === i ? "dragging" : ""} ${isSelected(slots[i]!, i) ? "selected" : ""}`}
                    onPointerDown={(e) => handlePointerDown(e, player, slots[i]!, i)}
                    onClick={(e) => { e.stopPropagation(); handleNumberClick(player, slots[i]!, i); }}
                    style={{ touchAction: "none" }}
                  >
                    {slots[i]}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="score-indicator">
          Correct: <span className="score-value">{score}/7</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {dragState && (
        <div
          ref={ghostRef}
          className={`number-box drag-ghost ${dragState.player}-player`}
          style={{
            position: "fixed",
            left: ghostPos.x,
            top: ghostPos.y,
            transform: "translate(-50%, -50%) scale(1.1)",
            pointerEvents: "none",
            zIndex: 99999,
            opacity: 0.9,
          }}
        >
          {dragState.value}
        </div>
      )}

      <button
        className="fullscreen-btn"
        onClick={toggleFullscreen}
        title="Toggle Fullscreen"
        style={fullscreenBtnStyle}
      >
        <svg className="fullscreen-icon expand" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
        <svg className="fullscreen-icon collapse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      </button>

      <Link href="/play" className="home-btn" title="Back to Games" style={homeBtnStyle}>
        <img src="/icon_home.png" alt="Home" className="home-icon" />
      </Link>

      {showMenu && (
        <div id="gameTypeMenu" className="menu-screen" style={{ display: "flex" }}>
          <div className="menu-container">
            <Link href="/play" className="back-home-link">← Back to Games</Link>
            <h1 className="menu-title">Pole Climb - Ascending Order</h1>
            <p className="menu-subtitle">Arrange numbers in ascending order to climb!</p>
            <div className="menu-buttons">
              <button className="menu-btn game-type-btn panjat-pinang" onClick={selectGameType}>
                <img src="/icon_panjat.png" alt="Pole Climb" className="menu-icon" />
                <span>Play</span>
              </button>
            </div>
          </div>
          <div className="copyright-footer">
            <p>© MastiMinds 2025 | <span id="version-indicator">v2.0.0</span> | Created by dp | <a href="tel:+918320838017" style={{ color: "inherit", textDecoration: "none" }}>📞 8320838017</a></p>
          </div>
        </div>
      )}

      {showGame && (
        <div id="gameScreenPanjatPinang" className="game-container panjat-pinang-game" ref={gameContainerRef} style={{ display: "flex" }}>
          <PlayerSection player="left" />
          <div className="center-section panjat-pinang-center">
            <h1>Pole Climb - Ascending Order</h1>
            <div className="game-field panjat-pinang-field">
              <div className="pole-container left-pole">
                <img src="/tiang.png" alt="Pole" className="pole-image" />
                <div className="climber-container left-climber" style={getClimberStyle("left")}>
                  <img src="/standleft.png" alt="Left Player" className="climber-image stand" style={leftClimbPosition === 0 ? {} : { display: "none" }} />
                  <img src="/climbleft.png" alt="Left Climbing" className="climber-image climb" style={leftClimbPosition === 0 ? { display: "none" } : { display: "block" }} />
                </div>
              </div>
              <div className="pole-container right-pole">
                <img src="/tiang.png" alt="Pole" className="pole-image" />
                <div className="climber-container right-climber" style={getClimberStyle("right")}>
                  <img src="/standright.png" alt="Right Player" className="climber-image stand" style={rightClimbPosition === 0 ? {} : { display: "none" }} />
                  <img src="/climbright.png" alt="Right Climbing" className="climber-image climb" style={rightClimbPosition === 0 ? { display: "none" } : { display: "block" }} />
                </div>
              </div>
            </div>
            <p className="instruction">Arrange numbers in ascending order! (7 correct to win)</p>
          </div>
          <PlayerSection player="right" />
        </div>
      )}

      <div id="winnerModal" className="modal" style={modalDisplay}>
        <div className="modal-content">
          <h2 id="winnerText">{winnerText}</h2>
          <p id="winnerMessage">{winnerMessage}</p>
          <button className="play-again-btn" onClick={closeModal}>Play Again</button>
        </div>
      </div>

      <div id="countdownOverlay" className={`countdown-overlay ${showCountdown ? "show" : ""}`}>
        <div className="countdown-content">
          <div id="countdownNumber" className={`countdown-number ${countdownIsStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.number ?? "3"}
          </div>
          <div id="countdownText" className={`countdown-text ${countdownIsStart ? "start" : ""}`}>
            {countdownSequence[countdownIndex]?.text ?? "Get Ready..."}
          </div>
        </div>
      </div>
    </>
  );
}
