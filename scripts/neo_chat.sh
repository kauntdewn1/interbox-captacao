#!/usr/bin/env bash

TEXT="${1:-}"
if [ -z "$TEXT" ]; then
  echo "[ERRO] Forneça um texto para conversar (ex: './scripts/neo_chat.sh \"Explique o que é Web3 em 3 linhas\"')"
  exit 1
fi

API_KEY="ByO3JOUkSrNAAMUMlzLQPdBdolwhjEsK"
URL="https://codestral.mistral.ai/v1/chat/completions"
MODEL="mistral-large"

JSON=$(jq -n \
  --arg model "$MODEL" \
  --arg content "$TEXT" \
  '{model: $model, messages: [{role: "user", content: $content}], temperature: 0.7}')

curl -sS -X POST "$URL" \
  -H "Authorization: Bearer '"$API_KEY"'" \
  -H "Content-Type: application/json" \
  -d "$JSON" | jq -r '.choices[0].message.content'
