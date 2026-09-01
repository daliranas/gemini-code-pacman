/**
 * Module Board: Gestion de la grille du labyrinthe, des murs et des pac-gommes.
 * 0: Vide / Chemin libre
 * 1: Mur
 * 2: Petite pac-gomme (10 points)
 * 3: Grosse pac-gomme / Super Energizer (50 points)
 * 4: Maison des fantômes / Portes
 */

class Board {
  constructor(tileSize = 20) {
    this.tileSize = tileSize;

    // Grille 19x22 classique adaptée pour un bon rendu arcade
    this.initialMap = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,4,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
      [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
      [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
      [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    this.grid = [];
    this.cols = this.initialMap[0].length;
    this.rows = this.initialMap.length;
    this.totalPellets = 0;
    this.remainingPellets = 0;
    this.energizerPulse = 0;

    this.reset();
  }

  reset() {
    this.grid = this.initialMap.map(row => [...row]);
    this.totalPellets = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === 2 || this.grid[r][c] === 3) {
          this.totalPellets++;
        }
      }
    }
    this.remainingPellets = this.totalPellets;
  }

  isWall(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return false; // tunnel wrap
    }
    return this.grid[row][col] === 1;
  }

  isGhostHouse(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    return this.grid[row][col] === 4;
  }

  draw(ctx) {
    this.energizerPulse += 0.05;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        const cell = this.grid[r][c];

        if (cell === 1) {
          // Murs style Neon Arcade
          ctx.fillStyle = '#0f0f80';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);

          ctx.strokeStyle = '#1919a6';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);

        } else if (cell === 2) {
          // Petite Pac-Gomme
          ctx.fillStyle = '#ffb8ae';
          ctx.beginPath();
          ctx.arc(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            this.tileSize * 0.15,
            0,
            Math.PI * 2
          );
          ctx.fill();

        } else if (cell === 3) {
          // Super Energizer (clignotant)
          const radiusScale = 0.35 + Math.sin(this.energizerPulse) * 0.08;
          ctx.fillStyle = '#ffb8ae';
          ctx.beginPath();
          ctx.arc(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            this.tileSize * radiusScale,
            0,
            Math.PI * 2
          );
          ctx.fill();

        } else if (cell === 4) {
          // Porte de la maison des fantômes
          ctx.fillStyle = '#ffb8ff';
          ctx.fillRect(
            x,
            y + this.tileSize * 0.4,
            this.tileSize,
            this.tileSize * 0.2
          );
        }
      }
    }
  }
}
