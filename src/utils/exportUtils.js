import { format } from 'date-fns';

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
      
      const row = [
        item.id,
        `"${item.client_name.replace(/"/g, '""')}"`,
        item.status,
        item.created_at ? format(new Date(item.created_at), 'yyyy-MM-dd HH:mm') : '',
        item.delivery_date ? format(new Date(item.delivery_date), 'yyyy-MM-dd HH:mm') : '',
        item.delivered_by || '',
        totalCajas,
        `"${detailCajas.replace(/"/g, '""')}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`
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
