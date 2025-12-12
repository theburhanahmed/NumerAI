// Custom Next.js server wrapper that properly patches HTTP server for nginx
// This fixes the "upstream prematurely closed connection" issue

// Set keep-alive timeout environment variable
process.env.KEEP_ALIVE_TIMEOUT = '65000';

// Patch HTTP module BEFORE loading Next.js
const http = require('http');
const originalCreateServer = http.createServer;

// Wrap createServer to patch ALL servers created
http.createServer = function(...args) {
  const server = originalCreateServer.apply(this, args);
  
  // Patch keep-alive settings immediately
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  
  console.log(`> HTTP server keep-alive configured: ${server.keepAliveTimeout}ms`);
  
  return server;
};

// Patch global agent
http.globalAgent.keepAlive = true;
http.globalAgent.keepAliveMsecs = 65000;

// Load the original server
const originalServer = require('./server.js.original');

// Patch server after Next.js startServer completes
// startServer returns a promise, but we can't easily intercept it
// So we'll patch any servers that get created
setInterval(() => {
  try {
    // Try to find the server instance via process._getActiveHandles
    const handles = process._getActiveHandles ? process._getActiveHandles() : [];
    handles.forEach(handle => {
      if (handle && handle.constructor && handle.constructor.name === 'Server') {
        if (typeof handle.keepAliveTimeout !== 'undefined' && handle.keepAliveTimeout !== 65000) {
          handle.keepAliveTimeout = 65000;
          handle.headersTimeout = 66000;
          console.log(`> Patched server instance keep-alive: ${handle.keepAliveTimeout}ms`);
        }
      }
    });
  } catch (e) {
    // Ignore
  }
}, 1000);
