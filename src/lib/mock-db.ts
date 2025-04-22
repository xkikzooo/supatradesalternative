// Mock de base de datos en memoria para desarrollo
import { hash } from 'bcryptjs';

// Define tipos según esquema de Prisma
type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
};

type TradingPair = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type TradingAccount = {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  broker: string;
  type: string;
  currency: string;
  riskPerTrade: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

type Trade = {
  id: string;
  userId: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null;
  biasExplanation: string | null;
  direction: 'LONG' | 'SHORT';
  images: string[] | null;
  pnl: number;
  psychology: string | null;
  result: 'WIN' | 'LOSS' | 'BREAKEVEN';
  tradingPairId: string;
  accountId: string;
  riskAmount: number | null;
};

// Base de datos en memoria
class MockDB {
  users: User[] = [];
  tradingPairs: TradingPair[] = [];
  tradingAccounts: TradingAccount[] = [];
  trades: Trade[] = [];

  constructor() {
    this.initializeData();
  }

  async initializeData() {
    // Crear usuario de prueba
    const hashedPassword = await hash('password123', 12);
    this.users.push({
      id: 'user-test-1',
      name: 'Usuario de Prueba',
      email: 'test@example.com',
      emailVerified: null,
      image: null,
      password: hashedPassword
    });

    // Crear pares de trading de prueba
    this.tradingPairs.push(
      {
        id: 'pair-1',
        name: 'BTC/USD',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pair-2',
        name: 'ETH/USD',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pair-3',
        name: 'EUR/USD',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Crear cuenta de trading de prueba
    this.tradingAccounts.push({
      id: 'account-1',
      name: 'Cuenta Demo',
      balance: 10000,
      initialBalance: 10000,
      broker: 'Demo Broker',
      type: 'DEMO',
      currency: 'USD',
      riskPerTrade: '2%',
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user-test-1'
    });

    // Crear algunos trades de ejemplo
    this.trades.push(
      {
        id: 'trade-1',
        userId: 'user-test-1',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        bias: 'BULLISH',
        biasExplanation: 'Tendencia alcista clara',
        direction: 'LONG',
        images: [],
        pnl: 150,
        psychology: 'Buena ejecución',
        result: 'WIN',
        tradingPairId: 'pair-1',
        accountId: 'account-1',
        riskAmount: 100
      },
      {
        id: 'trade-2',
        userId: 'user-test-1',
        date: new Date(Date.now() - 86400000), // Ayer
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        bias: 'BEARISH',
        biasExplanation: 'Rechazo de nivel clave',
        direction: 'SHORT',
        images: [],
        pnl: -75,
        psychology: 'Entré demasiado tarde',
        result: 'LOSS',
        tradingPairId: 'pair-2',
        accountId: 'account-1',
        riskAmount: 75
      }
    );
  }

  // Método para simular transacciones
  async $transaction<T>(callback: (transaction: MockDB) => Promise<T>): Promise<T> {
    // En una base de datos real, esto gestionaría transacciones atómicas
    // En nuestra versión simulada, simplemente pasamos this como el contexto de transacción
    try {
      const result = await callback(this);
      return result;
    } catch (error) {
      console.error("Error en transacción simulada:", error);
      throw error;
    }
  }

  // Métodos de acceso que emulan Prisma
  user = {
    findUnique: async ({ where }: { where: { email?: string, id?: string } }) => {
      return this.users.find(user => 
        (where.email && user.email === where.email) || 
        (where.id && user.id === where.id)
      );
    },
    create: async ({ data }: { data: Partial<User> }) => {
      const id = `user-${Date.now()}`;
      const newUser = { 
        id, 
        name: data.name || null,
        email: data.email || null, 
        emailVerified: data.emailVerified || null,
        image: data.image || null,
        password: data.password || null 
      };
      this.users.push(newUser);
      return newUser;
    }
  };

  tradingPair = {
    findMany: async () => {
      return this.tradingPairs;
    },
    findFirst: async ({ where }: { where: { id?: string } }) => {
      return this.tradingPairs.find(pair => pair.id === where.id);
    },
    create: async ({ data }: { data: Partial<TradingPair> }) => {
      const id = `pair-${Date.now()}`;
      const newPair = {
        id,
        name: data.name || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.tradingPairs.push(newPair);
      return newPair;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = this.tradingPairs.findIndex(pair => pair.id === where.id);
      if (index !== -1) {
        const deleted = this.tradingPairs.splice(index, 1)[0];
        return deleted;
      }
      return null;
    }
  };

  tradingAccount = {
    findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
      if (where?.userId) {
        return this.tradingAccounts.filter(account => account.userId === where.userId);
      }
      return this.tradingAccounts;
    },
    findFirst: async ({ where }: { where: { id?: string, userId?: string } }) => {
      return this.tradingAccounts.find(account => 
        account.id === where.id && 
        (!where.userId || account.userId === where.userId)
      );
    },
    findUnique: async ({ where }: { where: { id?: string } }) => {
      return this.tradingAccounts.find(account => account.id === where.id);
    },
    create: async ({ data }: { data: Partial<TradingAccount> }) => {
      const id = `account-${Date.now()}`;
      const newAccount = {
        id,
        name: data.name || '',
        balance: data.balance || 0,
        initialBalance: data.initialBalance || 0,
        broker: data.broker || '',
        type: data.type || '',
        currency: data.currency || 'USD',
        riskPerTrade: data.riskPerTrade || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: data.userId || ''
      };
      this.tradingAccounts.push(newAccount);
      return newAccount;
    },
    update: async ({ where, data }: { where: { id: string }, data: any }) => {
      const index = this.tradingAccounts.findIndex(account => account.id === where.id);
      if (index !== -1) {
        // Manejar increment para el balance
        if (data.balance && data.balance.increment !== undefined) {
          this.tradingAccounts[index].balance += data.balance.increment;
        } else if (data.balance !== undefined) {
          this.tradingAccounts[index].balance = data.balance;
        }
        
        this.tradingAccounts[index] = {
          ...this.tradingAccounts[index],
          ...data,
          updatedAt: new Date()
        };
        return this.tradingAccounts[index];
      }
      return null;
    },
    delete: async ({ where }: { where: { id: string } }) => {
      const index = this.tradingAccounts.findIndex(account => account.id === where.id);
      if (index !== -1) {
        const deleted = this.tradingAccounts.splice(index, 1)[0];
        return deleted;
      }
      return null;
    }
  };

  trade = {
    findMany: async ({ where, orderBy, include }: { 
      where?: { userId?: string },
      orderBy?: { date?: 'desc' | 'asc' },
      include?: any
    } = {}) => {
      let trades = [...this.trades];
      
      if (where?.userId) {
        trades = trades.filter(trade => trade.userId === where.userId);
      }
      
      if (orderBy?.date) {
        trades.sort((a, b) => {
          if (orderBy.date === 'desc') {
            return b.date.getTime() - a.date.getTime();
          } else {
            return a.date.getTime() - b.date.getTime();
          }
        });
      }
      
      if (include) {
        return trades.map(trade => {
          const result: any = { ...trade };
          
          if (include.tradingPair) {
            const pair = this.tradingPairs.find(p => p.id === trade.tradingPairId);
            result.tradingPair = pair ? { 
              id: pair.id, 
              name: pair.name 
            } : null;
          }
          
          if (include.account) {
            const account = this.tradingAccounts.find(a => a.id === trade.accountId);
            result.account = account ? { 
              id: account.id, 
              name: account.name,
              broker: account.broker,
              type: account.type,
              initialBalance: account.initialBalance
            } : null;
          }
          
          return result;
        });
      }
      
      return trades;
    },
    findFirst: async ({ where, include }: { 
      where?: { 
        id?: string,
        userId?: string,
        account?: {
          userId?: string
        }
      },
      include?: any
    } = {}) => {
      let foundTrade: Trade | null = null;
      
      if (where?.id) {
        const trade = this.trades.find(trade => trade.id === where.id);
        if (trade) foundTrade = trade;
        
        // Si hay condición de account.userId, verificar que el trade pertenece a ese usuario
        if (foundTrade && where.account?.userId) {
          const account = this.tradingAccounts.find(a => 
            a.id === foundTrade!.accountId && a.userId === where.account?.userId
          );
          if (!account) foundTrade = null;
        }
      }
      
      if (!foundTrade) {
        return null;
      }
      
      // En este punto sabemos que foundTrade no es null
      const result: any = { ...foundTrade };
      
      if (include) {
        if (include.tradingPair) {
          const pair = this.tradingPairs.find(p => p.id === foundTrade.tradingPairId);
          result.tradingPair = pair ? { 
            id: pair.id, 
            name: pair.name 
          } : null;
        }
        
        if (include.account) {
          const account = this.tradingAccounts.find(a => a.id === foundTrade.accountId);
          result.account = account ? { 
            id: account.id, 
            name: account.name,
            broker: account.broker,
            type: account.type,
            initialBalance: account.initialBalance
          } : null;
        }
        
        return result;
      }
      
      return foundTrade;
    },
    create: async ({ data, include }: { data: Partial<Trade>, include?: any }) => {
      const id = `trade-${Date.now()}`;
      const newTrade = {
        id,
        userId: data.userId || '',
        date: data.date ? new Date(data.date) : new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        bias: data.bias || null,
        biasExplanation: data.biasExplanation || null,
        direction: data.direction || 'LONG',
        images: data.images || [],
        pnl: data.pnl || 0,
        psychology: data.psychology || null,
        result: data.result || 'BREAKEVEN',
        tradingPairId: data.tradingPairId || '',
        accountId: data.accountId || '',
        riskAmount: data.riskAmount || null
      };
      
      this.trades.push(newTrade);
      
      if (include) {
        const result: any = { ...newTrade };
        
        if (include.tradingPair) {
          const pair = this.tradingPairs.find(p => p.id === newTrade.tradingPairId);
          result.tradingPair = pair ? { 
            id: pair.id, 
            name: pair.name 
          } : null;
        }
        
        return result;
      }
      
      return newTrade;
    }
  };

  // Método para conectar (no hace nada, solo para simular Prisma)
  $connect() {
    return Promise.resolve();
  }

  // Método para desconectar (no hace nada, solo para simular Prisma)
  $disconnect() {
    return Promise.resolve();
  }
}

// Exportar una instancia singleton
export const mockDB = new MockDB(); 