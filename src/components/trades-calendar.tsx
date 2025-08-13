'use client';

import { TradeCalendar } from "@/components/ui/trade-calendar";
import { useState, useEffect } from "react";

export function TradesCalendar() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/trades");
        if (!response.ok) {
          throw new Error("Error al cargar los trades");
        }
        const data = await response.json();
        setTrades(data || []);
      } catch (error) {
        console.error("Error al obtener trades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60 text-lg">Cargando calendario...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <TradeCalendar trades={trades} />
    </div>
  );
} 