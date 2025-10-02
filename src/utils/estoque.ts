/**
 * Utilitários para gerenciamento de estoque por cor e tamanho
 */

export interface TamanhoComQuantidade {
  nome: string;
  medidas: string;
  disponivel: boolean;
  quantidade?: Record<string, number>; // cor -> quantidade
}

export interface ProdutoComEstoque {
  id: string;
  nome: string;
  cores: Array<{ nome: string; hex: string; badge: string; disponivel: boolean }>;
  tamanhos: TamanhoComQuantidade[];
  estoque: number;
}

/**
 * Obtém a quantidade disponível para uma combinação específica de cor e tamanho
 */
export function getQuantidadeDisponivel(
  produto: ProdutoComEstoque,
  cor: string,
  tamanho: string
): number {
  if (!produto.tamanhos || !produto.cores) {
    return 0;
  }

  const tamanhoObj = produto.tamanhos.find(t => t.nome === tamanho);
  if (!tamanhoObj || !tamanhoObj.quantidade) {
    return 0;
  }

  return tamanhoObj.quantidade[cor] || 0;
}

/**
 * Verifica se uma combinação de cor e tamanho está disponível
 */
export function isCombinacaoDisponivel(
  produto: ProdutoComEstoque,
  cor: string,
  tamanho: string
): boolean {
  return getQuantidadeDisponivel(produto, cor, tamanho) > 0;
}

/**
 * Obtém o estoque total do produto (soma de todas as combinações)
 */
export function getEstoqueTotal(produto: ProdutoComEstoque): number {
  if (!produto.tamanhos) {
    return produto.estoque || 0;
  }

  let total = 0;
  produto.tamanhos.forEach(tamanho => {
    if (tamanho.quantidade) {
      Object.values(tamanho.quantidade).forEach(quantidade => {
        total += quantidade;
      });
    }
  });

  return total;
}

/**
 * Obtém o estoque disponível para uma cor específica
 */
export function getEstoquePorCor(produto: ProdutoComEstoque, cor: string): number {
  if (!produto.tamanhos) {
    return 0;
  }

  let total = 0;
  produto.tamanhos.forEach(tamanho => {
    if (tamanho.quantidade && tamanho.quantidade[cor]) {
      total += tamanho.quantidade[cor];
    }
  });

  return total;
}

/**
 * Obtém o estoque disponível para um tamanho específico
 */
export function getEstoquePorTamanho(produto: ProdutoComEstoque, tamanho: string): number {
  if (!produto.tamanhos) {
    return 0;
  }

  const tamanhoObj = produto.tamanhos.find(t => t.nome === tamanho);
  if (!tamanhoObj || !tamanhoObj.quantidade) {
    return 0;
  }

  return Object.values(tamanhoObj.quantidade).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Obtém cores disponíveis para um tamanho específico
 */
export function getCoresDisponiveisParaTamanho(
  produto: ProdutoComEstoque,
  tamanho: string
): Array<{ nome: string; hex: string; badge: string; disponivel: boolean; quantidade: number }> {
  if (!produto.cores || !produto.tamanhos) {
    return [];
  }

  const tamanhoObj = produto.tamanhos.find(t => t.nome === tamanho);
  if (!tamanhoObj || !tamanhoObj.quantidade) {
    return [];
  }

  return produto.cores
    .filter(cor => tamanhoObj.quantidade![cor.nome] > 0)
    .map(cor => ({
      ...cor,
      quantidade: tamanhoObj.quantidade![cor.nome]
    }));
}

/**
 * Obtém tamanhos disponíveis para uma cor específica
 */
export function getTamanhosDisponiveisParaCor(
  produto: ProdutoComEstoque,
  cor: string
): Array<TamanhoComQuantidade & { quantidadeDisponivel: number }> {
  if (!produto.tamanhos) {
    return [];
  }

  return produto.tamanhos
    .filter(tamanho => tamanho.quantidade && tamanho.quantidade[cor] > 0)
    .map(tamanho => ({
      ...tamanho,
      quantidadeDisponivel: tamanho.quantidade![cor]
    }));
}

/**
 * Atualiza a quantidade disponível para uma combinação específica
 * (útil para quando um item é vendido)
 */
export function atualizarQuantidade(
  produto: ProdutoComEstoque,
  cor: string,
  tamanho: string,
  novaQuantidade: number
): ProdutoComEstoque {
  const produtoAtualizado = { ...produto };
  
  const tamanhoIndex = produtoAtualizado.tamanhos.findIndex(t => t.nome === tamanho);
  if (tamanhoIndex !== -1) {
    produtoAtualizado.tamanhos[tamanhoIndex] = {
      ...produtoAtualizado.tamanhos[tamanhoIndex],
      quantidade: {
        ...produtoAtualizado.tamanhos[tamanhoIndex].quantidade,
        [cor]: Math.max(0, novaQuantidade)
      }
    };
  }

  // Atualizar estoque total
  produtoAtualizado.estoque = getEstoqueTotal(produtoAtualizado);

  return produtoAtualizado;
}
