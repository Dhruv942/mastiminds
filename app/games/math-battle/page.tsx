"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const ZOMBIE_URLS = [
  "https://i.imgur.com/Mhhc189.png", "https://i.imgur.com/seG3o8U.png", "https://i.imgur.com/9a48aOv.png",
  "https://i.imgur.com/P5EOQjy.png", "https://i.imgur.com/lW5LslS.png", "https://i.imgur.com/ezdXfwx.png", "https://i.imgur.com/cxIJKKs.png",
];
const SHOOT_URL = "https://github.com/ilindekguru/Lagulagu/raw/refs/heads/main/alien-ray-gun-90345.mp3";
const WIN_URL = "https://github.com/ilindekguru/Lagulagu/raw/refs/heads/main/brass-fanfare-with-timpani-and-winchimes-reverberated-146260.mp3";

type Topic = "add" | "sub" | "mul" | "div" | "mix" | "int";
type Difficulty = "easy" | "medium" | "hard";

function r(n: number) {
  return Math.floor(Math.random() * n);
}

function MathBattlePage() {
  const [showSplash, setShowSplash] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [step, setStep] = useState<"player" | "difficulty" | "target" | "topic">("player");
  const [gameMode, setGameMode] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<Topic>("add");
  const [targetScore, setTargetScore] = useState(250);

  const canvas1Ref = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<HTMLCanvasElement>(null);
  const confCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{ p1: GameInstance | null; p2: GameInstance | null; animId: number; isRunning: boolean }>({ p1: null, p2: null, animId: 0, isRunning: false });
  const zombieImagesRef = useRef<HTMLImageElement[]>([]);

  const enterGame = useCallback(() => {
    setShowSplash(false);
    setTimeout(() => {
      setShowMenu(true);
    }, 800);
  }, []);

  useEffect(() => {
    ZOMBIE_URLS.forEach((url) => {
      const img = new Image();
      img.src = url;
      zombieImagesRef.current.push(img);
    });
  }, []);

  const goToDifficulty = (mode: number) => {
    setGameMode(mode);
    setStep("difficulty");
  };
  const backToPlayer = () => setStep("player");
  const handleDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    setStep(gameMode === 1 ? "target" : "topic");
  };
  const backToDifficulty = () => setStep("difficulty");
  const goToTopic = (score: number) => {
    setTargetScore(score);
    setStep("topic");
  };
  const backToTarget = () => setStep(gameMode === 1 ? "target" : "difficulty");

  const startGame = (selectedTopic: Topic) => {
    setTopic(selectedTopic);
    setShowMenu(false);
    setShowGame(true);
  };

  const backToMenu = useCallback(() => {
    gameRef.current.isRunning = false;
    if (gameRef.current.animId) cancelAnimationFrame(gameRef.current.animId);
    setShowGame(false);
    setShowMenu(true);
    setStep("player");
  }, []);

  useEffect(() => {
    if (!showGame || !canvas1Ref.current) return;
    const p1 = new GameInstance(canvas1Ref.current, 1, difficulty, topic, gameMode, targetScore, zombieImagesRef.current, backToMenu, gameRef);
    const p2 = gameMode === 2 && canvas2Ref.current ? new GameInstance(canvas2Ref.current, 2, difficulty, topic, gameMode, targetScore, zombieImagesRef.current, backToMenu, gameRef) : null;
    p1.otherPlayer = p2;
    if (p2) p2.otherPlayer = p1;
    p1.resize();
    if (p2) p2.resize();
    gameRef.current = { p1, p2, animId: 0, isRunning: true };

    const loop = () => {
      if (!gameRef.current.isRunning) return;
      p1.update();
      if (p2) p2.update();
      gameRef.current.animId = requestAnimationFrame(loop);
    };
    gameRef.current.animId = requestAnimationFrame(loop);
    return () => {
      gameRef.current.isRunning = false;
      if (gameRef.current.animId) cancelAnimationFrame(gameRef.current.animId);
    };
  }, [showGame, difficulty, topic, gameMode, targetScore, backToMenu]);

  return (
    <>
      <Link href="/play" className="mathbattle-home-btn" style={{ display: showGame ? "flex" : "none" }}>
        <span>Home</span>
      </Link>

      {showSplash && (
        <div className="mathbattle-splash" onClick={enterGame}>
          <div className="mathbattle-splash-content">
            <div className="mathbattle-created-by">Created by</div>
            <div className="mathbattle-creator-name">MastiMinds</div>
            <div className="mathbattle-creator-title">Math Battle - Zombie City</div>
            <div className="mathbattle-tap-start">TAP TO START</div>
          </div>
        </div>
      )}

      {showMenu && (
        <div className="mathbattle-menu">
          <h1 className="mathbattle-title">MATH BATTLE<br /><span className="mathbattle-subtitle">Zombie City</span></h1>

          {step === "player" && (
            <div className="mathbattle-step">
              <img src="https://i.imgur.com/evTtOoQ.png" alt="Select Mode" className="mathbattle-mode-header" />
              <div className="mathbattle-mode-container">
                <img src="https://i.imgur.com/D3U5exB.png" className="mathbattle-mode-btn" onClick={() => goToDifficulty(1)} alt="1 Player" />
                <img src="https://i.imgur.com/WdG957V.png" className="mathbattle-mode-btn" onClick={() => goToDifficulty(2)} alt="2 Players" />
              </div>
            </div>
          )}

          {step === "difficulty" && (
            <div className="mathbattle-step">
              <h2 className="mathbattle-step-title">Difficulty Level</h2>
              <div className="mathbattle-diff-container">
                <img src="https://i.imgur.com/ambiptY.png" className="mathbattle-diff-btn" onClick={() => handleDifficulty("easy")} alt="Easy" />
                <img src="https://i.imgur.com/2TiATVL.png" className="mathbattle-diff-btn" onClick={() => handleDifficulty("medium")} alt="Medium" />
                <img src="https://i.imgur.com/4uX7veW.png" className="mathbattle-diff-btn" onClick={() => handleDifficulty("hard")} alt="Hard" />
              </div>
              <button className="mathbattle-menu-btn" onClick={backToPlayer}>Back</button>
            </div>
          )}

          {step === "target" && (
            <div className="mathbattle-step">
              <h2 className="mathbattle-step-title">Target Score</h2>
              <button className="mathbattle-menu-btn mathbattle-btn-short" onClick={() => goToTopic(100)}>QUICK (100 pts)</button>
              <button className="mathbattle-menu-btn mathbattle-btn-mid" onClick={() => goToTopic(250)}>MEDIUM (250 pts)</button>
              <button className="mathbattle-menu-btn mathbattle-btn-long" onClick={() => goToTopic(500)}>LONG (500 pts)</button>
              <button className="mathbattle-menu-btn" onClick={backToDifficulty}>Back</button>
            </div>
          )}

          {step === "topic" && (
            <div className="mathbattle-step">
              <h2 className="mathbattle-step-title">Select Topic</h2>
              <div className="mathbattle-topic-grid">
                <button className="mathbattle-topic-btn" onClick={() => startGame("add")}>Addition (+)</button>
                <button className="mathbattle-topic-btn" onClick={() => startGame("sub")}>Subtraction (-)</button>
                <button className="mathbattle-topic-btn" onClick={() => startGame("mul")}>Multiplication (×)</button>
                <button className="mathbattle-topic-btn" onClick={() => startGame("div")}>Division (÷)</button>
                <button className="mathbattle-topic-btn" onClick={() => startGame("mix")}>Mixed (+ - × ÷)</button>
                <button className="mathbattle-topic-btn" onClick={() => startGame("int")}>Integers (+/-)</button>
              </div>
              <button className="mathbattle-menu-btn" onClick={backToTarget}>Back</button>
            </div>
          )}
        </div>
      )}

      {showGame && (
        <div className="mathbattle-game-container">
          <div className={`mathbattle-player-panel ${gameMode === 1 ? "full-width" : "half-width"}`}>
            <div className="mathbattle-canvas-wrapper">
              <div className="mathbattle-hud">
                {gameMode === 1 && <div className="mathbattle-hud-box">Target: <span id="p1-target">{targetScore}</span></div>}
                <div className="mathbattle-hud-box">Score: <span id="p1-score">0</span></div>
                <div className="mathbattle-hud-box mathbattle-hearts" id="p1-hearts">❤️❤️❤️</div>
              </div>
              <canvas ref={canvas1Ref} id="mathbattle-canvas1" />
              <div className="mathbattle-input-display" id="p1-display">?</div>
              <div className="mathbattle-modal-overlay" id="p1-modal" style={{ display: "none" }}>
                <h2 id="p1-modal-title" className="mathbattle-victory-title">VICTORY!</h2>
                <p>Final Score: <span id="p1-final">0</span></p>
                <button className="mathbattle-restart-btn" onClick={backToMenu}>MAIN MENU</button>
              </div>
            </div>
            <KeypadPanel pid={1} gameRef={gameRef} />
          </div>

          {gameMode === 2 && (
            <div className="mathbattle-player-panel half-width">
              <div className="mathbattle-canvas-wrapper">
                <div className="mathbattle-hud">
                  <div className="mathbattle-hud-box">Score: <span id="p2-score">0</span></div>
                  <div className="mathbattle-hud-box mathbattle-hearts" id="p2-hearts">❤️❤️❤️</div>
                </div>
                <canvas ref={canvas2Ref} id="mathbattle-canvas2" />
                <div className="mathbattle-input-display" id="p2-display">?</div>
                <div className="mathbattle-modal-overlay" id="p2-modal" style={{ display: "none" }}>
                  <h2 id="p2-modal-title" className="mathbattle-victory-title">VICTORY!</h2>
                  <p>Final Score: <span id="p2-final">0</span></p>
                  <button className="mathbattle-restart-btn" onClick={backToMenu}>MAIN MENU</button>
                </div>
              </div>
              <KeypadPanel pid={2} gameRef={gameRef} />
            </div>
          )}
        </div>
      )}

      <canvas ref={confCanvasRef} id="mathbattle-confetti" className="mathbattle-confetti" />
    </>
  );
}

