import productsData from "../../data/products.json";

export const handler = async (event) => {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parâmetro 'id' é obrigatório" }),
    };
  }

  try {
    const products = productsData;
    const product = products.find((p) => p.id === id || p.slug === id);

    if (!product) {
      return {
        statusCode: 404,
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
      body: JSON.stringify({ error: "Erro ao buscar produto" }),
    };
  }
};


