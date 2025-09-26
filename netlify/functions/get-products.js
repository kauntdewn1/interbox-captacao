export const handler = async () => {
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
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Produtos indisponíveis" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Erro ao listar produtos", details: err?.message }),
    };
  }
};