function KeypadPanel({ pid, gameRef }: { pid: number; gameRef: { current: { p1: GameInstance | null; p2: GameInstance | null } } }) {
  const handleKey = (val: string | null, action: string | null) => {
    const g = pid === 1 ? gameRef.current.p1 : gameRef.current.p2;
    if (!g) return;
    if (action === "clear") g.clearInput();
    else if (action === "fire") g.fire();
    else if (val !== null) g.inputNum(val);
  };

  return (
    <div className={`mathbattle-keypad p${pid}-keys`}>
      <div className="mathbattle-keypad-grid">
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("7", null)}>7</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("8", null)}>8</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("9", null)}>9</button>
        <button className="mathbattle-key-btn mathbattle-btn-clr" onPointerDown={() => handleKey(null, "clear")}>⌫</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("4", null)}>4</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("5", null)}>5</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("6", null)}>6</button>
        <button className="mathbattle-key-btn mathbattle-btn-fire" onPointerDown={() => handleKey(null, "fire")}>🔥</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("1", null)}>1</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("2", null)}>2</button>
        <button className="mathbattle-key-btn" onPointerDown={() => handleKey("3", null)}>3</button>
        <button className="mathbattle-key-btn mathbattle-btn-neg" onPointerDown={() => handleKey("-", null)}>(-)</button>
        <button className="mathbattle-key-btn mathbattle-btn-0" onPointerDown={() => handleKey("0", null)}>0</button>
      </div>
    </div>
  );
}

