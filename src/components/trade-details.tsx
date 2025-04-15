import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface TradeDetailsProps {
  trade: {
    id: string;
    date: string;
    pair: string;
    direction: string;
    result: string;
    pnl: number;
    riskAmount: number;
    bias?: string;
    biasExplanation?: string;
    psychology?: string;
  };
}

export function TradeDetails({ trade }: TradeDetailsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="details" className="border-none">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Badge variant={trade.result === "WIN" ? "success" : "destructive"}>
              {trade.result}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(trade.pnl)}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Sesgo</h4>
                <p className="text-sm">{trade.bias || "No especificado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Explicación del Sesgo</h4>
                <p className="text-sm">{trade.biasExplanation || "No especificado"}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground">Psicología</h4>
                <p className="text-sm">{trade.psychology || "No especificado"}</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
} 