export const handler = async (event) => {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Parâmetro 'id' é obrigatório" }),
    };
  }

  try {
    let products = null;

    // Fallback bundle estático
    try {
      const mod = await import("../../data/products.json");
      if (mod?.default && Array.isArray(mod.default)) {
        products = mod.default;
      }
    } catch {}

    // FS runtime
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
    } catch {}

    if (!products) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Produtos indisponíveis" }),
      };
    }

    const product = products.find((p) => p.id === id || p.slug === id);

    if (!product) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Produto não encontrado" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Erro ao buscar produto", details: err?.message }),
    };
  }
};


