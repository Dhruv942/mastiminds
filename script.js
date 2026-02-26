// ============================================
// IMAGE PRELOADING & CACHING
// ============================================

// Images to preload - Pole Climb only
const imagesToPreload = [
  "icon_home.png",
  "icon_panjat.png",
  "panjat_pinang/tiang.png",
  "panjat_pinang/standleft.png",
  "panjat_pinang/standright.png",
  "panjat_pinang/climbleft.png",
  "panjat_pinang/climbright.png",
];

// Object untuk menyimpan gambar yang sudah dimuat
const preloadedImages = {};
let imagesLoaded = 0;
let totalImages = imagesToPreload.length;

// Fungsi untuk preload gambar
function preloadImages() {
  console.log("🖼️ Preloading images...");

  imagesToPreload.forEach((src) => {
    const img = new Image();

    img.onload = () => {
      preloadedImages[src] = img;
      imagesLoaded++;
      console.log(`✅ Loaded: ${src} (${imagesLoaded}/${totalImages})`);

      // Semua gambar sudah dimuat
      if (imagesLoaded === totalImages) {
        console.log("🎉 All images preloaded successfully!");
      }
    };

    img.onerror = () => {
      console.error(`❌ Failed to load: ${src}`);
      imagesLoaded++;
    };

    img.src = src;
  });
}

// Preload semua gambar saat halaman dimuat
window.addEventListener("load", () => {
  preloadImages();
});

// ============================================
// GAME STATE
// ============================================

// Inisialisasi game state
const gameState = {
  leftPlayer: {
    answer: "",
    score: 0,
    climbPosition: 0, // untuk panjat pinang (0-7)
    racePosition: 0, // untuk balap karung (0-10)
    lastQuestion: "", // soal terakhir untuk mencegah duplikat
  },
  rightPlayer: {
    answer: "",
    score: 0,
    climbPosition: 0, // untuk panjat pinang (0-7)
    racePosition: 0, // untuk balap karung (0-10)
    lastQuestion: "", // soal terakhir untuk mencegah duplikat
  },
  currentGameType: "panjat-pinang", // Pole Climb only
  currentMode: "ascending", // Ascending order game
};

// Drag from top boxes → drop in bottom slots (or reorder within slots)
function initDragDrop(area, player) {
  const numbersRow = area.querySelector(".numbers-row");
  const slotsRow = area.querySelector(".slots-row");
  const slots = slotsRow.querySelectorAll(".drop-slot");

  function makeDraggable(box) {
    if (box._dragInit) return;
    box._dragInit = true;

    box.addEventListener("dragstart", (e) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", box.textContent);
      e.dataTransfer.setData("application/json", JSON.stringify({ from: box.parentElement.className }));
      box.classList.add("dragging");
    });

    box.addEventListener("dragend", () => {
      box.classList.remove("dragging");
      if (slotsRow.querySelectorAll(".number-box").length === 4) checkAnswer(player);
    });
  }

  function makeDropZone(zone) {
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      slots.forEach((s) => s.classList.remove("drop-hover"));
      zone.classList.add("drop-hover");
    });
    zone.addEventListener("dragleave", (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove("drop-hover");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("drop-hover");
      const dragging = area.querySelector(".dragging");
      if (!dragging?.classList.contains("number-box")) return;
      const existing = zone.querySelector(".number-box");
      if (existing) {
        numbersRow.appendChild(existing);
        makeDraggable(existing);
      }
      zone.appendChild(dragging);
      makeDraggable(dragging);
      if (slotsRow.querySelectorAll(".number-box").length === 4) checkAnswer(player);
    });
  }

  numbersRow.querySelectorAll(".number-box").forEach(makeDraggable);
  slots.forEach(makeDropZone);

  // Allow drop on numbers-row to return a number
  numbersRow.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  });
  numbersRow.addEventListener("drop", (e) => {
    e.preventDefault();
    const dragging = area.querySelector(".dragging");
    if (dragging && dragging.classList.contains("number-box") && dragging.closest(".drop-slot")) {
      numbersRow.appendChild(dragging);
      makeDraggable(dragging);
    }
  });
}

