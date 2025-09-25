import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async (event) => {
  const { id } = event.queryStringParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Parâmetro 'id' é obrigatório" }),
    };
  }

  const filePath = path.resolve(__dirname, "../../data/products.json");

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(data);
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


