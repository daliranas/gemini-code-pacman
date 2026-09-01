/**
 * Module Player: Contrôle et logique de déplacement du joueur Pac-Man.
 * Supporte les positions d'apparition dynamiques, Cornering fluide et traversée sans faille du tunnel.
 */

class Pacman {
  constructor(board) {
    this.board = board;
    this.reset();
  }

  reset() {
    const start = this.board.mapData ? this.board.mapData.pacmanStart : { x: 9, y: 16 };
    this.gridX = start.x;
    this.gridY = start.y;
    this.x = (this.gridX + 0.5) * this.board.tileSize;
    this.y = (this.gridY + 0.5) * this.board.tileSize;

    this.speed = 3.2;
    this.baseSpeed = 3.2;
    this.dashTimer = 0;
    this.dirX = 0;
    this.dirY = 0;
    this.nextDirX = 0;
    this.nextDirY = 0;

    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.025;
    this.radius = this.board.tileSize * 0.44;
    this.rotation = 0;
  }

  triggerDash(durationFrames = 180) {
    this.dashTimer = durationFrames;
  }

  setNextDirection(dirX, dirY) {
    const boardWidth = this.board.cols * this.board.tileSize;
    
    // Si Pacman est hors champ dans le tunnel, interdire les commandes verticales
    if ((this.x < 0 || this.x > boardWidth) && dirY !== 0) {
      return;
    }

    this.nextDirX = dirX;
    this.nextDirY = dirY;

    // Demi-tour immédiat
    if (this.dirX !== 0 && dirX === -this.dirX) {
      this.dirX = dirX;
      this.dirY = 0;
      this.nextDirX = 0;
      this.updateRotation();
      return;
    }
    if (this.dirY !== 0 && dirY === -this.dirY) {
      this.dirX = 0;
      this.dirY = dirY;
      this.nextDirY = 0;
      this.updateRotation();
      return;
    }
  }

  update() {
    if (this.dashTimer > 0) {
      this.dashTimer--;
      this.speed = this.baseSpeed * 1.4;
    } else {
      this.speed = this.baseSpeed;
    }

    const tileSize = this.board.tileSize;
    const boardWidth = this.board.cols * tileSize;

    // 1. GESTION STRICTE DU TUNNEL (WRAP-AROUND INSTANTANÉ)
    if (this.x < 0 && this.dirX < 0) {
      // Traverse le tunnel gauche vers la droite
      this.dirY = 0;
      if (this.x <= -tileSize) {
        this.x = boardWidth + (tileSize * 0.5); // Réapparaît à droite et continue vers la gauche
      }
    } else if (this.x > boardWidth && this.dirX > 0) {
      // Traverse le tunnel droit vers la gauche
      this.dirY = 0;
      if (this.x >= boardWidth + tileSize) {
        this.x = -(tileSize * 0.5); // Réapparaît à gauche et continue vers la droite
      }
    }

    // 2. CORNERING & DÉTECTION DES MURS
    const isInsideMap = this.x >= 0 && this.x <= boardWidth;

    if (isInsideMap) {
      const currentGridX = Math.max(0, Math.min(this.board.cols - 1, Math.floor(this.x / tileSize)));
      const currentGridY = Math.max(0, Math.min(this.board.rows - 1, Math.floor(this.y / tileSize)));
      const currentCenterX = currentGridX * tileSize + tileSize / 2;
      const currentCenterY = currentGridY * tileSize + tileSize / 2;

      // Virage anticipé au carrefour
      if (this.nextDirX !== 0 || this.nextDirY !== 0) {
        const nextTileX = currentGridX + this.nextDirX;
        const nextTileY = currentGridY + this.nextDirY;

        if (!this.board.isWall(nextTileX, nextTileY) && !this.board.isGhostHouse(nextTileX, nextTileY)) {
          const distToCenter = Math.hypot(this.x - currentCenterX, this.y - currentCenterY);
          if (distToCenter <= this.speed * 2.2) {
            this.x = currentCenterX;
            this.y = currentCenterY;
            this.dirX = this.nextDirX;
            this.dirY = this.nextDirY;
            this.nextDirX = 0;
            this.nextDirY = 0;
            this.updateRotation();
          }
        }
      }

      // Arrêt si mur droit devant
      if (this.dirX !== 0 || this.dirY !== 0) {
        const aheadTileX = currentGridX + this.dirX;
        const aheadTileY = currentGridY + this.dirY;

        // Si la case devant est hors-grille (tunnel), on ne bloque pas
        const isTunnelOpening = (aheadTileX < 0 || aheadTileX >= this.board.cols) && (currentGridX === 0 || currentGridX === this.board.cols - 1);

        if (!isTunnelOpening && (this.board.isWall(aheadTileX, aheadTileY) || this.board.isGhostHouse(aheadTileX, aheadTileY))) {
          if ((this.dirX > 0 && this.x >= currentCenterX) ||
              (this.dirX < 0 && this.x <= currentCenterX) ||
              (this.dirY > 0 && this.y >= currentCenterY) ||
              (this.dirY < 0 && this.y <= currentCenterY)) {
            this.x = currentCenterX;
            this.y = currentCenterY;
            this.dirX = 0;
            this.dirY = 0;
          }
        }
      }
    }

    // 3. APPLICATION DU DÉPLACEMENT
    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;

    // 4. ANIMATION DE LA BOUCHE
    if (this.dirX !== 0 || this.dirY !== 0) {
      this.mouthAngle += this.mouthSpeed;
      if (this.mouthAngle > 0.45 || this.mouthAngle < 0.05) {
        this.mouthSpeed = -this.mouthSpeed;
      }
    }

    // 5. MISE À JOUR POSITION GRILLE
    this.gridX = Math.max(0, Math.min(this.board.cols - 1, Math.floor(this.x / tileSize)));
    this.gridY = Math.max(0, Math.min(this.board.rows - 1, Math.floor(this.y / tileSize)));
  }

