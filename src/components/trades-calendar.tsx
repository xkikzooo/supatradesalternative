'use client';

import { TradeCalendar } from "@/components/ui/trade-calendar";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

export function TradesCalendar() {
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch("/api/trades");
        if (!response.ok) {
          throw new Error("Error al cargar los trades");
        }
        const data = await response.json();
        setTrades(data || []);
      } catch (error) {
        console.error("Error al obtener trades:", error);
      }
    };

    fetchTrades();
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <TradeCalendar trades={trades} />
      </CardContent>
    </Card>
  );
} 