// Get answer from bottom slots (left to right)
function getAnswerFromBoxes(player) {
  const slotsRow = document.querySelector(
    `#gameScreenPanjatPinang .${player}-player .slots-row`,
  );
  if (!slotsRow) return "";
  const slots = slotsRow.querySelectorAll(".drop-slot");
  return Array.from(slots)
    .map((slot) => slot.querySelector(".number-box")?.textContent?.trim() || "")
    .join("");
}

// Check answer - compare bottom slots order (left→right) with correct ascending
function checkAnswer(player) {
  const gameScreen = "#gameScreenPanjatPinang";
  const playerAnswer = getAnswerFromBoxes(player);
  if (playerAnswer.length !== 4) return false;

  const slotsRow = document.querySelector(
    `${gameScreen} .${player}-player .slots-row`,
  );
  const numbers = Array.from(slotsRow.querySelectorAll(".drop-slot"))
    .map((s) => s.querySelector(".number-box"))
    .filter(Boolean)
    .map((b) => parseInt(b.textContent.trim()));
  const correctSorted = [...numbers].sort((a, b) => a - b);
  const correctAnswer = correctSorted.join("");

  const answerArea = document.querySelector(
    `${gameScreen} .${player}-player .drag-answer-area`,
  );

  if (playerAnswer === correctAnswer) {
    answerArea?.classList.remove("wrong");
    answerArea?.classList.add("correct");
    setTimeout(() => answerArea?.classList.remove("correct"), 300);

    if (gameState.currentGameType === "panjat-pinang") {
      const WINNING_STEPS = 7; // EDIT: Jumlah step untuk menang
      // Logic untuk Panjat Pinang - Jawaban BENAR (cap at 7 so image stays visible)
      if (player === "left") {
        gameState.leftPlayer.climbPosition = Math.min(gameState.leftPlayer.climbPosition + 1, WINNING_STEPS);
      } else {
        gameState.rightPlayer.climbPosition = Math.min(gameState.rightPlayer.climbPosition + 1, WINNING_STEPS);
      }
      updateClimberPosition(player);
      updateScoreDisplay(player); // Update tampilan score

      const currentPos = player === "left" ? gameState.leftPlayer.climbPosition : gameState.rightPlayer.climbPosition;
      if (currentPos < WINNING_STEPS) {
        setTimeout(() => generateNewQuestion(player), 500);
      }

      // Cek kemenangan Panjat Pinang
      if (gameState.leftPlayer.climbPosition >= WINNING_STEPS) {
        setTimeout(() => {
          showWinnerModal(
            "Left Player",
            "Congratulations! You reached the top of the pole!",
          );
        }, 600);
      } else if (gameState.rightPlayer.climbPosition >= WINNING_STEPS) {
        setTimeout(() => {
          showWinnerModal(
            "Right Player",
            "Congratulations! You reached the top of the pole!",
          );
        }, 600);
      }
    }

    return true;
  } else {
    answerArea?.classList.add("wrong");
    setTimeout(() => answerArea?.classList.remove("wrong"), 500);

    // Logic untuk Panjat Pinang - Jawaban SALAH
    if (gameState.currentGameType === "panjat-pinang") {
      const currentPosition =
        player === "left"
          ? gameState.leftPlayer.climbPosition
          : gameState.rightPlayer.climbPosition;

      // Hanya kurangi jika posisi > 0 (sudah mulai memanjat)
      if (currentPosition > 0) {
        if (player === "left") {
          gameState.leftPlayer.climbPosition--;
        } else {
          gameState.rightPlayer.climbPosition--;
        }
        updateClimberPosition(player); // Turunkan posisi
        updateScoreDisplay(player); // Update tampilan score
      }
    }

    return false;
  }
}

