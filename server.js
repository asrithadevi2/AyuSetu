const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const BASE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  // Parse URL pathname
  let reqPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);

  // Map root to index.html
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  // Resolve file path safely within BASE_DIR
  const filePath = path.normalize(path.join(BASE_DIR, reqPath));

  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If requested without .html extension, try appending .html
      const htmlPath = filePath + '.html';
      if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
        serveFile(htmlPath, res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>404 Not Found</title><link rel="stylesheet" href="style.css"></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;font-family:sans-serif;"><div><h1>404 Not Found</h1><p style="margin:16px 0;">Could not find <code>${escapeHtml(reqPath)}</code></p><a href="/" class="btn btn-primary" style="display:inline-block;padding:10px 20px;background:#087F73;color:#fff;border-radius:99px;text-decoration:none;">Back to Ayusetu Home</a></div></body></html>`);
      return;
    }
    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[c]);
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = PORT + 1;
    console.warn(`Port ${PORT} is in use, retrying on port ${nextPort}...`);
    server.listen(nextPort);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log('====================================================');
  console.log(`  Ayusetu Server is running!`);
  console.log(`  URL: http://localhost:${actualPort}/`);
  console.log(`  Serving folder: ${BASE_DIR}`);
  console.log('====================================================');
});
