export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      User: {
        Row: {
          id: string
          name: string | null
          email: string | null
          emailVerified: string | null
          image: string | null
          password: string | null
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
          password?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          emailVerified?: string | null
          image?: string | null
          password?: string | null
        }
      }
      Trade: {
        Row: {
          id: string
          userId: string
          date: string
          createdAt: string
          updatedAt: string
          bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null
          biasExplanation: string | null
          direction: 'LONG' | 'SHORT'
          images: string[] | null
          pnl: number
          psychology: string | null
          result: 'WIN' | 'LOSS' | 'BREAKEVEN'
          tradingPairId: string
          accountId: string
          riskAmount: number | null
        }
        Insert: {
          id: string
          userId: string
          date: string
          createdAt?: string
          updatedAt: string
          bias?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null
          biasExplanation?: string | null
          direction: 'LONG' | 'SHORT'
          images?: string[] | null
          pnl: number
          psychology?: string | null
          result: 'WIN' | 'LOSS' | 'BREAKEVEN'
          tradingPairId: string
          accountId: string
          riskAmount?: number | null
        }
        Update: {
          id?: string
          userId?: string
          date?: string
          createdAt?: string
          updatedAt?: string
          bias?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | null
          biasExplanation?: string | null
          direction?: 'LONG' | 'SHORT'
          images?: string[] | null
          pnl?: number
          psychology?: string | null
          result?: 'WIN' | 'LOSS' | 'BREAKEVEN'
          tradingPairId?: string
          accountId?: string
          riskAmount?: number | null
        }
      }
      TradingAccount: {
        Row: {
          id: string
          name: string
          balance: number
          initialBalance: number
          broker: string
          type: string
          currency: string
          riskPerTrade: string | null
          createdAt: string
          updatedAt: string
          userId: string
        }
        Insert: {
          id: string
          name: string
          balance: number
          initialBalance: number
          broker: string
          type: string
          currency: string
          riskPerTrade?: string | null
          createdAt?: string
          updatedAt: string
          userId: string
        }
        Update: {
          id?: string
          name?: string
          balance?: number
          initialBalance?: number
          broker?: string
          type?: string
          currency?: string
          riskPerTrade?: string | null
          createdAt?: string
          updatedAt?: string
          userId?: string
        }
      }
      TradingPair: {
        Row: {
          id: string
          name: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id: string
          name: string
          createdAt?: string
          updatedAt: string
        }
        Update: {
          id?: string
          name?: string
          createdAt?: string
          updatedAt?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      TradeBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
      TradeDirection: 'LONG' | 'SHORT'
      TradeResult: 'WIN' | 'LOSS' | 'BREAKEVEN'
    }
  }
} 