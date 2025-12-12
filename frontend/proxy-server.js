// HTTP Proxy server for Next.js to fix nginx connection closing issues
// This proxy properly handles keep-alive connections

const http = require('http');
const httpProxy = require('http-proxy');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const NEXTJS_PORT = 3001; // Internal Next.js server port
const NEXTJS_HOST = '127.0.0.1';

// Create proxy
const proxy = httpProxy.createProxyServer({
  target: `http://${NEXTJS_HOST}:${NEXTJS_PORT}`,
  ws: true, // Enable WebSocket support
  xfwd: true, // Add X-Forwarded-* headers
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  if (res && !res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'text/plain'
    });
    res.end('Bad Gateway');
  }
});

// Create HTTP server with proper keep-alive settings
const server = http.createServer((req, res) => {
  // Proxy the request
  proxy.web(req, res, {
    target: `http://${NEXTJS_HOST}:${NEXTJS_PORT}`,
  });
});

// Configure keep-alive for nginx compatibility
server.keepAliveTimeout = 65000; // 65 seconds (nginx default is 60s)
server.headersTimeout = 66000; // Must be > keepAliveTimeout

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: `http://${NEXTJS_HOST}:${NEXTJS_PORT}`,
  });
});

// Start proxy server
server.listen(PORT, HOSTNAME, () => {
  console.log(`> Proxy server ready on http://${HOSTNAME}:${PORT}`);
  console.log(`> Proxying to Next.js on http://${NEXTJS_HOST}:${NEXTJS_PORT}`);
  console.log(`> Keep-alive timeout: ${server.keepAliveTimeout}ms`);
});

// Graceful shutdown
const shutdown = (signal) => {
  return () => {
    console.log(`${signal} received: closing proxy server`);
    server.close(() => {
      console.log('Proxy server closed');
      process.exit(0);
    });
  };
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
