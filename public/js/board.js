/**
 * Module Board: Gestion des grilles dynamiques, des layouts de cartes et des modes de rendu (Normal / HD).
 * 0: Vide / Chemin libre
 * 1: Mur
 * 2: Petite pac-gomme (10 points)
 * 3: Grosse pac-gomme / Super Energizer (50 points)
 * 4: Maison des fantômes / Portes
 */

const MAP_LAYOUTS = {
  classic: {
    name: "Classique",
    description: "Le labyrinthe légendaire d'origine (19x22)",
    pacmanStart: { x: 9, y: 16 },
    ghostHouse: { x: 9, y: 9 },
    ghostSpawns: [
      { name: 'Blinky', color: '#ff0000', x: 9, y: 8 },
      { name: 'Pinky',  color: '#ffb8ff', x: 9, y: 10 },
      { name: 'Inky',   color: '#00ffff', x: 8, y: 10 },
      { name: 'Clyde',  color: '#ffb852', x: 10, y: 10 }
    ],
    grid: [
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
    ]
  },

  open: {
    name: "Carte Ouverte",
    description: "Espaces dégagés et vitesse d'esquive (21x19)",
    pacmanStart: { x: 10, y: 15 },
    ghostHouse: { x: 10, y: 8 },
    ghostSpawns: [
      { name: 'Blinky', color: '#ff0000', x: 10, y: 7 },
      { name: 'Pinky',  color: '#ffb8ff', x: 10, y: 9 },
      { name: 'Inky',   color: '#00ffff', x: 9,  y: 9 },
      { name: 'Clyde',  color: '#ffb852', x: 11, y: 9 }
    ],
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,3,1],
      [1,2,1,1,2,1,1,1,2,2,1,2,2,1,1,1,2,1,1,2,1],
      [1,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,1],
      [1,2,2,2,2,1,1,2,1,1,1,1,1,2,1,1,2,2,2,2,1],
      [1,2,1,1,2,1,1,2,2,2,1,2,2,2,1,1,2,1,1,2,1],
      [1,2,2,2,2,2,2,2,1,0,1,0,1,2,2,2,2,2,2,2,1],
      [0,0,0,1,2,1,1,0,1,4,4,4,1,0,1,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,0,1,4,4,4,1,0,0,1,2,1,1,1,1],
      [0,0,0,0,2,0,0,1,1,4,4,4,1,1,0,0,2,0,0,0,0],
      [1,1,1,1,2,1,0,0,1,1,1,1,1,0,0,1,2,1,1,1,1],
      [0,0,0,1,2,1,1,0,0,0,0,0,0,0,1,1,2,1,0,0,0],
      [1,2,2,2,2,2,2,2,1,1,2,1,1,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,1,2,2,2,2,2,2,2,1,1,2,1,1,2,1],
      [1,2,2,1,2,2,2,2,1,1,0,1,1,2,2,2,2,1,2,2,1],
      [1,1,2,1,2,1,1,2,2,2,0,2,2,2,1,1,2,1,2,1,1],
      [1,3,2,2,2,2,2,2,1,1,2,1,1,2,2,2,2,2,2,3,1],
      [1,2,1,1,1,1,1,2,2,2,2,2,2,2,1,1,1,1,1,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
  },

  giant: {
    name: "Labyrinthe Géant",
    description: "Énorme carte tactique et multi-tunnels (25x23)",
    pacmanStart: { x: 12, y: 17 },
    ghostHouse: { x: 12, y: 10 },
    ghostSpawns: [
      { name: 'Blinky', color: '#ff0000', x: 12, y: 9 },
      { name: 'Pinky',  color: '#ffb8ff', x: 12, y: 11 },
      { name: 'Inky',   color: '#00ffff', x: 10, y: 11 },
      { name: 'Clyde',  color: '#ffb852', x: 14, y: 11 }
    ],
    grid: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
      [1,2,1,1,1,2,1,1,2,1,2,1,1,1,2,1,2,1,1,2,1,1,1,2,1],
      [1,2,1,1,1,2,1,1,2,1,2,1,1,1,2,1,2,1,1,2,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
      [1,2,2,2,2,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,2,2,2,2,1],
      [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,1,4,1,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,0,1,4,1,0,1,1,1,0,1,2,1,1,1,1],
      [0,0,0,0,2,0,0,1,4,4,4,4,4,4,4,4,4,1,0,0,2,0,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
      [0,0,0,1,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,0,0,0],
      [1,1,1,1,2,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,2,1,1,1,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
      [1,3,2,2,1,2,2,2,2,2,2,2,0,2,2,2,2,2,2,2,1,2,2,3,1],
      [1,1,2,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,2,1,1],
      [1,2,2,2,2,2,1,2,2,2,2,1,2,1,2,2,2,2,1,2,2,2,2,2,1],
      [1,2,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,2,1],
      [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
  }
};

class Board {
  constructor(mapType = 'classic', renderMode = 'normal') {
    this.mapType = mapType;
    this.renderMode = renderMode; // 'normal' ou 'hd'
    this.setLayout(mapType);
    this.energizerPulse = 0;
  }

  setLayout(mapType) {
    this.mapType = mapType || 'classic';
    this.mapData = MAP_LAYOUTS[this.mapType] || MAP_LAYOUTS.classic;
    this.initialMap = this.mapData.grid;
    this.cols = this.initialMap[0].length;
    this.rows = this.initialMap.length;

    // Calcul dynamique de tileSize agrandi pour un rendu large et immersif sur écran
    if (this.cols > 22 || this.rows > 22) {
      this.tileSize = 26; // Était 18 -> passe à 26px
    } else {
      this.tileSize = 30; // Était 22 -> passe à 30px
    }

    this.reset();
  }

  setRenderMode(mode) {
    this.renderMode = mode;
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
    // Si hors limites verticales (haut/bas) -> Mur infranchissable
    if (row < 0 || row >= this.rows) return true;

    // Si hors limites horizontales (gauche/droite)
    if (col < 0 || col >= this.cols) {
      // Autorisé UNIQUEMENT si la case de bord correspond à une entrée de tunnel (valeur 0)
      const edgeCol = col < 0 ? 0 : this.cols - 1;
      return this.grid[row][edgeCol] === 1; // Est un mur si la bordure est un mur
    }

    return this.grid[row][col] === 1;
  }

  isTunnel(col, row) {
    if (row < 0 || row >= this.rows) return false;
    if (col < 0 || col >= this.cols) return true;
    return (col === 0 || col === this.cols - 1) && this.grid[row][col] === 0;
  }

  isGhostHouse(col, row) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
    return this.grid[row][col] === 4;
  }

  draw(ctx) {
    this.energizerPulse += 0.05;
    const isHD = this.renderMode === 'hd';

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        const cell = this.grid[r][c];

        if (cell === 1) {
          if (isHD) {
            // Mode HD : Style moderne, contours adoucis, contraste élégant sans lag
            ctx.fillStyle = '#0c1633';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);

            // Bords internes bleus clairs nets
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);

            // Accentuation lumineuse discrète
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + 3, y + 3, this.tileSize - 6, 2);
          } else {
            // Rendu Normal: Pixel Rétro Classique
            ctx.fillStyle = '#0f0f80';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);

            ctx.strokeStyle = '#1919a6';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
          }

        } else if (cell === 2) {
          // Petite Pac-Gomme
          if (isHD) {
            ctx.fillStyle = '#fde047'; // Jaune doux bien lisible
            ctx.beginPath();
            ctx.arc(
              x + this.tileSize / 2,
              y + this.tileSize / 2,
              this.tileSize * 0.14,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else {
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
          }

        } else if (cell === 3) {
          // Super Energizer (Pulsant doux)
          const radiusScale = 0.32 + Math.sin(this.energizerPulse) * 0.05;
          if (isHD) {
            // Halo externe doux
            ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
            ctx.beginPath();
            ctx.arc(
              x + this.tileSize / 2,
              y + this.tileSize / 2,
              this.tileSize * (radiusScale + 0.12),
              0,
              Math.PI * 2
            );
            ctx.fill();

            // Coeur brillant
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
              x + this.tileSize / 2,
              y + this.tileSize / 2,
              this.tileSize * radiusScale,
              0,
              Math.PI * 2
            );
            ctx.fill();
          } else {
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
          }

        } else if (cell === 4) {
          // Porte de la maison des fantômes
          ctx.fillStyle = isHD ? '#ec4899' : '#ffb8ff';
          ctx.fillRect(x, y + this.tileSize * 0.4, this.tileSize, this.tileSize * 0.2);
        }
      }
    }
  }
}
