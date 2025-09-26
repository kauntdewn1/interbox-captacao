/**
 * Sistema de Histórico Local de Compras INTERBØX 2025
 * Gerencia histórico de compras via PIX no localStorage
 */

export interface OrderHistoryItem {
  produtoId: string;
  slug: string;
  nome: string;
  cor: string;
  tamanho: string;
  valor: number;
  data: string; // ISO string
}

const STORAGE_KEY = 'interbox_last_orders';
const MAX_ORDERS = 5;

/**
 * Salva um novo pedido no histórico
 * @param orderData Dados do pedido a ser salvo
 */
export const saveOrderToHistory = (orderData: Omit<OrderHistoryItem, 'data'>): void => {
  try {
    // Carregar histórico existente
    const existingHistory = getOrderHistory();
    
    // Criar novo item com data atual
    const newOrder: OrderHistoryItem = {
      ...orderData,
      data: new Date().toISOString()
    };
    
    // Verificar se já existe pedido similar hoje
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const isDuplicate = existingHistory.some(order => {
      const orderDate = order.data.split('T')[0];
      return (
        order.produtoId === newOrder.produtoId &&
        order.cor === newOrder.cor &&
        order.tamanho === newOrder.tamanho &&
        orderDate === today
      );
    });
    
    if (isDuplicate) {
      console.log('⚠️ [ORDER HISTORY] Pedido duplicado detectado, não será salvo');
      return;
    }
    
    // Adicionar novo pedido no início do array
    const updatedHistory = [newOrder, ...existingHistory];
    
    // Manter apenas os últimos MAX_ORDERS pedidos
    const finalHistory = updatedHistory.slice(0, MAX_ORDERS);
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalHistory));
    
    console.log('🧾 [ORDER HISTORY] Histórico atualizado:', finalHistory);
    
  } catch (error) {
    console.error('❌ [ORDER HISTORY] Erro ao salvar pedido:', error);
  }
};

/**
 * Recupera o histórico de pedidos do localStorage
 * @returns Array com os pedidos salvos
 */
export const getOrderHistory = (): OrderHistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    
    // Validar estrutura dos dados
    if (!Array.isArray(parsed)) {
      console.warn('⚠️ [ORDER HISTORY] Dados corrompidos, resetando histórico');
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    
    // Validar cada item
    const validOrders = parsed.filter((order: any) => {
      return (
        order &&
        typeof order.produtoId === 'string' &&
        typeof order.slug === 'string' &&
        typeof order.nome === 'string' &&
        typeof order.cor === 'string' &&
        typeof order.tamanho === 'string' &&
        typeof order.valor === 'number' &&
        typeof order.data === 'string'
      );
    });
    
    return validOrders;
    
  } catch (error) {
    console.error('❌ [ORDER HISTORY] Erro ao carregar histórico:', error);
    return [];
  }
};

/**
 * Limpa todo o histórico de pedidos
 */
export const clearOrderHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ [ORDER HISTORY] Histórico limpo');
  } catch (error) {
    console.error('❌ [ORDER HISTORY] Erro ao limpar histórico:', error);
  }
};

/**
 * Remove um pedido específico do histórico
 * @param produtoId ID do produto
 * @param cor Cor selecionada
 * @param tamanho Tamanho selecionado
 * @param data Data do pedido
 */
export const removeOrderFromHistory = (
  produtoId: string, 
  cor: string, 
  tamanho: string, 
  data: string
): void => {
  try {
    const history = getOrderHistory();
    const filteredHistory = history.filter(order => 
      !(order.produtoId === produtoId && 
        order.cor === cor && 
        order.tamanho === tamanho && 
        order.data === data)
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredHistory));
    console.log('🗑️ [ORDER HISTORY] Pedido removido do histórico');
    
  } catch (error) {
    console.error('❌ [ORDER HISTORY] Erro ao remover pedido:', error);
  }
};

/**
 * Obtém estatísticas do histórico
 * @returns Objeto com estatísticas
 */
export const getOrderHistoryStats = () => {
  const history = getOrderHistory();
  
  const stats = {
    totalOrders: history.length,
    totalValue: history.reduce((sum, order) => sum + order.valor, 0),
    uniqueProducts: new Set(history.map(order => order.produtoId)).size,
    mostPopularColor: getMostPopular(history.map(order => order.cor)),
    mostPopularSize: getMostPopular(history.map(order => order.tamanho)),
    ordersByDay: getOrdersByDay(history)
  };
  
  return stats;
};

/**
 * Função auxiliar para encontrar o item mais popular
 */
const getMostPopular = (items: string[]): string | null => {
  if (items.length === 0) return null;
  
  const counts = items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts).reduce((a, b) => 
    counts[a[0]] > counts[b[0]] ? a : b
  )[0];
};

/**
 * Função auxiliar para agrupar pedidos por dia
 */
const getOrdersByDay = (history: OrderHistoryItem[]): Record<string, number> => {
  return history.reduce((acc, order) => {
    const day = order.data.split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Exporta o histórico como JSON para backup
 * @returns String JSON do histórico
 */
export const exportOrderHistory = (): string => {
  const history = getOrderHistory();
  return JSON.stringify(history, null, 2);
};

/**
 * Importa histórico de backup JSON
 * @param jsonData String JSON com dados do histórico
 */
export const importOrderHistory = (jsonData: string): boolean => {
  try {
    const imported = JSON.parse(jsonData);
    
    if (!Array.isArray(imported)) {
      throw new Error('Dados inválidos: deve ser um array');
    }
    
    // Validar estrutura
    const isValid = imported.every((order: any) => 
      order &&
      typeof order.produtoId === 'string' &&
      typeof order.slug === 'string' &&
      typeof order.nome === 'string' &&
      typeof order.cor === 'string' &&
      typeof order.tamanho === 'string' &&
      typeof order.valor === 'number' &&
      typeof order.data === 'string'
    );
    
    if (!isValid) {
      throw new Error('Estrutura de dados inválida');
    }
    
    // Salvar histórico importado
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
    console.log('📥 [ORDER HISTORY] Histórico importado com sucesso');
    
    return true;
    
  } catch (error) {
    console.error('❌ [ORDER HISTORY] Erro ao importar histórico:', error);
    return false;
  }
};