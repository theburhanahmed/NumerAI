#!/bin/sh
# Start Next.js server and proxy server

# Start Next.js in background
node server.js.original &
NEXTJS_PID=$!

# Wait for Next.js to be ready
sleep 5

# Start proxy server
node proxy-server.js &
PROXY_PID=$!

# Wait for both processes
wait $NEXTJS_PID $PROXY_PID