// Generate ascending order question: 4 random numbers 1-9, shuffled
function generateAscendingNumbers() {
  const numbers = [];
  for (let i = 0; i < 4; i++) {
    numbers.push(Math.floor(Math.random() * 9) + 1);
  }
  // Shuffle
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

// Update score display
function updateScoreDisplay(player) {
  const scoreElement = document.querySelector(
    `#gameScreenPanjatPinang .${player}-player .score-value`,
  );
  if (scoreElement) {
    const score =
      player === "left"
        ? gameState.leftPlayer.climbPosition
        : gameState.rightPlayer.climbPosition;
    scoreElement.textContent = `${score}/7`;
  }
}

// Fungsi untuk mengupdate posisi pemanjat
function updateClimberPosition(player) {
  const climberClass = player === "left" ? ".left-climber" : ".right-climber";
  const climberContainer = document.querySelector(
    `#gameScreenPanjatPinang ${climberClass}`,
  );
  const standImage = climberContainer.querySelector(".stand");
  const climbImage = climberContainer.querySelector(".climb");

  // Update posisi vertikal (setiap jawaban benar naik)
  const climbPosition =
    player === "left"
      ? gameState.leftPlayer.climbPosition
      : gameState.rightPlayer.climbPosition;

  // ============================================
  // PENGATURAN PANJAT PINANG (EDIT DI SINI)
  // ============================================
  const TOTAL_STEPS = 7; // Jumlah jawaban benar untuk menang
  const MAX_HEIGHT_PERCENT = 75; // Tinggi maksimal (% dari tiang)

  // Hitung persentase ketinggian - cap at 7 so image never goes off screen
  const cappedPosition = Math.min(climbPosition, TOTAL_STEPS);
  const heightPercentage = Math.min(MAX_HEIGHT_PERCENT, (cappedPosition / TOTAL_STEPS) * MAX_HEIGHT_PERCENT);

  // Cek posisi dan ganti gambar sesuai
  if (climbPosition === 0) {
    // Posisi 0: Kembali ke stand
    climbImage.style.display = "none";
    standImage.style.display = "block";
    climberContainer.style.bottom = "0%";
  } else if (climbPosition === 1) {
    // Posisi 1: Ganti dari stand ke climb (pertama kali memanjat)
    standImage.style.display = "none";
    climbImage.style.display = "block";

    // Force reflow
    void climberContainer.offsetHeight;

    // Update posisi vertikal dengan animasi
    setTimeout(() => {
      climberContainer.style.bottom = `${heightPercentage}%`;
    }, 50);
  } else {
    // Posisi 2-7: Hanya update posisi vertikal (tetap climb)
    climberContainer.style.bottom = `${heightPercentage}%`;
  }
}

// Removed: updateRacerPosition (Sack Race removed)

// Create confetti
function createConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
  ];

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 3;

    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = randomInRange(0, 100) + "%";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = randomInRange(2, 4) + "s";
      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 4000);
    }
  }, 50);
}

// Fungsi untuk menampilkan modal pemenang
function showWinnerModal(winner, message) {
  createConfetti();

  const modal = document.getElementById("winnerModal");
  const winnerText = document.getElementById("winnerText");
  const winnerMessage = document.getElementById("winnerMessage");
  winnerText.innerHTML = `<span>🎉</span><span>${winner} Wins!</span><span>🎉</span>`;
  winnerMessage.textContent = message;
  modal.style.display = "flex";

  // Keep Home and Fullscreen buttons visible - user can still use them
}

