// Custom Next.js server wrapper for nginx proxy compatibility
// Sets keep-alive timeout and loads the original standalone server

// Set keep-alive timeout before loading Next.js
process.env.KEEP_ALIVE_TIMEOUT = '65000';

// The standalone build has server.js at the root
// We need to load it, but first backup and replace
// Actually, we'll just set env and require the original
const fs = require('fs');
const path = require('path');

// Check if original exists
const originalServer = path.join(__dirname, 'server.js.original');
if (fs.existsSync(originalServer)) {
  // Load the original server
  require(originalServer);
} else {
  // If no backup, the standalone server.js should be here
  // But we're replacing it, so we need a different approach
  // Let's just set the env and let Next.js handle it
  const { createServer } = require('http');
  const next = require('next');
  
  const dev = false;
  const hostname = process.env.HOSTNAME || '0.0.0.0';
  const port = parseInt(process.env.PORT, 10) || 3000;
  
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  
  app.prepare().then(() => {
    const server = createServer(async (req, res) => {
      try {
        const { parse } = require('url');
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error:', err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });
    
    // Set keep-alive for nginx
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    
    server.listen(port, hostname, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port} (keep-alive: ${server.keepAliveTimeout}ms)`);
    });
  });
}
