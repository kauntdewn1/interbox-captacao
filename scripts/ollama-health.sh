#!/usr/bin/env bash
PORT=11434
echo "Checking listener on port $PORT..."
lsof -iTCP:"$PORT" -sTCP:LISTEN -Pn >/dev/null 2>&1 && echo "Port $PORT LISTENING" || echo "Port $PORT NOT listening"
echo "Tiny POST (timeout 5s) to /api/generate..."
curl -sS --max-time 5 -X POST "http://localhost:$PORT/api/generate" -H "Content-Type: application/json" -d '{"model":"codestral:latest","prompt":"ping","stream":false}' -o /tmp/ollama_health.json || echo "Request failed or timed out"
echo "Saved response to /tmp/ollama_health.json"