// Fungsi untuk menutup modal dan restart game dengan countdown
function closeModal() {
  const modal = document.getElementById("winnerModal");
  modal.style.display = "none";

  // Show kembali tombol Home dan Fullscreen ketika modal ditutup
  const homeBtn = document.getElementById("homeBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (homeBtn) homeBtn.style.display = "flex";
  if (fullscreenBtn) fullscreenBtn.style.display = "flex";

  // Tampilkan countdown sebelum restart game
  showCountdown();
}

// Generate new question - numbers in top row, clear bottom slots
function generateNewQuestion(player) {
  const area = document.querySelector(
    `#gameScreenPanjatPinang .${player}-player .drag-answer-area`,
  );
  const numbersRow = area?.querySelector(".numbers-row");
  const slotsRow = area?.querySelector(".slots-row");
  if (!numbersRow || !slotsRow) return;

  const lastQuestion =
    player === "left"
      ? gameState.leftPlayer.lastQuestion
      : gameState.rightPlayer.lastQuestion;

  let numbers = [];
  let questionText = "";
  let maxRetries = 20;
  let retryCount = 0;

  do {
    numbers = generateAscendingNumbers();
    questionText = numbers.join(",");
    retryCount++;
    if (retryCount >= maxRetries) break;
  } while (questionText === lastQuestion && lastQuestion !== "");

  if (player === "left") {
    gameState.leftPlayer.lastQuestion = questionText;
  } else {
    gameState.rightPlayer.lastQuestion = questionText;
  }

  // Clear bottom slots - move any numbers back to top
  slotsRow.querySelectorAll(".number-box").forEach((box) => {
    numbersRow.appendChild(box);
  });

  // Reorder top row with new numbers
  numbersRow.innerHTML = "";
  numbers.forEach((num) => {
    const box = document.createElement("div");
    box.className = "number-box";
    box.setAttribute("draggable", "true");
    box.textContent = num;
    numbersRow.appendChild(box);
  });

  initDragDrop(area, player);
}

// Reset game - Pole Climb only
function resetGame() {
  gameState.leftPlayer.answer = "";
  gameState.rightPlayer.answer = "";
  gameState.leftPlayer.score = 0;
  gameState.rightPlayer.score = 0;
  gameState.leftPlayer.climbPosition = 0;
  gameState.rightPlayer.climbPosition = 0;
  gameState.leftPlayer.lastQuestion = "";
  gameState.rightPlayer.lastQuestion = "";

  if (gameState.currentGameType === "panjat-pinang") {
    // Reset climber positions
    document.querySelectorAll(".climber-container").forEach((container) => {
      container.style.bottom = "0";
      const standImage = container.querySelector(".stand");
      const climbImage = container.querySelector(".climb");
      standImage.style.display = "block";
      climbImage.style.display = "none";
    });

    // Update score display untuk reset ke 0/7
    updateScoreDisplay("left");
    updateScoreDisplay("right");
  }

  generateNewQuestion("left");
  generateNewQuestion("right");

}

// Setup event listeners for Pole Climb game
function setupEventListeners(gameScreenId) {
  const gameScreen = document.getElementById(gameScreenId);

  gameScreen.querySelectorAll(".player-section").forEach((section) => {
    const player = section.classList.contains("left-player") ? "left" : "right";

    const area = section.querySelector(".drag-answer-area");
    if (area) initDragDrop(area, player);
  });
}

// Setup event listeners for all game screens
setupEventListeners("gameScreenPanjatPinang");

// Show game type menu (Pole Climb only)
function showGameTypeMenu() {
  document.getElementById("gameTypeMenu").style.display = "flex";
  document.getElementById("gameScreenPanjatPinang").style.display = "none";
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.style.display = "none";
}

// Fungsi untuk memilih game type - langsung mulai game (tanpa pilih +-*/ atau level)
function selectGameType(gameType) {
  gameState.currentGameType = gameType;
  gameState.currentMode = "ascending";
  showCountdown();
}

// Fungsi untuk menampilkan countdown
function showCountdown() {
  const overlay = document.getElementById("countdownOverlay");

  // Hide tombol Home dan Fullscreen saat countdown berjalan
  const homeBtn = document.getElementById("homeBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (homeBtn) homeBtn.style.display = "none";
  if (fullscreenBtn) fullscreenBtn.style.display = "none";

  // Show overlay
  overlay.classList.add("show");

  const countdownSequence = [
    { number: "3", text: "Get Ready..." },
    { number: "2", text: "Concentrate..." },
    { number: "1", text: "Focus..." },
    { number: "Go!", text: "Let's Go!!!", isStart: true },
  ];

  function updateCountdown(index) {
    if (index >= countdownSequence.length) {
      // Countdown selesai, sembunyikan overlay dan mulai game
      setTimeout(() => {
        overlay.classList.remove("show");
        startGame();
      }, 500);
      return;
    }

    const current = countdownSequence[index];

    // Query element setiap kali (karena setelah replaceWith, reference lama jadi invalid)
    const numberEl = document.getElementById("countdownNumber");
    const textEl = document.getElementById("countdownText");

    // Update content
    numberEl.textContent = current.number;
    textEl.textContent = current.text;

    // Tambah/hapus class khusus untuk "Mulai!"
    if (current.isStart) {
      numberEl.classList.add("start");
      textEl.classList.add("start");
    } else {
      numberEl.classList.remove("start");
      textEl.classList.remove("start");
    }

    // Trigger reflow untuk restart animation
    numberEl.style.animation = "none";
    textEl.style.animation = "none";
    void numberEl.offsetHeight; // Trigger reflow
    numberEl.style.animation = "";
    textEl.style.animation = "";

    // Schedule next countdown
    if (index < countdownSequence.length - 1) {
      setTimeout(() => updateCountdown(index + 1), 1000);
    } else {
      // "Mulai!" - tahan lebih lama sebelum mulai game
      setTimeout(() => updateCountdown(index + 1), 800);
    }
  }

  // Mulai countdown
  updateCountdown(0);
}

// Fungsi untuk memulai game
function startGame() {
  document.getElementById("gameTypeMenu").style.display = "none";
  const homeBtn = document.getElementById("homeBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  if (homeBtn) homeBtn.style.display = "flex";
  if (fullscreenBtn) fullscreenBtn.style.display = "flex";

  // Show Pole Climb game screen
  document.getElementById("gameScreenPanjatPinang").style.display = "flex";

  resetGame();
}

// Fungsi untuk update keypad layout based on mode
function updateKeypadLayout() {
  const minusButtons = document.querySelectorAll(".minus-btn");
  const decimalButtons = document.querySelectorAll(".decimal-btn");
  const goButtons = document.querySelectorAll(".go-btn");
  const row5s = document.querySelectorAll(".keypad-row-5");
  const row4s = document.querySelectorAll(".keypad-row-4");

  if (gameState.currentMode === "ascending") {
    // Ascending order: hide minus and decimal, simple [C] [0] [Go] layout
    minusButtons.forEach((btn) => btn.classList.remove("visible"));
    decimalButtons.forEach((btn) => btn.classList.remove("visible"));
    goButtons.forEach((btn) => btn.classList.remove("hidden"));
    row5s.forEach((row) => row.classList.remove("visible"));
    row4s.forEach((row) => {
      row.classList.remove("subtraction-mode");
      row.classList.remove("division-mode");
    });
  } else if (gameState.currentMode === "subtraction") {
    // Subtraction mode: [−] [0] [C] then [Go] below
    minusButtons.forEach((btn) => btn.classList.add("visible"));
    decimalButtons.forEach((btn) => btn.classList.remove("visible"));
    goButtons.forEach((btn) => btn.classList.add("hidden"));
    row5s.forEach((row) => row.classList.add("visible"));
    row4s.forEach((row) => {
      row.classList.add("subtraction-mode");
      row.classList.remove("division-mode");
    });
  } else if (gameState.currentMode === "division") {
    // Division mode: [.] [0] [C] then [Go] below
    minusButtons.forEach((btn) => btn.classList.remove("visible"));
    decimalButtons.forEach((btn) => btn.classList.add("visible"));
    goButtons.forEach((btn) => btn.classList.add("hidden"));
    row5s.forEach((row) => row.classList.add("visible"));
    row4s.forEach((row) => {
      row.classList.remove("subtraction-mode");
      row.classList.add("division-mode");
    });
  } else {
    // Addition/Multiplication mode: [C] [0] [Go]
    minusButtons.forEach((btn) => btn.classList.remove("visible"));
    decimalButtons.forEach((btn) => btn.classList.remove("visible"));
    goButtons.forEach((btn) => btn.classList.remove("hidden"));
    row5s.forEach((row) => row.classList.remove("visible"));
    row4s.forEach((row) => {
      row.classList.remove("subtraction-mode");
      row.classList.remove("division-mode");
    });
  }
}

// Fungsi untuk kembali ke menu game type
function backToGameTypeMenu() {
  showGameTypeMenu();
}

// Fungsi untuk kembali ke menu utama (tidak dipakai - flow langsung ke game)
function backToMainMenu() {
  showGameTypeMenu();
}

// Initialize - tampilkan menu game type
showGameTypeMenu();

// ============================================
// FIT TO SCREEN HANDLING - IMPROVED
// ============================================

// Prevent zoom on double-tap (mobile) - only register once
let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  { passive: false },
);

// Prevent pinch zoom on mobile
document.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false },
);

