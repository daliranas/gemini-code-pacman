/**
 * Module Fruits: Système de fruits bonus apparaissant périodiquement (Cerise, Fraise, Étoile Turbo).
 */

const FRUIT_TYPES = [
  { name: 'Cerise', points: 100, color: '#ef4444', stemColor: '#22c55e', symbol: '🍒', isDash: false },
  { name: 'Fraise', points: 300, color: '#f43f5e', stemColor: '#22c55e', symbol: '🍓', isDash: false },
  { name: 'Orange', points: 500, color: '#f97316', stemColor: '#22c55e', symbol: '🍊', isDash: false },
  { name: 'Éclair Turbo', points: 250, color: '#eab308', stemColor: '#38bdf8', symbol: '⚡', isDash: true }
];

class FruitManager {
  constructor(board) {
    this.board = board;
    this.fruit = null;
    this.spawnTimer = 0;
    this.activeTimer = 0;
  }

  reset() {
    this.fruit = null;
    this.spawnTimer = 0;
    this.activeTimer = 0;
  }

  update(score) {
    // Apparaît tous les ~600 frames (10 secondes) si aucun fruit présent
    if (!this.fruit) {
      this.spawnTimer++;
      if (this.spawnTimer > 500) {
        this.spawnFruit(score);
      }
    } else {
      this.activeTimer--;
      if (this.activeTimer <= 0) {
        this.fruit = null;
        this.spawnTimer = 0;
      }
    }
  }

  spawnFruit(score) {
    // Position sous la maison des fantômes
    const house = this.board.mapData ? this.board.mapData.ghostHouse : { x: 9, y: 9 };
    const fruitX = house.x;
    const fruitY = house.y + 3;

    // Choix du fruit selon score ou aléatoire
    const index = Math.floor(Math.random() * FRUIT_TYPES.length);
    const fruitData = FRUIT_TYPES[index];

    this.fruit = {
      gridX: fruitX,
      gridY: fruitY,
      x: (fruitX + 0.5) * this.board.tileSize,
      y: (fruitY + 0.5) * this.board.tileSize,
      ...fruitData
    };
    this.activeTimer = 450; // Reste 7.5 secondes
  }

  checkCollision(pacman) {
    if (!this.fruit) return null;

    const dist = Math.hypot(pacman.x - this.fruit.x, pacman.y - this.fruit.y);
    if (dist < pacman.radius + this.board.tileSize * 0.4) {
      const collected = { ...this.fruit };
      this.fruit = null;
      this.spawnTimer = 0;
      return collected;
    }
    return null;
  }

  draw(ctx) {
    if (!this.fruit) return;

    const { x, y, symbol, isDash } = this.fruit;
    const ts = this.board.tileSize;

    // Clignotement en fin de vie
    if (this.activeTimer < 80 && Math.floor(this.activeTimer / 8) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.font = `${Math.floor(ts * 0.9)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Petit rebond animé
    const bounce = Math.sin(Date.now() / 150) * 3;
    ctx.fillText(symbol, x, y + bounce);
    ctx.restore();
  }
}