interface GameRefType {
  p1: GameInstance | null;
  p2: GameInstance | null;
  animId: number;
  isRunning: boolean;
}

class GameInstance {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pid: number;
  difficulty: Difficulty;
  topic: Topic;
  gameMode: number;
  targetScore: number;
  zombieImages: HTMLImageElement[];
  onBackToMenu: () => void;
  gameRef: { current: GameRefType };
  otherPlayer: GameInstance | null = null;

  elScore: HTMLElement;
  elHearts: HTMLElement;
  elDisplay: HTMLElement;
  elModal: HTMLElement;
  elModalTitle: HTMLElement;
  elFinal: HTMLElement;

  score = 0;
  level = 1;
  lives = 3;
  input = "";
  zombies: Zombie[] = [];
  bullets: Bullet[] = [];
  particles: Particle[] = [];
  lastSpawn = 0;
  isOver = false;
  spawnRate: number;
  playerPos = { x: 0, y: 0 };

  constructor(
    canvas: HTMLCanvasElement, pid: number, difficulty: Difficulty, topic: Topic,
    gameMode: number, targetScore: number, zombieImages: HTMLImageElement[], onBackToMenu: () => void,
    gameRef: { current: GameRefType }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.pid = pid;
    this.difficulty = difficulty;
    this.topic = topic;
    this.gameMode = gameMode;
    this.targetScore = targetScore;
    this.zombieImages = zombieImages;
    this.onBackToMenu = onBackToMenu;
    this.gameRef = gameRef;

    this.elScore = document.getElementById(`p${pid}-score`)!;
    this.elHearts = document.getElementById(`p${pid}-hearts`)!;
    this.elDisplay = document.getElementById(`p${pid}-display`)!;
    this.elModal = document.getElementById(`p${pid}-modal`)!;
    this.elModalTitle = document.getElementById(`p${pid}-modal-title`)!;
    this.elFinal = document.getElementById(`p${pid}-final`)!;

    this.spawnRate = difficulty === "easy" ? 4000 : difficulty === "hard" ? 2000 : 3000;
  }

