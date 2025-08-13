'use client';

import { TradeForm } from "@/components/ui/trade-form";

type Params = {
  params: {
    id: string;
  };
};

export default function EditTradePage({ params }: Params) {
  return <TradeForm mode="edit" tradeId={params.id} />;
} 