// Function to detect device type and resolution
function getDeviceInfo() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = window.devicePixelRatio || 1;
  const screenWidth = screen.width;
  const screenHeight = screen.height;

  // Detect Interactive Flat Panel (high resolution, large screen)
  const isInteractivePanel =
    screenWidth >= 3840 ||
    screenHeight >= 2160 ||
    width >= 3840 ||
    height >= 2160;

  // Detect mobile device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
    (width <= 768 && "ontouchstart" in window);

  // Detect tablet
  const isTablet = width >= 768 && width <= 1024 && "ontouchstart" in window;

  return {
    width,
    height,
    dpr,
    screenWidth,
    screenHeight,
    isInteractivePanel,
    isMobile,
    isTablet,
    aspectRatio: width / height,
  };
}

// Function to optimize layout based on device
function optimizeLayout() {
  const deviceInfo = getDeviceInfo();

  // Set custom CSS variables based on device
  if (deviceInfo.isInteractivePanel) {
    // Interactive Flat Panel optimizations
    document.documentElement.style.setProperty("--custom-scale", "1.5");
    document.documentElement.style.setProperty("--custom-font-scale", "1.6");
    console.log("📺 Interactive Flat Panel detected - applying optimizations");
  } else if (deviceInfo.isMobile) {
    // Mobile optimizations
    document.documentElement.style.setProperty("--custom-scale", "0.8");
    document.documentElement.style.setProperty("--custom-font-scale", "0.9");
    console.log("📱 Mobile device detected");
  } else if (deviceInfo.isTablet) {
    // Tablet optimizations
    document.documentElement.style.setProperty("--custom-scale", "0.9");
    document.documentElement.style.setProperty("--custom-font-scale", "1");
    console.log("📱 Tablet device detected");
  }

  // Handle aspect ratio
  if (deviceInfo.aspectRatio > 2) {
    // Ultra-wide displays
    document.body.classList.add("ultra-wide");
  } else if (deviceInfo.aspectRatio < 0.6) {
    // Very tall displays (portrait phones)
    document.body.classList.add("tall-display");
  }

  console.log("📊 Device Info:", deviceInfo);
}

