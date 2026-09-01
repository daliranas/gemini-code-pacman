/**
 * Module Game: Moteur principal avec Cornering fluide, Fruits bonus, Particules arcade, Touch/Swipe & Clavier.
 */

const GAME_STATES = {
  MENU: 'MENU',
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY',
  LEADERBOARD: 'LEADERBOARD'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Options
    this.selectedDifficulty = 'normal';
    this.selectedMap = 'classic';
    this.selectedGraphic = 'normal';
    this.playerName = localStorage.getItem('pacman_player_name') || 'PAC';

    // Systèmes
    this.soundEngine = new SoundEngine();
    this.particles = new ParticleSystem();

    // Plateau
    this.board = new Board(this.selectedMap, this.selectedGraphic);
    this.updateCanvasSize();

    this.pacman = new Pacman(this.board);
    this.ghostManager = new GhostManager(this.board);
    this.fruitManager = new FruitManager(this.board);

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pacman_high_score')) || 0;
    this.lives = 3;
    this.comboGhostsEaten = 0;
    this.state = GAME_STATES.MENU;
    this.previousState = GAME_STATES.MENU;

    // DOM Elements HUD & Top
    this.scoreDisplay = document.getElementById('score-display');
    this.highScoreDisplay = document.getElementById('high-score-display');
    this.livesDisplay = document.getElementById('lives-display');
    this.muteBtn = document.getElementById('mute-btn');
    this.leaderboardToggleBtn = document.getElementById('leaderboard-toggle-btn');
    this.playerNameInput = document.getElementById('player-name-input');

    // Écrans
    this.overlay = document.getElementById('overlay');
    this.menuScreen = document.getElementById('menu-screen');
    this.leaderboardScreen = document.getElementById('leaderboard-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.victoryScreen = document.getElementById('victory-screen');

    this.leaderboardBody = document.getElementById('leaderboard-body');
    this.gameoverScore = document.getElementById('gameover-score');
    this.victoryScore = document.getElementById('victory-score');
    this.gameoverSaveStatus = document.getElementById('gameover-save-status');
    this.victorySaveStatus = document.getElementById('victory-save-status');

    // Boutons
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.leaderboardBackBtn = document.getElementById('leaderboard-back-btn');
    this.menuScoresBtn = document.getElementById('menu-scores-btn');
    this.gameoverScoresBtn = document.getElementById('gameover-scores-btn');
    this.victoryScoresBtn = document.getElementById('victory-scores-btn');

    if (this.playerNameInput) {
      this.playerNameInput.value = this.playerName;
      this.playerNameInput.addEventListener('input', (e) => {
        this.playerName = e.target.value.toUpperCase().trim().slice(0, 6) || 'PAC';
        localStorage.setItem('pacman_player_name', this.playerName);
      });
    }

    this.bindOptionSelectors();
    this.bindEvents();
    this.bindTouchControls();
    this.updateHUD();
    this.fetchTopScores();

    this.setupAudioAutoplay();

    // Boucle de rendu
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  updateCanvasSize() {
    this.canvas.width = this.board.cols * this.board.tileSize;
    this.canvas.height = this.board.rows * this.board.tileSize;
  }

  setupAudioAutoplay() {
    const startAudioOnInteraction = () => {
      this.soundEngine.init();
      if (this.state === GAME_STATES.MENU) {
        this.soundEngine.startMenuMusic();
      }
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
    };
    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);
  }

  bindOptionSelectors() {
    const diffButtons = document.querySelectorAll('.opt-diff');
    diffButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        diffButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = btn.dataset.value;
        this.ghostManager.setDifficulty(this.selectedDifficulty);
        this.soundEngine.playEatPellet();
      });
    });

    const mapButtons = document.querySelectorAll('.opt-map');
    mapButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        mapButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedMap = btn.dataset.value;
        this.board.setLayout(this.selectedMap);
        this.updateCanvasSize();
        this.pacman = new Pacman(this.board);
        this.ghostManager = new GhostManager(this.board);
        this.fruitManager = new FruitManager(this.board);
        this.ghostManager.setDifficulty(this.selectedDifficulty);
        this.soundEngine.playEatPellet();
      });
    });

    const gfxButtons = document.querySelectorAll('.opt-gfx');
    gfxButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        gfxButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedGraphic = btn.dataset.value;
        this.board.setRenderMode(this.selectedGraphic);
        this.soundEngine.playEatPellet();
      });
    });

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        const isMuted = this.soundEngine.toggleMute();
        this.muteBtn.textContent = isMuted ? '🔇 MUTE' : '🔊 SON';
        this.muteBtn.classList.toggle('muted', isMuted);
      });
    }
  }

  bindTouchControls() {
    // Contrôles tactiles fluides par swipe (mobile ou trackpad)
    let touchStartX = 0;
    let touchStartY = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      touchStartX = touch.pageX;
      touchStartY = touch.pageY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.pageX - touchStartX;
      const deltaY = touch.pageY - touchStartY;
      const minSwipeDistance = 20;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
          this.pacman.setNextDirection(deltaX > 0 ? 1 : -1, 0);
        }
      } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
          this.pacman.setNextDirection(0, deltaY > 0 ? 1 : -1);
        }
      }
    }, { passive: true });

    // Clic / Tap sur le D-pad virtuel
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach(btn => {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        if (dir === 'up') this.pacman.setNextDirection(0, -1);
        if (dir === 'down') this.pacman.setNextDirection(0, 1);
        if (dir === 'left') this.pacman.setNextDirection(-1, 0);
        if (dir === 'right') this.pacman.setNextDirection(1, 0);
      });
      btn.addEventListener('mousedown', (e) => {
        const dir = btn.dataset.dir;
        if (dir === 'up') this.pacman.setNextDirection(0, -1);
        if (dir === 'down') this.pacman.setNextDirection(0, 1);
        if (dir === 'left') this.pacman.setNextDirection(-1, 0);
        if (dir === 'right') this.pacman.setNextDirection(1, 0);
      });
    });
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Space' || e.code === 'Enter') && this.state === GAME_STATES.MENU) {
        this.startGame();
        return;
      }

      // Pause (touche P)
      if (e.key.toLowerCase() === 'p' && (this.state === GAME_STATES.PLAYING || this.state === GAME_STATES.PAUSED)) {
        this.state = this.state === GAME_STATES.PLAYING ? GAME_STATES.PAUSED : GAME_STATES.PLAYING;
        return;
      }

      // Flèches, ZQSD et WASD avec anticipation Cornering
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'z':
        case 'w':
          this.pacman.setNextDirection(0, -1);
          break;
        case 'arrowdown':
        case 's':
          this.pacman.setNextDirection(0, 1);
          break;
        case 'arrowleft':
        case 'q':
        case 'a':
          this.pacman.setNextDirection(-1, 0);
          break;
        case 'arrowright':
        case 'd':
          this.pacman.setNextDirection(1, 0);
          break;
      }
    });

    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.startGame());
    this.nextBtn.addEventListener('click', () => this.startGame());

    const showScoresHandler = () => {
      this.previousState = this.state;
      this.showLeaderboard();
    };

    if (this.leaderboardToggleBtn) this.leaderboardToggleBtn.addEventListener('click', showScoresHandler);
    if (this.menuScoresBtn) this.menuScoresBtn.addEventListener('click', showScoresHandler);
    if (this.gameoverScoresBtn) this.gameoverScoresBtn.addEventListener('click', showScoresHandler);
    if (this.victoryScoresBtn) this.victoryScoresBtn.addEventListener('click', showScoresHandler);

    if (this.leaderboardBackBtn) {
      this.leaderboardBackBtn.addEventListener('click', () => {
        this.setState(this.previousState || GAME_STATES.MENU);
      });
    }
  }

  async fetchTopScores() {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (data.success && Array.isArray(data.scores)) {
        this.renderLeaderboard(data.scores);
        if (data.scores.length > 0 && data.scores[0].score > this.highScore) {
          this.highScore = data.scores[0].score;
          this.updateHUD();
        }
      }
    } catch (err) {
      console.warn('Impossible de charger les scores SQLite:', err);
    }
  }

  async saveScoreToDatabase() {
    try {
      const payload = {
        playerName: this.playerName || 'PAC',
        score: this.score,
        difficulty: this.selectedDifficulty,
        mapName: this.selectedMap
      };

      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const msg = "Score sauvegardé en base de données !";
        if (this.gameoverSaveStatus) this.gameoverSaveStatus.textContent = msg;
        if (this.victorySaveStatus) this.victorySaveStatus.textContent = msg;
        this.fetchTopScores();
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du score:', err);
    }
  }

  renderLeaderboard(scores) {
    if (!this.leaderboardBody) return;
    if (scores.length === 0) {
      this.leaderboardBody.innerHTML = '<tr><td colspan="5">Aucun score enregistré</td></tr>';
      return;
    }

    this.leaderboardBody.innerHTML = scores.map((s, index) => {
      const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `${index + 1}`));
      return `
        <tr>
          <td>${medal}</td>
          <td><strong>${escapeHtml(s.player_name || 'PAC')}</strong></td>
          <td>${s.score}</td>
          <td>${(s.difficulty || 'norm').toUpperCase().slice(0, 4)}</td>
          <td>${(s.map_name || 'class').toUpperCase().slice(0, 5)}</td>
        </tr>
      `;
    }).join('');
  }

  showLeaderboard() {
    this.fetchTopScores();
    this.setState(GAME_STATES.LEADERBOARD);
  }

  startGame() {
    this.soundEngine.init();
    this.soundEngine.stopMenuMusic();

    this.board.setLayout(this.selectedMap);
    this.board.setRenderMode(this.selectedGraphic);
    this.updateCanvasSize();

    this.pacman = new Pacman(this.board);
    this.ghostManager = new GhostManager(this.board);
    this.fruitManager = new FruitManager(this.board);
    this.particles.reset();

    // Mode Secret "1414" : Pac-Man seul, aucun fantôme !
    const isSecretPeacefulMode = (this.playerName === '1414');
    if (isSecretPeacefulMode) {
      this.ghostManager.ghosts = []; // Supprime tous les monstres
      this.particles.spawnScorePopup(this.canvas.width / 2, this.canvas.height / 2 - 25, "🏖️ FANTÔMES EN RTT !", '#22c55e');
      this.particles.spawnScorePopup(this.canvas.width / 2, this.canvas.height / 2 + 10, "😎 TRANQUILLE LE PACMAN", '#fde047');
      this.particles.spawnEatParticles(this.canvas.width / 2, this.canvas.height / 2, '#22c55e', 25);
    } else {
      this.ghostManager.setDifficulty(this.selectedDifficulty);
    }

    this.score = 0;
    this.lives = 3;
    this.comboGhostsEaten = 0;
    if (this.gameoverSaveStatus) this.gameoverSaveStatus.textContent = '';
    if (this.victorySaveStatus) this.victorySaveStatus.textContent = '';

    this.updateHUD();
    this.setState(GAME_STATES.READY);
    this.soundEngine.playIntroJingle(() => {
      this.setState(GAME_STATES.PLAYING);
    });
  }

  setState(newState) {
    this.state = newState;
    this.overlay.classList.remove('hidden');

    this.menuScreen.classList.remove('active');
    this.leaderboardScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    this.victoryScreen.classList.remove('active');

    if (newState === GAME_STATES.PLAYING || newState === GAME_STATES.READY) {
      this.overlay.classList.add('hidden');
    } else if (newState === GAME_STATES.MENU) {
      this.soundEngine.startMenuMusic();
      this.menuScreen.classList.add('active');
    } else if (newState === GAME_STATES.LEADERBOARD) {
      this.leaderboardScreen.classList.add('active');
    } else if (newState === GAME_STATES.GAMEOVER) {
      this.gameoverScore.textContent = this.score;
      this.gameoverScreen.classList.add('active');
      this.saveScoreToDatabase();
    } else if (newState === GAME_STATES.VICTORY) {
      this.soundEngine.playVictory();
      this.victoryScore.textContent = this.score;
      this.victoryScreen.classList.add('active');
      this.saveScoreToDatabase();
    }
  }

  updateHUD() {
    this.scoreDisplay.textContent = String(this.score).padStart(5, '0');
    this.highScoreDisplay.textContent = String(this.highScore).padStart(5, '0');
    this.livesDisplay.textContent = '🟡 '.repeat(Math.max(0, this.lives));
  }

  checkCollisions() {
    // Collisions gommes
    const pelletCollision = this.pacman.checkPelletCollision();
    if (pelletCollision) {
      this.score += pelletCollision.points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pacman_high_score', this.highScore);
      }

      if (pelletCollision.type === 'pellet') {
        this.soundEngine.playEatPellet();
        this.particles.spawnEatParticles(this.pacman.x, this.pacman.y, '#fde047', 4);
      } else if (pelletCollision.type === 'energizer') {
        this.soundEngine.playEatEnergizer();
        this.ghostManager.triggerFrightened();
        this.comboGhostsEaten = 0;
        this.particles.spawnEatParticles(this.pacman.x, this.pacman.y, '#38bdf8', 12);
        this.particles.spawnScorePopup(this.pacman.x, this.pacman.y, "+50", '#ffff00');
      }

      this.updateHUD();

      if (this.board.remainingPellets === 0) {
        this.setState(GAME_STATES.VICTORY);
      }
    }

    // Collisions Fruits Bonus
    const fruitCollected = this.fruitManager.checkCollision(this.pacman);
    if (fruitCollected) {
      this.score += fruitCollected.points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.soundEngine.playEatGhost(); // SFX bonus

      if (fruitCollected.isDash) {
        this.pacman.triggerDash(240); // 4 secondes de boost turbo
        this.particles.spawnScorePopup(this.pacman.x, this.pacman.y, "⚡ TURBO!", '#38bdf8');
      } else {
        this.particles.spawnScorePopup(this.pacman.x, this.pacman.y, `+${fruitCollected.points}`, '#22c55e');
      }
      this.particles.spawnEatParticles(this.pacman.x, this.pacman.y, fruitCollected.color, 14);
      this.updateHUD();
    }

    // Collisions fantômes
    const pRadius = this.pacman.radius;
    for (const ghost of this.ghostManager.ghosts) {
      const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);

      if (dist < pRadius + ghost.radius * 0.7) {
        if (ghost.state === GHOST_STATES.FRIGHTENED) {
          ghost.state = GHOST_STATES.EATEN;
          this.comboGhostsEaten++;
          const ghostScore = 200 * Math.pow(2, this.comboGhostsEaten - 1); // 200, 400, 800, 1600 combo
          this.score += ghostScore;

          this.soundEngine.playEatGhost();
          this.particles.spawnEatParticles(ghost.x, ghost.y, '#60a5fa', 16);
          this.particles.spawnScorePopup(ghost.x, ghost.y, `+${ghostScore}`, '#60a5fa');
          this.updateHUD();

        } else if (ghost.state === GHOST_STATES.CHASE) {
          this.soundEngine.playDeath();
          this.particles.spawnEatParticles(this.pacman.x, this.pacman.y, '#f59e0b', 20);
          this.lives--;
          this.updateHUD();

          if (this.lives <= 0) {
            this.setState(GAME_STATES.GAMEOVER);
          } else {
            this.pacman.reset();
            this.ghostManager.reset();
            this.fruitManager.reset();
          }
          break;
        }
      }
    }
  }

  update() {
    if (this.state !== GAME_STATES.PLAYING) return;

    this.pacman.update();
    this.ghostManager.update(this.pacman);
    this.fruitManager.update(this.score);
    this.particles.update();
    this.checkCollisions();
  }

  draw() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.board.draw(this.ctx);
    this.fruitManager.draw(this.ctx);
    this.pacman.draw(this.ctx);
    this.ghostManager.draw(this.ctx);
    this.particles.draw(this.ctx);

    if (this.state === GAME_STATES.READY) {
      this.ctx.save();
      this.ctx.font = "bold 18px 'Press Start 2P', monospace";
      this.ctx.fillStyle = '#ffff00';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#ffff00';
      this.ctx.shadowBlur = 8;
      this.ctx.fillText("READY!", this.canvas.width / 2, this.canvas.height / 2 + 35);
      this.ctx.restore();
    } else if (this.state === GAME_STATES.PAUSED) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.font = "bold 18px 'Press Start 2P', monospace";
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("PAUSE", this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.restore();
    }
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