  resize() {
    const w = this.canvas.parentElement!.clientWidth;
    const h = this.canvas.parentElement!.clientHeight;
    this.canvas.width = w;
    this.canvas.height = h;
    this.playerPos = { x: w / 2, y: h - 50 };
  }

  update() {
    if (this.isOver) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawPlayer();

    const now = Date.now();
    if (now - this.lastSpawn > this.spawnRate) {
      this.zombies.push(new Zombie(this.canvas.width, this.level, this.difficulty, this.topic, this.zombieImages));
      this.lastSpawn = now;
    }

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const z = this.zombies[i];
      z.update();
      z.draw(this.ctx);
      if (z.y > this.canvas.height - 40) {
        this.lives--;
        this.updateHearts();
        this.createExplosion(z.x, z.y, "#c0392b");
        this.zombies.splice(i, 1);
        if (this.lives <= 0) this.gameOver(false);
      }
    }

    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update();
      b.draw(this.ctx);
      if (b.outOfBounds(this.canvas.width, this.canvas.height)) this.bullets.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(this.ctx);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  drawPlayer() {
    const { x, y } = this.playerPos;
    this.ctx.fillStyle = this.pid === 1 ? "#3498db" : "#e74c3c";
    this.ctx.beginPath();
    this.ctx.arc(x, y + 20, 25, 0, Math.PI, true);
    this.ctx.fill();
    this.ctx.fillStyle = "#ecf0f1";
    this.ctx.fillRect(x - 6, y - 35, 12, 40);
    this.ctx.fillStyle = "#2c3e50";
    this.ctx.fillRect(x - 8, y - 35, 16, 8);
  }

  inputNum(val: string) {
    if (this.isOver) return;
    if (val === "-") {
      if (this.input === "") this.input = "-";
      else if (this.input === "-") this.input = "";
    } else {
      if (this.input.length < 5) this.input += val;
    }
    this.updateDisplay();
  }

  clearInput() {
    this.input = "";
    this.updateDisplay();
  }

  updateDisplay() {
    this.elDisplay.textContent = this.input === "" ? "?" : this.input;
    (this.elDisplay as HTMLElement).style.borderColor = "#f1c40f";
    (this.elDisplay as HTMLElement).style.color = "#f1c40f";
  }

  fire() {
    if (this.isOver || this.input === "" || this.input === "-") return;
    const ans = parseInt(this.input, 10);
    let hit = false;
    this.zombies.sort((a, b) => b.y - a.y);
    for (let i = 0; i < this.zombies.length; i++) {
      if (this.zombies[i].answer === ans) {
        try {
          const sfx = new Audio(SHOOT_URL);
          sfx.volume = 0.6;
          sfx.play().catch(() => {});
        } catch (_) {}
        this.bullets.push(new Bullet(this.playerPos.x, this.playerPos.y - 30, this.zombies[i].x, this.zombies[i].y));
        this.createExplosion(this.zombies[i].x, this.zombies[i].y, "#2ecc71");
        this.zombies.splice(i, 1);
        hit = true;
        this.score += 10;
        if (this.score % 50 === 0) {
          this.level++;
          const minRate = this.difficulty === "hard" ? 800 : this.difficulty === "medium" ? 1200 : 2000;
          this.spawnRate = Math.max(minRate, this.spawnRate - 200);
        }
        this.elScore.textContent = String(this.score);
        if (this.gameMode === 1 && this.score >= this.targetScore) this.gameOver(true);
        (this.elDisplay as HTMLElement).style.borderColor = "#2ecc71";
        (this.elDisplay as HTMLElement).style.color = "#2ecc71";
        setTimeout(() => this.updateDisplay(), 200);
        break;
      }
    }
    if (!hit) {
      (this.elDisplay as HTMLElement).style.borderColor = "#e74c3c";
      (this.elDisplay as HTMLElement).style.color = "#e74c3c";
      setTimeout(() => this.updateDisplay(), 200);
    }
    this.input = "";
  }

  createExplosion(x: number, y: number, c: string) {
    for (let i = 0; i < 12; i++) this.particles.push(new Particle(x, y, c));
  }

  updateHearts() {
    this.elHearts.textContent = "❤️".repeat(this.lives);
  }

