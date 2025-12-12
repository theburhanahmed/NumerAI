#!/bin/sh
set -e

# Determine which server.js to use
SERVER_JS="server.js"
if [ -f "server.js.original" ]; then
  SERVER_JS="server.js.original"
fi

# Start Next.js server in background on port 3001
echo "Starting Next.js server on port 3001 using $SERVER_JS..."
PORT=3001 HOSTNAME=0.0.0.0 node $SERVER_JS > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!

# Wait for Next.js to start (fixed wait time - Next.js usually starts in 1-2 seconds)
echo "Waiting for Next.js server to initialize..."
sleep 5

# Verify Next.js is running
if ! kill -0 $NEXTJS_PID 2>/dev/null; then
  echo "ERROR: Next.js server process died"
  cat /tmp/nextjs.log 2>/dev/null || echo "No logs available"
  exit 1
fi

echo "Next.js server started (PID: $NEXTJS_PID)"
echo "Starting proxy server on port 3000..."

# Start proxy server (this will be the main process)
exec node proxy-server.js
