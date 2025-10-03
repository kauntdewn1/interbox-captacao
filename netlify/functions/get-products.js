import './_shared/fix-util-extend.js';
import { withCors, jsonResponse } from './_shared/cors.ts';

export const handler = withCors(async () => {
  try {
    let products = null;

    // Fallback ao bundle estático (import dinâmico dentro do handler)
    try {
      const mod = await import("../../data/products.json");
      if (mod?.default && Array.isArray(mod.default)) {
        products = mod.default;
      }
    } catch {}

    // Tentar ler do filesystem em runtime para evitar issues de bundling
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(process.cwd(), 'data', 'products.json');
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const json = JSON.parse(raw);
        if (Array.isArray(json)) {
          products = json;
        }
      }
    } catch (e) {
      // Mantém products do fallback
    }

    if (!products) {
      return jsonResponse(500, { error: "Produtos indisponíveis" });
    }

    return jsonResponse(200, products);
  } catch (err) {
    return jsonResponse(500, {
      error: "Erro ao listar produtos",
      details: err?.message
    });
  }
});