// Function to force fit to screen and prevent scroll
function forceFitToScreen() {
  // Prevent any scrolling
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // Force viewport units
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  // Set CSS variables for dynamic viewport
  document.documentElement.style.setProperty("--vh", `${vh * 0.01}px`);
  document.documentElement.style.setProperty("--vw", `${vw * 0.01}px`);

  // Prevent pull-to-refresh
  document.body.style.overscrollBehavior = "none";
  document.body.style.overscrollBehaviorY = "none";
  document.body.style.touchAction = "none";

  // Optimize layout based on device
  optimizeLayout();
}

// Call on load
window.addEventListener("load", () => {
  forceFitToScreen();

  // Set initial viewport meta tag for better mobile support
  let viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  }
});

// Handle window resize/orientation change
let resizeTimeout;
window.addEventListener("resize", () => {
  // Debounce resize for performance
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    forceFitToScreen();
  }, 100);
});

// Handle orientation change (mobile devices)
window.addEventListener("orientationchange", () => {
  // Delay to ensure new dimensions are available
  setTimeout(() => {
    forceFitToScreen();
    // Force a re-render
    document.body.style.display = "none";
    document.body.offsetHeight; // Trigger reflow
    document.body.style.display = "";
  }, 300);
});

// Also handle visual viewport changes (mobile browser address bar)
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    forceFitToScreen();
  });

  window.visualViewport.addEventListener("scroll", () => {
    // Reset scroll position
    window.scrollTo(0, 0);
  });
}

