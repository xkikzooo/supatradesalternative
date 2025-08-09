// Interfaz para los trades
interface Trade {
  id: string;
  pnl: number;
  date: string;
  riskAmount?: number;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
}

// Calcular el ratio de Sharpe
export const calculateSharpeRatio = (trades: Trade[], riskFreeRate = 0.01): number => {
  if (trades.length < 2) return 0;

  // Calcular retornos diarios
  const returns = calculateDailyReturns(trades);
  
  // Si no hay retornos, devolver 0
  if (returns.length === 0) return 0;
  
  // Calcular media y desviación estándar
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  // Desviación estándar
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const stdDeviation = Math.sqrt(variance);
  
  // Evitar división por cero
  if (stdDeviation === 0) return 0;
  
  // Calcular ratio de Sharpe (anualizado)
  const annualizationFactor = Math.sqrt(252); // Factor para anualizar (252 días de trading al año)
  return ((meanReturn - riskFreeRate / 252) / stdDeviation) * annualizationFactor;
};

// Calcular el ratio de Sortino (similar a Sharpe pero solo considera riesgo a la baja)
export const calculateSortinoRatio = (trades: Trade[], riskFreeRate = 0.01): number => {
  if (trades.length < 2) return 0;

  // Calcular retornos diarios
  const returns = calculateDailyReturns(trades);
  
  // Si no hay retornos, devolver 0
  if (returns.length === 0) return 0;
  
  // Calcular media
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  // Filtrar solo retornos negativos para downside deviation
  const negativeReturns = returns.filter(ret => ret < 0);
  
  // Si no hay retornos negativos, evitar división por cero
  if (negativeReturns.length === 0) return meanReturn > 0 ? 10 : 0; // Valor arbitrario alto si es todo positivo
  
  // Calcular downside deviation
  const downsideVariance = negativeReturns.reduce((sum, ret) => sum + Math.pow(ret, 2), 0) / negativeReturns.length;
  const downsideDeviation = Math.sqrt(downsideVariance);
  
  // Evitar división por cero
  if (downsideDeviation === 0) return 0;
  
  // Calcular ratio de Sortino (anualizado)
  const annualizationFactor = Math.sqrt(252);
  return ((meanReturn - riskFreeRate / 252) / downsideDeviation) * annualizationFactor;
};

// Calcular drawdown máximo
export const calculateMaxDrawdown = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  
  // Ordenar trades por fecha
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  for (const trade of sortedTrades) {
    runningPnL += trade.pnl;
    
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    
    const currentDrawdown = ((peak - runningPnL) / peak) * 100;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  }
  
  return maxDrawdown;
};

// Calcular factor de beneficio (profit factor)
export const calculateProfitFactor = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  
  const grossProfit = trades
    .filter(trade => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);
    
  const grossLoss = Math.abs(trades
    .filter(trade => trade.pnl < 0)
    .reduce((sum, trade) => sum + trade.pnl, 0));
  
  // Evitar división por cero
  if (grossLoss === 0) {
    // Si no hay pérdidas pero hay ganancias, retornar un valor alto pero razonable
    return grossProfit > 0 ? 99.99 : 0;
  }
  
  const profitFactor = grossProfit / grossLoss;
  
  // Limitar el valor máximo para evitar números excesivamente altos
  return Math.min(profitFactor, 99.99);
};

// Calcular expectativa matemática
export const calculateExpectancy = (trades: Trade[]): number => {
  if (trades.length === 0) return 0;
  
  const winRate = trades.filter(trade => trade.result === 'WIN').length / trades.length;
  const lossRate = trades.filter(trade => trade.result === 'LOSS').length / trades.length;
  
  const averageWin = trades
    .filter(trade => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0) / trades.filter(trade => trade.pnl > 0).length || 0;
  
  const averageLoss = Math.abs(trades
    .filter(trade => trade.pnl < 0)
    .reduce((sum, trade) => sum + trade.pnl, 0) / trades.filter(trade => trade.pnl < 0).length || 1);
  
  return (winRate * averageWin) - (lossRate * averageLoss);
};

// Función auxiliar para calcular retornos diarios
const calculateDailyReturns = (trades: Trade[]): number[] => {
  // Primero agrupar trades por fecha
  const tradesByDate: {[key: string]: number} = {};
  
  trades.forEach(trade => {
    const dateStr = new Date(trade.date).toISOString().split('T')[0];
    tradesByDate[dateStr] = (tradesByDate[dateStr] || 0) + trade.pnl;
  });
  
  // Convertir a array de retornos
  const dailyPnLs = Object.values(tradesByDate);
  
  // Suponiendo un capital inicial (para simplificar usamos 10000)
  const initialCapital = 10000;
  let capital = initialCapital;
  
  // Calcular retornos diarios
  const returns: number[] = [];
  
  for (const pnl of dailyPnLs) {
    const dailyReturn = pnl / capital;
    returns.push(dailyReturn);
    capital += pnl;
  }
  
  return returns;
}; 