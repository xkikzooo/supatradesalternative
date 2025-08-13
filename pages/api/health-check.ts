import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Realizar una consulta simple
    const { data, error } = await supabase
      .from('TradingPair')
      .select('count(*)', { count: 'exact' });

    if (error) {
      throw error;
    }

    res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Database connection failed'
    });
  }
} 