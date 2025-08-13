import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { TradeDetails } from "./trade-details";
import { Button } from "./ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockTrades = [
  {
    id: "1",
    date: "2024-03-15",
    pair: "EURUSD",
    direction: "LONG",
    result: "WIN",
    pnl: 150.25,
    riskAmount: 50,
    bias: "Alcista",
    biasExplanation: "Tendencia alcista en el gráfico de 4H",
    psychology: "Confianza en la dirección del mercado",
  },
  {
    id: "2",
    date: "2024-03-14",
    pair: "GBPJPY",
    direction: "SHORT",
    result: "LOSS",
    pnl: -75.50,
    riskAmount: 75,
    bias: "Bajista",
    biasExplanation: "Divergencia en RSI",
    psychology: "FOMO en la entrada",
  },
  {
    id: "3",
    date: "2024-03-13",
    pair: "USDJPY",
    direction: "LONG",
    result: "WIN",
    pnl: 225.75,
    riskAmount: 100,
    bias: "Alcista",
    biasExplanation: "Rompe nivel clave",
    psychology: "Paciencia en la entrada",
  },
];

export function TradesDataTable() {
  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-300">Fecha</TableHead>
            <TableHead className="text-gray-300">Par</TableHead>
            <TableHead className="text-gray-300">Dirección</TableHead>
            <TableHead className="text-gray-300">Resultado</TableHead>
            <TableHead className="text-right text-gray-300">PnL</TableHead>
            <TableHead className="text-right text-gray-300">Riesgo</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockTrades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="text-gray-300">{trade.date}</TableCell>
              <TableCell className="text-gray-300">{trade.pair}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    trade.direction === "LONG"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-purple-500/10 text-purple-500"
                  }`}
                >
                  {trade.direction}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                    trade.result === "WIN"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {trade.result}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={trade.pnl >= 0 ? "text-green-500" : "text-red-500"}
                >
                  {formatCurrency(trade.pnl)}
                </span>
              </TableCell>
              <TableCell className="text-right text-gray-300">
                {formatCurrency(trade.riskAmount)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 