  gameOver(isVictory: boolean) {
    this.isOver = true;
    this.elFinal.textContent = String(this.score);
    (this.elModal as HTMLElement).style.display = "flex";
    if (isVictory) {
      this.elModalTitle.textContent = "VICTORY!";
      this.elModalTitle.className = "mathbattle-victory-title";
      this.gameRef.current.isRunning = false;
      if (this.gameRef.current.animId) cancelAnimationFrame(this.gameRef.current.animId);
      try {
        const sfx = new Audio(WIN_URL);
        sfx.volume = 1;
        sfx.play().catch(() => {});
      } catch (_) {}
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("Congratulations! You won!");
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
      }
      if (this.gameMode === 2 && this.otherPlayer) {
        this.otherPlayer.isOver = true;
      }
    } else {
      this.elModalTitle.textContent = "DEFEAT";
      this.elModalTitle.className = "mathbattle-defeat-title";
      this.gameRef.current.isRunning = false;
      if (this.gameRef.current.animId) cancelAnimationFrame(this.gameRef.current.animId);
      if (this.gameMode === 2 && this.otherPlayer) {
        this.otherPlayer.isOver = true;
        this.otherPlayer.gameOver(true);
      }
    }
  }
}

class Zombie {
  r = 30;
  x: number;
  y: number;
  image: HTMLImageElement;
  speed: number;
  wiggle: number;
  text: string;
  answer: number;

  constructor(canvasW: number, level: number, difficulty: Difficulty, topic: Topic, zombieImages: HTMLImageElement[]) {
    this.x = Math.random() * (canvasW - 2 * this.r) + this.r;
    this.y = -60;
    this.image = zombieImages[Math.floor(Math.random() * zombieImages.length)];
    const baseSpeed = difficulty === "easy" ? 0.3 : difficulty === "hard" ? 1.0 : 0.5;
    this.speed = baseSpeed + level * 0.05;
    this.wiggle = Math.random() * 100;
    const diffMult = difficulty === "easy" ? 0.5 : difficulty === "hard" ? 2 : 1;
    const range = Math.floor(5 * level * diffMult + (difficulty === "hard" ? 20 : 5));
    const op = topic === "mix" ? ["add", "sub", "mul", "div"][r(4)] : topic;
    let a: number, b: number;
    if (op === "add") {
      a = r(range) + 2;
      b = r(range) + 2;
      this.text = `${a}+${b}`;
      this.answer = a + b;
    } else if (op === "sub") {
      a = r(range * 1.5) + 5;
      b = r(a);
      this.text = `${a}-${b}`;
      this.answer = a - b;
    } else if (op === "mul") {
      const m = difficulty === "easy" ? 5 : 9;
      a = r(m) + 2;
      b = r(m) + 2;
      this.text = `${a}×${b}`;
      this.answer = a * b;
    } else if (op === "div") {
      b = r(9) + 2;
      const res = r(10) + 1;
      a = b * res;
      this.text = `${a}÷${b}`;
      this.answer = res;
    } else {
      const l = 15;
      a = r(l * 2) - l;
      b = r(l * 2) - l;
      this.text = Math.random() > 0.5 ? `${a}+${b < 0 ? `(${b})` : b}` : `${a}-${b < 0 ? `(${b})` : b}`;
      this.answer = eval(this.text.replace("×", "*").replace("÷", "/").replace(")(", ")-("));
    }
  }

  update() {
    this.y += this.speed;
    this.x += Math.sin((this.y + this.wiggle) / 40) * 0.5;
    if (this.x < 30) this.x = 30;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.image?.complete) {
      ctx.drawImage(this.image, this.x - this.r, this.y - this.r, this.r * 2, this.r * 2);
    } else {
      ctx.fillStyle = "#27ae60";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(this.x - 55, this.y - this.r * 2.2, 110, 32, 8);
    else ctx.rect(this.x - 55, this.y - this.r * 2.2, 110, 32);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#2c3e50";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.text, this.x, this.y - this.r * 2.2 + 16);
  }
}

class Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, tx: number, ty: number) {
    this.x = x;
    this.y = y;
    const dx = tx - x;
    const dy = ty - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.vx = (dx / dist) * 25;
    this.vy = (dy / dist) * 25;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  outOfBounds(w: number, h: number) {
    return this.y < -50 || this.x < -50 || this.x > w + 50;
  }
}

class Particle {
  x: number;
  y: number;
  c: string;
  life: number;
  vx: number;
  vy: number;

  constructor(x: number, y: number, c: string) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.life = 1;
    this.vx = (Math.random() - 0.5) * 12;
    this.vy = (Math.random() - 0.5) * 12;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.05;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.c;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export default MathBattlePage;
