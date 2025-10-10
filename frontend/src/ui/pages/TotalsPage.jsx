// frontend/src/ui/pages/TotalsPage.jsx
import React,{ useState,useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
//import { getTotals } from '@/api/reportsService.js'
import { api } from '@/lib/api.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// 👇 importa servicios nuevos y jsPDF
import {getTotals, getOverdue, getPendingPerAccountMonth } from '@/api/reportsService.js';
//import { getOverdueReport as getOverdue, getPendingTotalsByAccountMonth as getPendingPerAccountMonth } from '@/api/reportsService.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Box,
  Button,
  HStack,
  Select,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

export function TotalsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [granularity, setGranularity] = useState('day');
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState(''); // '', 'pending', 'paid', 'cancelled'
  const [flowType, setFlowType] = useState('out'); // 'out'|'in'|'' → por defecto 'out' (pagos)


  // Colores dinámicos
    const bgContent = useColorModeValue("neutral.50", "neutral.900");
    const textContent = useColorModeValue("neutral.800", "neutral.100");
    const inputBg = useColorModeValue("neutral.50", "neutral.700");
    const inputColor = useColorModeValue("neutral.800", "neutral.100");
    const placeholderColor = useColorModeValue("gray.400", "gray.500");
    const buttonBg = useColorModeValue("brand.500", "accent.500");
    const buttonColor = useColorModeValue("white", "black");
    const buttonHover = useColorModeValue("brand.600", "accent.600");
    const bgCard = useColorModeValue("neutral.100", "neutral.800");
  

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.get('/accounts').then(r => r.data),
  });

  
  const { data: totals = [], isLoading } = useQuery({
    queryKey: ['totals', from, to, account, granularity, status, flowType],
    queryFn: () =>
      getTotals({
        from,
        to,
        account,
        groupBy: 'date',
        granularity,
        status: status || undefined,
        type: flowType || undefined, // 'out' por defecto si quieres
      }),
    keepPreviousData: true,
  });

  const chartData = useMemo(
    () => (Array.isArray(totals) ? totals : []).map(t => ({ date: t._id?.date || t._id, total: t.total })),
    [totals]
  );
   
  // ====== PDF: Vencidos ======
  const handleExportOverduePdf = async () => {
  try {
    // Trae vencidos hasta "to"
    const res = await getOverdue({ to });
    const rows = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);

    if (!Array.isArray(rows)) {
      console.error('Overdue API malform:', res);
      alert('La API de vencidos no devolvió array');
      return;
    }

    // Total
    const total = rows.reduce((acc, r) => acc + (r.amount || 0), 0);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });

    // Medidas y márgenes
    const pageWidth = doc.internal.pageSize.getWidth();      // ~595 pt en A4 vertical
    const marginX   = 40;                                     // margen lateral
    const tableMaxW = pageWidth - marginX * 2;                // ancho máximo utilizable

    // Anchos de columna (que SÍ caben en A4 con ese margen)
    // Suma: 60 + 70 + 90 + 60 + 110 + 60 + 65 = 515 pt  (entra en ~595 - 80 = 515)
    const cw = {
      date:     60,  // 0
      account:  70,  // 1
      prov:     100,  // 2
      cat:      70,  // 3
      concept: 100,  // 4
      status:   60,  // 5
      amount:   70,  // 6
    };

    // Cabecera
    const title = 'Plazos vencidos';
    const range = `Hasta: ${to}`;
    doc.setFontSize(16);
    doc.text(title, marginX, 40);
    doc.setFontSize(10);
    doc.text(range, marginX, 58);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, marginX, 72);

    const body = rows.map(r => ([
      (r.date ? new Date(r.date).toISOString().slice(0,10) : ''),
      (r.account?.alias || '—'),
      (r.counterparty?.name || '—'),
      (r.category?.name || '—'),
      (r.concept || '—'),
      (r.status === 'pending' ? 'Pendiente' :
       r.status === 'paid' ? 'Pagado' :
       r.status === 'cancelled' ? 'Cancelado' : r.status || '—'),
      (r.amount || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
    ]));

    autoTable(doc, {
      startY: 90,
      head: [[
        'Fecha', 'Cuenta', 'Proveedor', 'Categoría', 'Concepto', 'Estado', 'Importe'
      ]],
      body,
      // Asegura que la tabla no supere el ancho útil
      tableWidth: tableMaxW,
      margin: { left: marginX, right: marginX },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',    // corta en varias líneas si no cabe
        halign: 'left',
        valign: 'middle',
      },
      headStyles: { fillColor: [33, 37, 41] },
      columnStyles: {
        0: { cellWidth: cw.date },
        1: { cellWidth: cw.account },
        2: { cellWidth: cw.prov,    overflow: 'linebreak' },   // Proveedor puede ser largo
        3: { cellWidth: cw.cat },
        4: { cellWidth: cw.concept, overflow: 'linebreak' },   // Concepto suele ser largo
        5: { cellWidth: cw.status },
        6: { cellWidth: cw.amount, halign: 'right' },          // Importe a la derecha
      },
      // Opcional: reducir un poco fuente del contenido para ganar hueco
      didParseCell: (data) => {
        if (data.section === 'body') {
          data.cell.styles.fontSize = 8.5; // un poco menor para evitar corte
        }
      },
    });

    // Total al final
    const y = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12);
    doc.text(`TOTAL: ${total.toLocaleString('es-ES',{ style:'currency', currency:'EUR' })}`, marginX, y);

    doc.save(`vencidos_${to}.pdf`);
  } catch (e) {
    console.error(e);
    alert('No se pudo generar el PDF de vencidos');
  }
};

  // ====== PDF: Pendientes por cuenta y mes ======
  const handleExportPendingPerAccountMonthPdf = async () => {
    try {
      const res = await getPendingPerAccountMonth({ from, to });
      const rows = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const data = Array.isArray(rows) ? rows : (Array.isArray(rows?.data) ? rows.data : []);
      if (!Array.isArray(data)) {
        console.error('Overdue API malform:', rows);
        alert('La API de vencidos no devolvió array');
        return;
      }


      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'A4' });
      doc.setFontSize(16);
      doc.text('Pendientes por cuenta y mes', 40, 40);
      doc.setFontSize(10);
      doc.text(`Desde: ${from}  Hasta: ${to}`, 40, 58);
      doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 40, 72);

      const body = rows.map(r => {
        const mm = String(r.m).padStart(2,'0');
        const ym = `${mm}/${r.y}`;
        return [
          r.accountAlias || '—',
          ym,
          (r.total || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
        ];
      });

      autoTable(doc, {
        startY: 90,
        head: [[ 'Cuenta', 'Mes/Año', 'Pendiente (€)' ]],
        body,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [33, 37, 41] },
        columnStyles: {
          0: { cellWidth: 200 },
          1: { cellWidth: 100, halign: 'center' },
          2: { cellWidth: 120, halign: 'right' },
        },
      });

      doc.save(`pendientes_cuenta_mes_${from}_${to}.pdf`);
    } catch (e) {
      console.error(e);
      alert('No se pudo generar el PDF de pendientes por cuenta/mes');
    }
  };

  return (
    <div className="page" >
      <div className="card controls">
        <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        <select className="input" value={granularity} onChange={e => setGranularity(e.target.value)}>
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </select>
        <select className="input" value={account} onChange={e => setAccount(e.target.value)}>
          <option value="">Todas</option>
          {accounts.map(a => (
            <option key={a._id} value={a._id}>{a.alias}</option>
          ))}
        </select>

        {/* NUEVO: Estado */}
        <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="paid">Pagado</option>
          <option value="cancelled">Cancelado</option>
        </select>

        {/* NUEVO: Tipo (por claridad, deja 'Pagos' como defecto) */}
        <select className="input" value={flowType} onChange={e => setFlowType(e.target.value)}>
          <option value="out">Pagos (out)</option>
          <option value="in">Cobros (in)</option>
          <option value="">Todos</option>
        </select>


        {/* Botones PDF */}
        <Button bg={buttonBg} color={buttonColor}  _hover={{ bg: buttonHover }} onClick={handleExportOverduePdf}>
          PDF vencidos
        </Button>
        
        <Button bg={buttonBg} color={buttonColor}  _hover={{ bg: buttonHover }} onClick={handleExportPendingPerAccountMonthPdf}>
          PDF pendientes (cuenta/mes)
        </Button>
        
        
      </div>

      <div className="card" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line dataKey="total" type="monotone" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((r, i) => (
              <tr key={i}>
                <td>{r.date}</td>
                <td>
                  {(r.total || 0).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

