import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Trade = Database['public']['Tables']['Trade']['Row']
type InsertTrade = Database['public']['Tables']['Trade']['Insert']

export const useTrades = () => {
  const getTrades = useCallback(async () => {
    const { data, error } = await supabase
      .from('Trade')
      .select('*, TradingPair(name), TradingAccount(name, balance)')
      .order('date', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }, [])

  const createTrade = useCallback(async (trade: Omit<InsertTrade, 'id'>) => {
    const { data, error } = await supabase
      .from('Trade')
      .insert({
        ...trade,
        id: crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }, [])

  const updateTrade = useCallback(async (id: string, trade: Partial<Trade>) => {
    const { data, error } = await supabase
      .from('Trade')
      .update(trade)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }, [])

  const deleteTrade = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('Trade')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }, [])

  return {
    getTrades,
    createTrade,
    updateTrade,
    deleteTrade,
  }
} 