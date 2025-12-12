// Simple HTTP proxy for Next.js to fix nginx connection closing issues
// Manually handles requests to ensure keep-alive connections

const http = require('http');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const NEXTJS_PORT = 3001;
const NEXTJS_HOST = '127.0.0.1';

// Create HTTP server with proper keep-alive settings
const server = http.createServer((req, res) => {
  // Create request to Next.js
  const options = {
    hostname: NEXTJS_HOST,
    port: NEXTJS_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'connection': 'keep-alive',
      'host': `${NEXTJS_HOST}:${NEXTJS_PORT}`
    }
  };

  // Forward request to Next.js
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy headers and force keep-alive
    const headers = {};
    Object.keys(proxyRes.headers).forEach(key => {
      headers[key] = proxyRes.headers[key];
    });
    headers['connection'] = 'keep-alive';
    
    // Set response headers with keep-alive BEFORE piping
    res.writeHead(proxyRes.statusCode, headers);
    
    // Handle data chunks
    proxyRes.on('data', (chunk) => {
      if (!res.headersSent) {
        res.writeHead(proxyRes.statusCode, headers);
      }
      res.write(chunk);
    });
    
    proxyRes.on('end', () => {
      res.end();
    });
    
    proxyRes.on('error', (err) => {
      console.error('Proxy response error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, {
          'Content-Type': 'text/plain',
          'Connection': 'keep-alive'
        });
      }
      res.end('Bad Gateway');
    });
  });

  // Handle proxy request errors
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'text/plain',
        'Connection': 'keep-alive'
      });
      res.end('Bad Gateway');
    }
  });

  // Pipe request body
  req.pipe(proxyReq);
});

// Configure keep-alive for nginx compatibility
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Start server
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
