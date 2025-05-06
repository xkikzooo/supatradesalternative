import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Tipo para los trades
interface Trade {
  id: string;
  tradingPair: {
    id: string;
    name: string;
  };
  date: string;
  pnl: number;
  result: string;
  bias?: string;
  biasExplanation?: string;
  psychology?: string;
  direction: 'LONG' | 'SHORT';
  riskAmount?: number;
  account?: {
    id: string;
    name: string;
    broker: string;
    type: string;
  };
}

// Función para exportar a Excel
export const exportToExcel = (trades: Trade[], fileName: string = 'trades') => {
  // Preparar los datos para Excel
  const excelData = trades.map(trade => ({
    'Fecha': format(new Date(trade.date), 'dd/MM/yyyy HH:mm'),
    'Par': trade.tradingPair.name,
    'Dirección': trade.direction,
    'Cuenta': trade.account?.name || '',
    'Resultado': trade.result,
    'PnL': trade.pnl,
    'Riesgo': trade.riskAmount || '',
    'Bias': trade.bias || '',
    'Explicación': trade.biasExplanation || '',
    'Psicología': trade.psychology || ''
  }));

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');

  // Generar el archivo Excel
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Guardar el archivo
  saveAs(data, `${fileName}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};

// Función para exportar a CSV
export const exportToCSV = (trades: Trade[], fileName: string = 'trades') => {
  // Encabezados CSV
  let csvContent = 'Fecha,Par,Dirección,Cuenta,Resultado,PnL,Riesgo,Bias,Explicación,Psicología\n';
  
  // Añadir cada trade
  trades.forEach(trade => {
    const row = [
      format(new Date(trade.date), 'dd/MM/yyyy HH:mm'),
      trade.tradingPair.name,
      trade.direction,
      trade.account?.name || '',
      trade.result,
      trade.pnl,
      trade.riskAmount || '',
      trade.bias || '',
      `"${(trade.biasExplanation || '').replace(/"/g, '""')}"`,
      `"${(trade.psychology || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  // Crear blob y guardar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${fileName}_${format(new Date(), 'yyyyMMdd')}.csv`);
};

// Función para exportar a PDF
export const exportToPDF = (trades: Trade[], fileName: string = 'trades') => {
  // Crear nuevo documento PDF
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Registro de Trades', 14, 22);
  
  // Fecha de exportación
  doc.setFontSize(11);
  doc.text(`Exportado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 30);
  
  // Preparar los datos para la tabla
  const tableData = trades.map(trade => [
    format(new Date(trade.date), 'dd/MM/yyyy'),
    trade.tradingPair.name,
    trade.direction,
    trade.result,
    trade.pnl.toString(),
    trade.account?.name || ''
  ]);
  
  // Crear la tabla
  autoTable(doc, {
    head: [['Fecha', 'Par', 'Dirección', 'Resultado', 'PnL', 'Cuenta']],
    body: tableData,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44, 62, 80] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 40 }
  });
  
  // Guardar el PDF
  doc.save(`${fileName}_${format(new Date(), 'yyyyMMdd')}.pdf`);
}; 