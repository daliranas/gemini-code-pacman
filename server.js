const http = require('http');
const fs = require('fs');
const path = require('path');
const { getDatabase } = require('./database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const db = getDatabase();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;

  // API REST: GET /api/scores (Récupérer le Top 10 des scores)
  if (req.method === 'GET' && pathname === '/api/scores') {
    const scores = db.getTopScores(10);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, scores }));
    return;
  }

  // API REST: POST /api/scores (Enregistrer un nouveau score)
  if (req.method === 'POST' && pathname === '/api/scores') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) req.socket.destroy(); // Protection DoS
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { playerName, score, difficulty, mapName } = data;
        const result = db.addScore(playerName, score, difficulty, mapName);
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: 'Format JSON invalide' }));
      }
    });
    return;
  }

  // Fichiers statiques du dossier /public
  let reqUrl = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // Sécurité : éviter l'accès en dehors du dossier public
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Interdit');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Page non trouvée</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Erreur serveur: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Serveur Pac-Man démarré sur http://localhost:${PORT}`);
});
