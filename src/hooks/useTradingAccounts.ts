import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type TradingAccount = Database['public']['Tables']['TradingAccount']['Row']
type InsertTradingAccount = Database['public']['Tables']['TradingAccount']['Insert']

export const useTradingAccounts = () => {
  const getTradingAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('TradingAccount')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return data
  }, [])

  const createTradingAccount = useCallback(async (account: Omit<InsertTradingAccount, 'id'>) => {
    const { data, error } = await supabase
      .from('TradingAccount')
      .insert({
        ...account,
        id: crypto.randomUUID(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }, [])

  const updateTradingAccount = useCallback(async (id: string, account: Partial<TradingAccount>) => {
    const { data, error } = await supabase
      .from('TradingAccount')
      .update(account)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }, [])

  const deleteTradingAccount = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('TradingAccount')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }, [])

  return {
    getTradingAccounts,
    createTradingAccount,
    updateTradingAccount,
    deleteTradingAccount,
  }
} 