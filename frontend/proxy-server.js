// Simple HTTP proxy server to sit between nginx and Next.js
// This fixes the connection closing issue

const http = require('http');
const httpProxy = require('http-proxy');

const PROXY_PORT = 13000;
const NEXTJS_PORT = 3000;

// Create proxy
const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${NEXTJS_PORT}`,
  ws: true,
  xfwd: true,
});

// Create HTTP server with proper keep-alive
const server = http.createServer((req, res) => {
  // Set keep-alive headers
  res.setHeader('Connection', 'keep-alive');
  
  // Proxy the request
  proxy.web(req, res, {
    target: `http://localhost:${NEXTJS_PORT}`,
  });
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: `http://localhost:${NEXTJS_PORT}`,
  });
});

// Configure keep-alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && !res.headersSent) {
    res.statusCode = 502;
    res.end('Bad Gateway');
  }
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`> Proxy server listening on 127.0.0.1:${PROXY_PORT}`);
  console.log(`> Proxying to Next.js on localhost:${NEXTJS_PORT}`);
  console.log(`> Keep-alive timeout: ${server.keepAliveTimeout}ms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
