#!/usr/bin/env bash

FILE="${1:-}"
if [ -z "$FILE" ] || [ ! -f "$FILE" ]; then
  echo "[ERRO] Arquivo não encontrado: $FILE"
  exit 1
fi

API_KEY="ByO3JOUkSrNAAMUMlzLQPdBdolwhjEsK"
MODEL="codestral"
URL="https://codestral.mistral.ai/v1/fim/completions"
OUT_DIR=".neo.suggestions"
mkdir -p "$OUT_DIR"
OUT_FILE="$OUT_DIR/$(basename "$FILE").md"

PREFIX="### Revisão pragmática NEØ para este código:\n"
SUFFIX="\n### Melhorias, bugs e refatorações sugeridas:\n<FILL_HERE>"
CONTENT=$(cat "$FILE")

# JSON payload
JSON=$(jq -n \
  --arg model "$MODEL" \
  --arg prefix "$PREFIX$CONTENT" \
  --arg suffix "$SUFFIX" \
  '{model: $model, prefix: $prefix, suffix: $suffix, temperature: 0.0, max_tokens: 512}')

echo "[NEØ] Enviando request para Codestral (Mistral Cloud)..."
RESPONSE=$(curl -sS -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer '"$API_KEY"'" \
  -d "$JSON")

# Salva resposta bruta
echo "$RESPONSE" > "$OUT_FILE.raw"

# Extrai texto legível
echo "$RESPONSE" | jq -r '.choices[0].text // .output // .response' > "$OUT_FILE" 2>/dev/null || cp "$OUT_FILE.raw" "$OUT_FILE"

# Confere se veio vazio
if grep -q "null" "$OUT_FILE"; then
  echo "[NEØ] A resposta foi nula. Provavelmente o conteúdo estava vazio ou houve erro silencioso."
else
  echo "[NEØ] Resposta salva em $OUT_FILE"
  echo "----------- Preview -----------"
  head -n 60 "$OUT_FILE"
  echo "-------------------------------"
fi
