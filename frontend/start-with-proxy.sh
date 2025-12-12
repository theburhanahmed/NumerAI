#!/bin/sh
set -e

# Start Next.js server in background on port 3001
echo "Starting Next.js server on port 3001..."
PORT=3001 HOSTNAME=0.0.0.0 node server.js.original > /tmp/nextjs.log 2>&1 &
NEXTJS_PID=$!

# Wait for Next.js to be ready
echo "Waiting for Next.js server to start..."
for i in $(seq 1 60); do
  if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "Next.js server is ready on port 3001"
    break
  fi
  if [ $i -eq 60 ]; then
    echo "ERROR: Next.js server failed to start"
    cat /tmp/nextjs.log
    exit 1
  fi
  sleep 1
done

# Start proxy server (this will be the main process)
echo "Starting proxy server on port 3000..."
exec node proxy-server.js