  isCentered() {
    const halfTile = this.board.tileSize / 2;
    const currentCenterX = Math.floor(this.x / this.board.tileSize) * this.board.tileSize + halfTile;
    const currentCenterY = Math.floor(this.y / this.board.tileSize) * this.board.tileSize + halfTile;
    return Math.abs(this.x - currentCenterX) < this.speed && Math.abs(this.y - currentCenterY) < this.speed;
  }

  updateRotation() {
    if (this.dirX === 1) this.rotation = 0;
    else if (this.dirX === -1) this.rotation = Math.PI;
    else if (this.dirY === 1) this.rotation = Math.PI / 2;
    else if (this.dirY === -1) this.rotation = -Math.PI / 2;
  }

  checkPelletCollision() {
    const tileX = Math.floor(this.x / this.board.tileSize);
    const tileY = Math.floor(this.y / this.board.tileSize);

    if (tileX >= 0 && tileX < this.board.cols && tileY >= 0 && tileY < this.board.rows) {
      const tileValue = this.board.grid[tileY][tileX];

      if (tileValue === 2) {
        this.board.grid[tileY][tileX] = 0;
        this.board.remainingPellets--;
        return { type: 'pellet', points: 10 };
      } else if (tileValue === 3) {
        this.board.grid[tileY][tileX] = 0;
        this.board.remainingPellets--;
        return { type: 'energizer', points: 50 };
      }
    }
    return null;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const isHD = this.board.renderMode === 'hd';

    if (this.dashTimer > 0) {
      ctx.fillStyle = Math.floor(this.dashTimer / 4) % 2 === 0 ? '#38bdf8' : '#fbbf24';
    } else if (isHD) {
      const grad = ctx.createRadialGradient(-this.radius * 0.2, -this.radius * 0.2, 1, 0, 0, this.radius);
      grad.addColorStop(0, '#ffff55');
      grad.addColorStop(1, '#eab308');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#ffff00';
    }

    ctx.beginPath();
    ctx.arc(
      0,
      0,
      this.radius,
      this.mouthAngle * Math.PI,
      (2 - this.mouthAngle) * Math.PI
    );
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    if (isHD) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, -this.radius * 0.45, this.radius * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
