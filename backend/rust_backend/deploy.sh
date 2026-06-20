#!/bin/bash

# ResumeVault Backend Deployment Script
# This script builds and deploys the backend to the server

set -e  # Exit on error

echo "=== ResumeVault Backend Deployment ==="
echo ""

# Step 1: Build the release version
echo "📦 Building release version..."
cargo build --release

# Step 2: Check if the build was successful
if [ ! -f "target/release/rust_backend" ]; then
    echo "❌ Build failed: executable not found"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Step 3: Kill existing process (if running)
echo "🔄 Stopping existing process..."
pkill -f rust_backend || echo "No existing process found"
sleep 2

# Step 4: Start the new process
echo "🚀 Starting new backend process..."
export RUST_LOG=info
nohup ./target/release/rust_backend > server.log 2>&1 &
SERVER_PID=$!

echo "✅ Backend started with PID: $SERVER_PID"
echo ""

# Step 5: Wait a moment and verify
sleep 3
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server is running!"
    echo ""
    echo "📝 Server details:"
    echo "   PID: $SERVER_PID"
    echo "   Log: server.log"
    echo "   Port: 4021"
    echo ""
    echo "To view logs in real-time:"
    echo "   tail -f server.log"
    echo ""
    echo "To stop the server:"
    echo "   kill $SERVER_PID"
else
    echo "❌ Server failed to start. Check server.log for details."
    exit 1
fi
