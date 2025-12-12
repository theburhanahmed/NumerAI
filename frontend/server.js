// Custom Next.js server wrapper that patches HTTP server for nginx compatibility
// This fixes the "upstream prematurely closed connection" issue

// Set keep-alive timeout environment variable
process.env.KEEP_ALIVE_TIMEOUT = '65000';

// Patch HTTP module before loading Next.js
const http = require('http');
const originalCreateServer = http.createServer;

// Wrap createServer to patch keep-alive settings
http.createServer = function(...args) {
  const server = originalCreateServer.apply(this, args);
  
  // Patch keep-alive settings for nginx compatibility
  server.keepAliveTimeout = 65000; // 65 seconds (nginx default is 60s)
  server.headersTimeout = 66000; // Must be > keepAliveTimeout
  
  console.log(`> HTTP server keep-alive configured: ${server.keepAliveTimeout}ms`);
  
  return server;
};

// Also patch global agent
http.globalAgent.keepAlive = true;
http.globalAgent.keepAliveMsecs = 65000;

// Patch all existing servers after a delay (in case Next.js creates server before our patch)
setTimeout(() => {
  const net = require('net');
  const servers = net._getActiveHandles ? net._getActiveHandles() : [];
  servers.forEach(handle => {
    if (handle && typeof handle.keepAliveTimeout !== 'undefined') {
      handle.keepAliveTimeout = 65000;
      handle.headersTimeout = 66000;
      console.log(`> Patched existing server keep-alive: ${handle.keepAliveTimeout}ms`);
    }
  });
}, 2000);

// Now load the original standalone server
require('./server.js.original');
