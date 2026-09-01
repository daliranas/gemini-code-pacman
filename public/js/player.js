/**
 * Module Player: Contróle et logique du joueur Pac-Man
 */

class Pacman {
  constructor(board) {
    this.board = board;
    this.reset();
  }

  reset() {
    // Position initiale standard (centrée sous la maison des fantômes)
    this.gridX = 9;
    this.gridY = 16;
    this.x = (this.gridX + 0.5) * this.board.tileSize;
    this.y = (this.gridY + 0.5) * this.board.tileSize;

    this.speed = 2.5; // Pixels par frame
    this.dirX = 0;
    this.dirY = 0;
    this.nextDirX = 0;
    this.nextDirY = 0;

    this.mouthAngle = 0.2;
    this.mouthSpeed = 0.02;
    this.radius = this.board.tileSize * 0.45;
    this.rotation = 0;
  }

  setNextDirection(dirX, dirY) {
    this.nextDirX = dirX;
    this.nextDirY = dirY;
  }

  update() {
    // Essayer de changer de direction si aligné sur le centre d'une case
    if (this.isCentered()) {
      const currentGridX = Math.floor(this.x / this.board.tileSize);
      const currentGridY = Math.floor(this.y / this.board.tileSize);

      // Vérifier si la prochaine direction souhaitée n'est pas un mur
      if (this.nextDirX !== 0 || this.nextDirY !== 0) {
        const nextTileX = currentGridX + this.nextDirX;
        const nextTileY = currentGridY + this.nextDirY;

        if (!this.board.isWall(nextTileX, nextTileY) && !this.board.isGhostHouse(nextTileX, nextTileY)) {
          this.dirX = this.nextDirX;
          this.dirY = this.nextDirY;
          this.updateRotation();
        }
      }

      // Vérifier si la direction courante heurte un mur
      const aheadTileX = currentGridX + this.dirX;
      const aheadTileY = currentGridY + this.dirY;

      if (this.board.isWall(aheadTileX, aheadTileY) || this.board.isGhostHouse(aheadTileX, aheadTileY)) {
        this.dirX = 0;
        this.dirY = 0;
      }
    }

    // Déplacement
    this.x += this.dirX * this.speed;
    this.y += this.dirY * this.speed;

    // Gestion du Wrap-around (tunnel gauche/droite)
    const boardWidth = this.board.cols * this.board.tileSize;
    if (this.x < -this.radius) {
      this.x = boardWidth + this.radius;
    } else if (this.x > boardWidth + this.radius) {
      this.x = -this.radius;
    }

    // Animation de la bouche
    if (this.dirX !== 0 || this.dirY !== 0) {
      this.mouthAngle += this.mouthSpeed;
      if (this.mouthAngle > 0.45 || this.mouthAngle < 0.05) {
        this.mouthSpeed = -this.mouthSpeed;
      }
    }

    // Mettre à jour la position grille
    this.gridX = Math.floor(this.x / this.board.tileSize);
    this.gridY = Math.floor(this.y / this.board.tileSize);
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
        // Petite pac-gomme
        this.board.grid[tileY][tileX] = 0;
        this.board.remainingPellets--;
        return { type: 'pellet', points: 10 };
      } else if (tileValue === 3) {
        // Super Energizer
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

    ctx.fillStyle = '#ffff00';
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

    ctx.restore();
  }
}
