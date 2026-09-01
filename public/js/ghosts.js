/**
 * Module Ghosts: Logique des 4 fantômes avec IA simple de déplacement et modes de jeu.
 */

const GHOST_STATES = {
  CHASE: 'CHASE',
  FRIGHTENED: 'FRIGHTENED',
  EATEN: 'EATEN'
};

class Ghost {
  constructor(name, color, startGridX, startGridY, board) {
    this.name = name;
    this.color = color;
    this.startGridX = startGridX;
    this.startGridY = startGridY;
    this.board = board;

    this.reset();
  }

  reset() {
    this.gridX = this.startGridX;
    this.gridY = this.startGridY;
    this.x = (this.gridX + 0.5) * this.board.tileSize;
    this.y = (this.gridY + 0.5) * this.board.tileSize;

    this.speed = 2.0;
    this.dirX = 0;
    this.dirY = -1; // Départ vers le haut
    this.state = GHOST_STATES.CHASE;
    this.frightenedTimer = 0;
    this.radius = this.board.tileSize * 0.45;
  }

  setFrightened(durationFrames = 300) {
    if (this.state !== GHOST_STATES.EATEN) {
      this.state = GHOST_STATES.FRIGHTENED;
      this.frightenedTimer = durationFrames;
      // Inverser la direction
      this.dirX = -this.dirX;
      this.dirY = -this.dirY;
    }
  }

  update(pacman) {
    // Gestion du timer effrayé
    if (this.state === GHOST_STATES.FRIGHTENED) {
      this.frightenedTimer--;
      if (this.frightenedTimer <= 0) {
        this.state = GHOST_STATES.CHASE;
      }
    }

    // Si mangé et de retour à la maison des fantômes
    if (this.state === GHOST_STATES.EATEN) {
      const homeX = (9 + 0.5) * this.board.tileSize;
      const homeY = (9 + 0.5) * this.board.tileSize;
      const dist = Math.hypot(this.x - homeX, this.y - homeY);
      if (dist < 5) {
        this.state = GHOST_STATES.CHASE;
        this.speed = 2.0;
      }
    }

    // Choisir une direction aux intersections
    if (this.isCentered()) {
      this.chooseNextDirection(pacman);
    }

    // Déplacement
    const currentSpeed = this.state === GHOST_STATES.FRIGHTENED ? 1.2 : (this.state === GHOST_STATES.EATEN ? 4.0 : this.speed);
    this.x += this.dirX * currentSpeed;
    this.y += this.dirY * currentSpeed;

    // Tunnel Wrap
    const boardWidth = this.board.cols * this.board.tileSize;
    if (this.x < -this.radius) {
      this.x = boardWidth + this.radius;
    } else if (this.x > boardWidth + this.radius) {
      this.x = -this.radius;
    }

    this.gridX = Math.floor(this.x / this.board.tileSize);
    this.gridY = Math.floor(this.y / this.board.tileSize);
  }

  isCentered() {
    const halfTile = this.board.tileSize / 2;
    const currentCenterX = Math.floor(this.x / this.board.tileSize) * this.board.tileSize + halfTile;
    const currentCenterY = Math.floor(this.y / this.board.tileSize) * this.board.tileSize + halfTile;

    return Math.abs(this.x - currentCenterX) < 2.0 && Math.abs(this.y - currentCenterY) < 2.0;
  }

