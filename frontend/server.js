// Custom Next.js server wrapper for nginx proxy compatibility
// Sets keep-alive timeout and loads the original standalone server

// Set keep-alive timeout environment variable
process.env.KEEP_ALIVE_TIMEOUT = '65000';

// Patch HTTP module to intercept ALL server creation
const http = require('http');
const originalCreateServer = http.createServer;

http.createServer = function(...args) {
  const server = originalCreateServer.apply(this, args);
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  console.log(`> HTTP server keep-alive configured: ${server.keepAliveTimeout}ms`);
  return server;
};

http.globalAgent.keepAlive = true;
http.globalAgent.keepAliveMsecs = 65000;

// Load the original server (which we've modified to default to 65000)
require('./server.js.original');
