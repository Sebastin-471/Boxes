import { format } from 'date-fns';

function sanitizeCSVCell(value) {
  if (value === null || value === undefined) return '';
  const stringVal = String(value);
  // Escaping CSV formulas by prefixing with an apostrophe if it starts with characters: = + - @ \t \r
  if (/^[=+\-@\t\r]/.test(stringVal)) {
    return "'" + stringVal;
  }
  return stringVal;
}

export function exportToCSV(data, filename = 'reporte-cajas.csv') {
  if (!data || !data.length) return;

  // Header keys
  const headers = ['ID', 'Cliente', 'Estado', 'Fecha Creación', 'Fecha Entrega', 'Repartidor', 'Total Cajas', 'Detalle Cajas', 'Notas'];
  
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => {
      const totalCajas = (item.items || []).reduce((acc, i) => acc + i.quantity, 0);
      const detailCajas = (item.items || [])
        .map(i => `${i.boxType}:${i.quantity}`)
        .join('; ');
      
      const escapedClientName = sanitizeCSVCell(item.client_name).replace(/"/g, '""');
      const escapedDetailCajas = sanitizeCSVCell(detailCajas).replace(/"/g, '""');
      const escapedNotes = sanitizeCSVCell(item.notes || '').replace(/"/g, '""');
      const escapedDeliveredBy = sanitizeCSVCell(item.delivered_by || '').replace(/"/g, '""');
      const escapedStatus = sanitizeCSVCell(item.status || '').replace(/"/g, '""');

      const row = [
        item.id,
        `"${escapedClientName}"`,
        `"${escapedStatus}"`,
        item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '',
        item.delivery_date ? format(new Date(item.delivery_date), 'yyyy-MM-dd HH:mm') : '',
        `"${escapedDeliveredBy}"`,
        totalCajas,
        `"${escapedDetailCajas}"`,
        `"${escapedNotes}"`
      ];
      
      return row.join(',');
    })
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