  chooseNextDirection(pacman) {
    const currentGridX = Math.floor(this.x / this.board.tileSize);
    const currentGridY = Math.floor(this.y / this.board.tileSize);

    const possibleDirs = [
      { x: 0, y: -1 }, // Haut
      { x: 0, y: 1 },  // Bas
      { x: -1, y: 0 }, // Gauche
      { x: 1, y: 0 }   // Droite
    ];

    // Filtrer les directions valides (pas de mur, pas de demi-tour immédiat sauf si bloqué)
    const validDirs = possibleDirs.filter(d => {
      if (d.x === -this.dirX && d.y === -this.dirY) return false; // Ne pas faire demi-tour

      const nextTileX = currentGridX + d.x;
      const nextTileY = currentGridY + d.y;

      if (this.board.isWall(nextTileX, nextTileY)) return false;

      // Si le fantôme n'est pas mangé, il ne retourne pas dans la maison sauf si effrayé ou coincé
      if (this.state !== GHOST_STATES.EATEN && this.board.isGhostHouse(nextTileX, nextTileY) && currentGridY < 9) {
        return false;
      }

      return true;
    });

    if (validDirs.length === 0) {
      // Si seule option est demi-tour
      this.dirX = -this.dirX;
      this.dirY = -this.dirY;
      return;
    }

    if (this.state === GHOST_STATES.FRIGHTENED) {
      // Choix aléatoire en mode effrayé
      const choice = validDirs[Math.floor(Math.random() * validDirs.length)];
      this.dirX = choice.x;
      this.dirY = choice.y;
    } else {
      // Déterminer la cible (Target) selon l'IA du fantôme
      let targetX = pacman.x;
      let targetY = pacman.y;

      if (this.state === GHOST_STATES.EATEN) {
        targetX = (9 + 0.5) * this.board.tileSize;
        targetY = (9 + 0.5) * this.board.tileSize;
      } else {
        // IA spécifique simple
        if (this.name === 'Pinky') {
          targetX += pacman.dirX * 4 * this.board.tileSize;
          targetY += pacman.dirY * 4 * this.board.tileSize;
        } else if (this.name === 'Clyde') {
          const distToPacman = Math.hypot(this.x - pacman.x, this.y - pacman.y);
          if (distToPacman < 8 * this.board.tileSize) {
            targetX = 0;
            targetY = this.board.rows * this.board.tileSize;
          }
        }
      }

      // Sélectionner la direction qui minimise la distance Euclidienne vers la cible
      let bestDir = validDirs[0];
      let minDistance = Infinity;

      for (const d of validDirs) {
        const nextX = (currentGridX + d.x + 0.5) * this.board.tileSize;
        const nextY = (currentGridY + d.y + 0.5) * this.board.tileSize;
        const dist = Math.hypot(nextX - targetX, nextY - targetY);

        if (dist < minDistance) {
          minDistance = dist;
          bestDir = d;
        }
      }

      this.dirX = bestDir.x;
      this.dirY = bestDir.y;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let mainColor = this.color;
    if (this.state === GHOST_STATES.FRIGHTENED) {
      // Clignoter quand le temps presse
      if (this.frightenedTimer < 60 && Math.floor(this.frightenedTimer / 10) % 2 === 0) {
        mainColor = '#ffffff';
      } else {
        mainColor = '#0000ff';
      }
    } else if (this.state === GHOST_STATES.EATEN) {
      mainColor = 'transparent';
    }

    const r = this.radius;

    if (this.state !== GHOST_STATES.EATEN) {
      // Corps du fantôme
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r, Math.PI, 0, false);
      ctx.lineTo(r, r);
      // Vagues du bas
      ctx.lineTo(r * 0.5, r * 0.6);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.5, r * 0.6);
      ctx.lineTo(-r, r);
      ctx.closePath();
      ctx.fill();
    }

    // Yeux
    ctx.fillStyle = '#ffffff';
    const eyeOffsetX = r * 0.35;
    const eyeOffsetY = -r * 0.2;
    const eyeRadius = r * 0.3;

    // Oeil gauche & droit
    ctx.beginPath();
    ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupilles orientées selon la direction
    ctx.fillStyle = this.state === GHOST_STATES.FRIGHTENED ? '#ff0000' : '#0000ff';
    const pupilRadius = eyeRadius * 0.5;
    const pupX = this.dirX * (pupilRadius * 0.8);
    const pupY = this.dirY * (pupilRadius * 0.8);

    ctx.beginPath();
    ctx.arc(-eyeOffsetX + pupX, eyeOffsetY + pupY, pupilRadius, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX + pupX, eyeOffsetY + pupY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class GhostManager {
  constructor(board) {
    this.board = board;
    this.ghosts = [
      new Ghost('Blinky', '#ff0000', 9, 8, board),   // Rouge
      new Ghost('Pinky', '#ffb8ff', 9, 10, board),   // Rose
      new Ghost('Inky', '#00ffff', 8, 10, board),    // Cyan
      new Ghost('Clyde', '#ffb852', 10, 10, board)   // Orange
    ];
  }

  reset() {
    this.ghosts.forEach(ghost => ghost.reset());
  }

  triggerFrightened() {
    this.ghosts.forEach(ghost => ghost.setFrightened());
  }

  update(pacman) {
    this.ghosts.forEach(ghost => ghost.update(pacman));
  }

  draw(ctx) {
    this.ghosts.forEach(ghost => ghost.draw(ctx));
  }
}
