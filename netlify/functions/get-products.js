import fs from "fs/promises";
import path from "path";

export const handler = async () => {
  try {
    const filePath = path.resolve(__dirname, "../../data/products.json");
    const products = require('../../data/products.json');


    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(products)
    };
  } catch (error) {
    console.error("❌ Erro real ao carregar produtos:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao listar produtos" }),
    };
  }
};
