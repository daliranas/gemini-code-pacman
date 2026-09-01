/**
 * Module Particles: Moteur de particules arcade légères et score popups flottants.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.popups = [];
  }

  reset() {
    this.particles = [];
    this.popups = [];
  }

  spawnEatParticles(x, y, color = '#fde047', count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 1.5 + Math.random() * 1.5,
        alpha: 1.0,
        decay: 0.04 + Math.random() * 0.03
      });
    }
  }

  spawnScorePopup(x, y, text, color = '#38bdf8') {
    this.popups.push({
      x,
      y,
      text,
      color,
      alpha: 1.0,
      vy: -0.8,
      decay: 0.02
    });
  }

  update() {
    // Mettre à jour les particules
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Mettre à jour les popups de score flottant
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y += pop.vy;
      pop.alpha -= pop.decay;
      if (pop.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // Dessiner les particules
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Dessiner les scores flottants
    for (const pop of this.popups) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pop.alpha);
      ctx.fillStyle = pop.color;
      ctx.font = "bold 10px 'Press Start 2P', monospace";
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }
  }
}
