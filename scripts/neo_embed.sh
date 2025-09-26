#!/usr/bin/env bash

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "[ERRO] Forneça um arquivo de texto existente para gerar embeddings."
  exit 1
fi

API_KEY="ByO3JOUkSrNAAMUMlzLQPdBdolwhjEsK"
URL="https://api.mistral.ai/v1/embeddings"
MODEL="mistral-embed"

TEXT=$(cat "$FILE" | tr '\n' ' ' | head -c 5000)  # corta para evitar prompt muito grande

JSON=$(jq -n \
  --arg model "$MODEL" \
  --arg input "$TEXT" \
  '{model: $model, input: $input}')

curl -sS -X POST "$URL" \
  -H "Authorization: Bearer '"$API_KEY"'" \
  -H "Content-Type: application/json" \
  -d "$JSON" | jq
