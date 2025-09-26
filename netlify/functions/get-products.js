import productsData from "../../data/products.json";

export const handler = async () => {
  try {
    const products = productsData;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao listar produtos" }),
    };
  }
};