// Prevent default touch behaviors
document.addEventListener("gesturestart", (e) => e.preventDefault(), {
  passive: false,
});
document.addEventListener("gesturechange", (e) => e.preventDefault(), {
  passive: false,
});
document.addEventListener("gestureend", (e) => e.preventDefault(), {
  passive: false,
});

// ============================================
// FULLSCREEN FUNCTIONALITY - ENHANCED
// ============================================

// Function to toggle fullscreen mode
function toggleFullscreen() {
  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    // Enter fullscreen
    const elem = document.documentElement;

    // Try to request fullscreen with navigation UI hidden (for mobile)
    const fullscreenOptions = {
      navigationUI: "hide",
    };

    if (elem.requestFullscreen) {
      elem
        .requestFullscreen(fullscreenOptions)
        .then(() => {
          console.log("✅ Entered fullscreen mode");
          forceFitToScreen();
        })
        .catch((err) => {
          console.error("❌ Error entering fullscreen:", err);
        });
    } else if (elem.mozRequestFullScreen) {
      // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      // Chrome, Safari, Opera
      // For iOS Safari
      if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) {
        elem.webkitEnterFullscreen();
      }
    } else if (elem.msRequestFullscreen) {
      // IE/Edge
      elem.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        console.log("✅ Exited fullscreen mode");
        forceFitToScreen();
      });
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      // Chrome, Safari, Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
  }
}

// Listen for fullscreen changes to update the icon
document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("mozfullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
document.addEventListener("MSFullscreenChange", handleFullscreenChange);

function handleFullscreenChange() {
  if (
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  ) {
    // In fullscreen mode
    document.body.classList.add("fullscreen");
    console.log("🔳 Fullscreen mode: ON");
  } else {
    // Not in fullscreen mode
    document.body.classList.remove("fullscreen");
    console.log("🔲 Fullscreen mode: OFF");
  }

  // Re-optimize layout after fullscreen change
  setTimeout(() => {
    forceFitToScreen();
  }, 100);
}

// Auto-enter fullscreen on first user interaction (optional)
let hasInteracted = false;
function tryAutoFullscreen() {
  if (!hasInteracted) {
    hasInteracted = true;
    const deviceInfo = getDeviceInfo();

    // Auto fullscreen for Interactive Panels and tablets
    if (deviceInfo.isInteractivePanel || deviceInfo.isTablet) {
      console.log("🎯 Auto-requesting fullscreen for optimal experience");
      // Small delay to ensure user gesture is registered
      setTimeout(() => {
        toggleFullscreen();
      }, 100);
    }
  }
}

// Add listeners for first interaction
document.addEventListener("click", tryAutoFullscreen, { once: true });
document.addEventListener("touchstart", tryAutoFullscreen, { once: true });
