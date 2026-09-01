const path = require('path');
const fs = require('fs');

/**
 * Module Database SQLite pour Pac-Man.
 * Utilise `node:sqlite` (natif Node 22+) s'il est disponible,
 * ou fallback sur un stockage JSON persistant structuré SQL-like.
 */

let dbInstance = null;
const DB_FILE = path.join(__dirname, 'pacman_scores.db');
const JSON_FALLBACK = path.join(__dirname, 'scores.json');

class PacmanDB {
  constructor() {
    this.useNativeSqlite = false;
    this.init();
  }

  init() {
    try {
      // Tente d'utiliser le module natif SQLite de Node.js (v22.5.0+)
      const { DatabaseSync } = require('node:sqlite');
      this.db = new DatabaseSync(DB_FILE);
      this.useNativeSqlite = true;

      // Création de la table des scores
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS highscores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_name TEXT NOT NULL,
          score INTEGER NOT NULL,
          difficulty TEXT DEFAULT 'normal',
          map_name TEXT DEFAULT 'classic',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Base de données SQLite native connectée (pacman_scores.db)');
    } catch (e) {
      // Fallback persistant JSON transparent
      this.useNativeSqlite = false;
      if (!fs.existsSync(JSON_FALLBACK)) {
        fs.writeFileSync(JSON_FALLBACK, JSON.stringify([
          { id: 1, player_name: "PAC", score: 5000, difficulty: "normal", map_name: "classic", created_at: new Date().toISOString() },
          { id: 2, player_name: "GHO", score: 3200, difficulty: "normal", map_name: "classic", created_at: new Date().toISOString() },
          { id: 3, player_name: "ARC", score: 2100, difficulty: "hard", map_name: "giant", created_at: new Date().toISOString() },
          { id: 4, player_name: "RET", score: 1500, difficulty: "easy", map_name: "open", created_at: new Date().toISOString() },
          { id: 5, player_name: "NES", score: 800, difficulty: "normal", map_name: "classic", created_at: new Date().toISOString() }
        ], null, 2));
      }
      console.log('ℹ️ Stockage persistant des scores actif (scores.json)');
    }
  }

  getTopScores(limit = 10) {
    if (this.useNativeSqlite) {
      try {
        const stmt = this.db.prepare(`
          SELECT id, player_name, score, difficulty, map_name, created_at
          FROM highscores
          ORDER BY score DESC
          LIMIT ?
        `);
        return stmt.all(limit);
      } catch (err) {
        console.error('Erreur getTopScores SQLite:', err);
        return [];
      }
    } else {
      try {
        const raw = fs.readFileSync(JSON_FALLBACK, 'utf-8');
        const list = JSON.parse(raw);
        return list.sort((a, b) => b.score - a.score).slice(0, limit);
      } catch (err) {
        return [];
      }
    }
  }

  addScore(playerName, score, difficulty = 'normal', mapName = 'classic') {
    const cleanName = (playerName || 'PAC').toUpperCase().trim().slice(0, 10);
    const scoreVal = parseInt(score, 10) || 0;

    if (this.useNativeSqlite) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO highscores (player_name, score, difficulty, map_name)
          VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(cleanName, scoreVal, difficulty, mapName);
        return { success: true, id: result.lastInsertRowid };
      } catch (err) {
        console.error('Erreur addScore SQLite:', err);
        return { success: false, error: err.message };
      }
    } else {
      try {
        const raw = fs.readFileSync(JSON_FALLBACK, 'utf-8');
        const list = JSON.parse(raw);
        const newEntry = {
          id: Date.now(),
          player_name: cleanName,
          score: scoreVal,
          difficulty,
          map_name: mapName,
          created_at: new Date().toISOString()
        };
        list.push(newEntry);
        fs.writeFileSync(JSON_FALLBACK, JSON.stringify(list, null, 2));
        return { success: true, id: newEntry.id };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }
  }
}

function getDatabase() {
  if (!dbInstance) {
    dbInstance = new PacmanDB();
  }
  return dbInstance;
}

module.exports = { getDatabase };
