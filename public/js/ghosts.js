/**
 * Module Ghosts: Logique des 4 fantômes avec gestion de la difficulté, des spawn dynamiques et du rendu HD.
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
    this.baseSpeed = 2.0;

    this.reset();
  }

  setDifficulty(difficulty) {
    if (difficulty === 'easy') {
      this.baseSpeed = 2.1;
      this.scatterChance = 0.35; // Plus distrait / moins agressif
    } else if (difficulty === 'hard') {
      this.baseSpeed = 3.2;
      this.scatterChance = 0.05; // Hyper agressif
    } else {
      // Normal
      this.baseSpeed = 2.6;
      this.scatterChance = 0.15;
    }
  }

  reset() {
    this.gridX = this.startGridX;
    this.gridY = this.startGridY;
    this.x = (this.gridX + 0.5) * this.board.tileSize;
    this.y = (this.gridY + 0.5) * this.board.tileSize;

    this.dirX = 0;
    this.dirY = -1; // Départ vers le haut
    this.state = GHOST_STATES.CHASE;
    this.frightenedTimer = 0;
    this.radius = this.board.tileSize * 0.44;
  }

  setFrightened(durationFrames = 360) {
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
    const house = this.board.mapData ? this.board.mapData.ghostHouse : { x: 9, y: 9 };
    const homeX = (house.x + 0.5) * this.board.tileSize;
    const homeY = (house.y + 0.5) * this.board.tileSize;

    if (this.state === GHOST_STATES.EATEN) {
      const dist = Math.hypot(this.x - homeX, this.y - homeY);
      if (dist < 6) {
        this.state = GHOST_STATES.CHASE;
      }
    }

    // Choisir une direction aux intersections
    if (this.isCentered()) {
      this.chooseNextDirection(pacman);
    }

    // Vitesse selon l'état
    let currentSpeed = this.baseSpeed;
    if (this.state === GHOST_STATES.FRIGHTENED) {
      currentSpeed = this.baseSpeed * 0.6;
    } else if (this.state === GHOST_STATES.EATEN) {
      currentSpeed = this.baseSpeed * 1.8;
    }

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

    return Math.abs(this.x - currentCenterX) < 3.2 && Math.abs(this.y - currentCenterY) < 3.2;
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

    const house = this.board.mapData ? this.board.mapData.ghostHouse : { x: 9, y: 9 };

    // Filtrer les directions valides
    const validDirs = possibleDirs.filter(d => {
      if (d.x === -this.dirX && d.y === -this.dirY) return false; // Pas de demi-tour immédiat

      const nextTileX = currentGridX + d.x;
      const nextTileY = currentGridY + d.y;

      if (this.board.isWall(nextTileX, nextTileY)) return false;

      // Ne pas rentrer dans la maison sauf si mangé
      if (this.state !== GHOST_STATES.EATEN && this.board.isGhostHouse(nextTileX, nextTileY) && currentGridY < house.y) {
        return false;
      }

      return true;
    });

    if (validDirs.length === 0) {
      this.dirX = -this.dirX;
      this.dirY = -this.dirY;
      return;
    }

    if (this.state === GHOST_STATES.FRIGHTENED || (Math.random() < (this.scatterChance || 0.15) && this.state === GHOST_STATES.CHASE)) {
      // Choix pseudo-aléatoire (effrayé ou distrait selon difficulté)
      const choice = validDirs[Math.floor(Math.random() * validDirs.length)];
      this.dirX = choice.x;
      this.dirY = choice.y;
    } else {
      let targetX = pacman.x;
      let targetY = pacman.y;

      if (this.state === GHOST_STATES.EATEN) {
        targetX = (house.x + 0.5) * this.board.tileSize;
        targetY = (house.y + 0.5) * this.board.tileSize;
      } else {
        // Personnalité et IA des 4 fantômes
        if (this.name === 'Pinky') {
          targetX += pacman.dirX * 4 * this.board.tileSize;
          targetY += pacman.dirY * 4 * this.board.tileSize;
        } else if (this.name === 'Inky') {
          // Embuscade en miroir
          targetX = pacman.x + (pacman.dirX * 2 * this.board.tileSize);
          targetY = pacman.y + (pacman.dirY * 2 * this.board.tileSize);
        } else if (this.name === 'Clyde') {
          const distToPacman = Math.hypot(this.x - pacman.x, this.y - pacman.y);
          if (distToPacman < 6 * this.board.tileSize) {
            targetX = 0;
            targetY = this.board.rows * this.board.tileSize;
          }
        }
      }

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

    const isHD = this.board.renderMode === 'hd';
    let mainColor = this.color;

    if (this.state === GHOST_STATES.FRIGHTENED) {
      if (this.frightenedTimer < 70 && Math.floor(this.frightenedTimer / 8) % 2 === 0) {
        mainColor = '#ffffff';
      } else {
        mainColor = '#1d4ed8';
      }
    } else if (this.state === GHOST_STATES.EATEN) {
      mainColor = 'transparent';
    }

    const r = this.radius;

    if (this.state !== GHOST_STATES.EATEN) {
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r, Math.PI, 0, false);
      ctx.lineTo(r, r);
      // Tentacules inférieures ondulées
      ctx.lineTo(r * 0.5, r * 0.6);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.5, r * 0.6);
      ctx.lineTo(-r, r);
      ctx.closePath();
      ctx.fill();

      // En mode HD : petit reflet lumineux sur la tête du fantôme
      if (isHD) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(-r * 0.25, -r * 0.35, r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Yeux
    ctx.fillStyle = '#ffffff';
    const eyeOffsetX = r * 0.35;
    const eyeOffsetY = -r * 0.2;
    const eyeRadius = r * 0.3;

    ctx.beginPath();
    ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pupilles
    ctx.fillStyle = this.state === GHOST_STATES.FRIGHTENED ? '#ef4444' : '#1e3a8a';
    const pupilRadius = eyeRadius * 0.5;
    const pupX = this.dirX * (pupilRadius * 0.7);
    const pupY = this.dirY * (pupilRadius * 0.7);

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
    this.difficulty = 'normal';
    this.rebuildGhosts();
  }

  rebuildGhosts() {
    const spawns = (this.board.mapData && this.board.mapData.ghostSpawns) ? this.board.mapData.ghostSpawns : [
      { name: 'Blinky', color: '#ff0000', x: 9, y: 8 },
      { name: 'Pinky',  color: '#ffb8ff', x: 9, y: 10 },
      { name: 'Inky',   color: '#00ffff', x: 8, y: 10 },
      { name: 'Clyde',  color: '#ffb852', x: 10, y: 10 }
    ];

    this.ghosts = spawns.map(s => new Ghost(s.name, s.color, s.x, s.y, this.board));
    this.setDifficulty(this.difficulty);
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.ghosts.forEach(ghost => ghost.setDifficulty(difficulty));
  }

  reset() {
    this.ghosts.forEach(ghost => ghost.reset());
  }

  triggerFrightened() {
    const duration = this.difficulty === 'easy' ? 450 : (this.difficulty === 'hard' ? 240 : 360);
    this.ghosts.forEach(ghost => ghost.setFrightened(duration));
  }

  update(pacman) {
    this.ghosts.forEach(ghost => ghost.update(pacman));
  }

  draw(ctx) {
    this.ghosts.forEach(ghost => ghost.draw(ctx));
  }
}
