import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async () => {
  const filePath = path.resolve(__dirname, "../../data/products.json");

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(data);

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
