/**
 * Module Game: Moteur principal, gestionnaire d'états, boucles de jeu et HUD.
 */

const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.board = new Board(22); // Taille de case 22px
    this.canvas.width = this.board.cols * this.board.tileSize;
    this.canvas.height = this.board.rows * this.board.tileSize;

    this.pacman = new Pacman(this.board);
    this.ghostManager = new GhostManager(this.board);

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pacman_high_score')) || 0;
    this.lives = 3;
    this.state = GAME_STATES.MENU;

    // Web Audio Synth pour effets sonores rétro auto-contenus
    this.initAudio();

    // DOM Elements
    this.scoreDisplay = document.getElementById('score-display');
    this.highScoreDisplay = document.getElementById('high-score-display');
    this.livesDisplay = document.getElementById('lives-display');

    this.overlay = document.getElementById('overlay');
    this.menuScreen = document.getElementById('menu-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.victoryScreen = document.getElementById('victory-screen');

    this.gameoverScore = document.getElementById('gameover-score');
    this.victoryScore = document.getElementById('victory-score');

    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');
    this.nextBtn = document.getElementById('next-btn');

    this.bindEvents();
    this.updateHUD();

    // Démarrer la boucle d'animation
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playSound(type) {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    const now = this.audioCtx.currentTime;

    if (type === 'waka') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);

    } else if (type === 'energizer') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);

    } else if (type === 'eatGhost') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);

    } else if (type === 'death') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  }

  bindEvents() {
    // Écouteurs clavier (Flèches + ZQSD / WASD)
    window.addEventListener('keydown', (e) => {
      // Démarrage par Espace / Entrée sur menu
      if ((e.code === 'Space' || e.code === 'Enter') && this.state !== GAME_STATES.PLAYING) {
        this.startGame();
        return;
      }

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

    // Boutons des overlays
    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.startGame());
    this.nextBtn.addEventListener('click', () => this.startGame());
  }

  startGame() {
    this.board.reset();
    this.pacman.reset();
    this.ghostManager.reset();
    this.score = 0;
    this.lives = 3;
    this.setState(GAME_STATES.PLAYING);
    this.updateHUD();
  }

  setState(newState) {
    this.state = newState;
    this.overlay.classList.remove('hidden');

    this.menuScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    this.victoryScreen.classList.remove('active');

    if (newState === GAME_STATES.PLAYING) {
      this.overlay.classList.add('hidden');
    } else if (newState === GAME_STATES.MENU) {
      this.menuScreen.classList.add('active');
    } else if (newState === GAME_STATES.GAMEOVER) {
      this.gameoverScore.textContent = this.score;
      this.gameoverScreen.classList.add('active');
    } else if (newState === GAME_STATES.VICTORY) {
      this.victoryScore.textContent = this.score;
      this.victoryScreen.classList.add('active');
    }
  }

  updateHUD() {
    this.scoreDisplay.textContent = String(this.score).padStart(5, '0');
    this.highScoreDisplay.textContent = String(this.highScore).padStart(5, '0');
    this.livesDisplay.textContent = '🟡 '.repeat(Math.max(0, this.lives));
  }

  checkCollisions() {
    // Collisions avec les gommes
    const pelletCollision = this.pacman.checkPelletCollision();
    if (pelletCollision) {
      this.score += pelletCollision.points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('pacman_high_score', this.highScore);
      }

      if (pelletCollision.type === 'pellet') {
        this.playSound('waka');
      } else if (pelletCollision.type === 'energizer') {
        this.playSound('energizer');
        this.ghostManager.triggerFrightened();
      }

      this.updateHUD();

      // Condition de victoire
      if (this.board.remainingPellets === 0) {
        this.setState(GAME_STATES.VICTORY);
      }
    }

    // Collisions avec les fantômes
    const pRadius = this.pacman.radius;
    for (const ghost of this.ghostManager.ghosts) {
      const dist = Math.hypot(this.pacman.x - ghost.x, this.pacman.y - ghost.y);

      if (dist < pRadius + ghost.radius * 0.7) {
        if (ghost.state === GHOST_STATES.FRIGHTENED) {
          // Pac-Man mange le fantôme
          ghost.state = GHOST_STATES.EATEN;
          this.score += 200;
          this.playSound('eatGhost');
          this.updateHUD();

        } else if (ghost.state === GHOST_STATES.CHASE) {
          // Pac-Man perd une vie
          this.playSound('death');
          this.lives--;
          this.updateHUD();

          if (this.lives <= 0) {
            this.setState(GAME_STATES.GAMEOVER);
          } else {
            this.pacman.reset();
            this.ghostManager.reset();
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
    this.checkCollisions();
  }

  draw() {
    // Effacer l'écran
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner le labyrinthe et les éléments
    this.board.draw(this.ctx);
    this.pacman.draw(this.ctx);
    this.ghostManager.draw(this.ctx);
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// Initialiser le jeu une fois le DOM chargé
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
