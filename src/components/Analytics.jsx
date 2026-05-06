import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  format, subMonths, startOfMonth, endOfMonth, isWithinInterval,
  eachMonthOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useProducts } from '../lib/useProducts';

const CHART_COLORS = [
  '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#60a5fa', '#3b82f6', '#2563eb',
  '#10b981', '#34d399', '#6ee7b7',
  '#f59e0b', '#fbbf24', '#fcd34d',
  '#ef4444', '#f87171', '#fca5a5',
  '#ec4899', '#f472b6'
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(18,18,18,0.95)',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '12px 16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, fontSize: '0.8rem', marginBottom: '2px' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Analytics({ orders, returns }) {
  const { products, getProductLabel } = useProducts();
  const [monthsToShow, setMonthsToShow] = useState(6);

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), monthsToShow - 1),
      end: endOfMonth(now)
    });

    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

    return months.map(monthDate => {
      const interval = {
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate)
      };

      const monthLabel = format(monthDate, 'MMM yy', { locale: es });
      const monthFullLabel = format(monthDate, "MMMM yyyy", { locale: es });

      // Delivered in this month
      const delivered = deliveredOrders
        .filter(o => {
          const date = new Date(o.delivery_date || o.created_at);
          return isWithinInterval(date, interval);
        })
        .reduce((total, o) => {
          return total + (o.items || []).reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

      // Returned in this month
      const returned = (returns || [])
        .filter(r => isWithinInterval(new Date(r.created_at), interval))
        .reduce((total, r) => {
          return total + (r.items || []).reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

      return {
        month: monthLabel,
        fullMonth: monthFullLabel,
        entregadas: delivered,
        devueltas: returned,
        neto: delivered - returned
      };
    });
  }, [orders, returns, monthsToShow]);

  // Product breakdown by month
  const productMonthlyData = useMemo(() => {
    const now = new Date();
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

    // Aggregate per product
    const productTotals = {};

    deliveredOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const code = item.boxType || item.type;
        if (!productTotals[code]) {
          productTotals[code] = { code, name: getProductLabel(code), total: 0, monthlyData: {} };
        }
        productTotals[code].total += item.quantity;

        const monthKey = format(new Date(order.delivery_date || order.created_at), 'yyyy-MM');
        productTotals[code].monthlyData[monthKey] = (productTotals[code].monthlyData[monthKey] || 0) + item.quantity;
      });
    });

    // Calculate months for average
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), monthsToShow - 1),
      end: endOfMonth(now)
    });

    return Object.values(productTotals)
      .map(p => ({
        ...p,
        average: Math.round((p.total / Math.max(months.length, 1)) * 10) / 10
      }))
      .sort((a, b) => b.total - a.total);
  }, [orders, monthsToShow, getProductLabel]);

  // Pie chart data (top products)
  const pieData = useMemo(() => {
    const top = productMonthlyData.slice(0, 8);
    const othersTotal = productMonthlyData.slice(8).reduce((sum, p) => sum + p.total, 0);
    
    const data = top.map(p => ({
      name: p.name.replace('Caja ', ''),
      value: p.total
    }));

    if (othersTotal > 0) {
      data.push({ name: 'Otros', value: othersTotal });
    }

    return data;
  }, [productMonthlyData]);

  const totalDelivered = monthlyData.reduce((sum, m) => sum + m.entregadas, 0);

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ background: 'rgba(139,92,246,0.15)', borderRadius: '12px', padding: '10px' }}>
            <BarChart3 size={22} color="#8b5cf6" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Análisis</h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginLeft: '52px' }}>
          Estadísticas de los últimos {monthsToShow} meses
        </p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[3, 6, 12].map(m => (
          <button
            key={m}
            onClick={() => setMonthsToShow(m)}
            className={`chip ${monthsToShow === m ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
          >
            {m} meses
          </button>
        ))}
      </div>

      {/* Chart 1: Monthly deliveries trend */}
      <div className="card-glass" style={{ padding: '20px 12px 12px' }}>
        <p style={{
          fontSize: '0.75rem', color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '16px', paddingLeft: '8px', fontWeight: 600
        }}>
          Entregas vs Devoluciones por Mes
        </p>

        <div style={{ width: '100%', height: 220, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientReturned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#333' }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#333' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="entregadas"
                name="Entregadas"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#gradientDelivered)"
              />
              <Area
                type="monotone"
                dataKey="devueltas"
                name="Devueltas"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradientReturned)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Product distribution (Pie) */}
      {pieData.length > 0 && (
        <div className="card-glass" style={{ padding: '20px 12px 12px' }}>
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '8px', paddingLeft: '8px', fontWeight: 600
          }}>
            Distribución por Producto
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', paddingLeft: '8px', marginBottom: '12px' }}>
            Total: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{totalDelivered} cajas</span>
          </p>

          <div style={{ width: '100%', height: 280, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#555' }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart 3: Product averages (horizontal bar ranking) */}
      {productMonthlyData.length > 0 && (
        <div className="card-glass" style={{ padding: '20px 12px 12px' }}>
          <p style={{
            fontSize: '0.75rem', color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: '16px', paddingLeft: '8px', fontWeight: 600
          }}>
            Promedio Mensual por Producto
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 8px' }}>
            {productMonthlyData.slice(0, 10).map((product, idx) => {
              const maxAvg = productMonthlyData[0]?.average || 1;
              const width = Math.max((product.average / maxAvg) * 100, 4);

              return (
                <motion.div
                  key={product.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {product.name.replace('Caja ', '')}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: CHART_COLORS[idx % CHART_COLORS.length] }}>
                      {product.average}/mes
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: '#1a1a1a',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ delay: idx * 0.05 + 0.2, duration: 0.6 }}
                      style={{
                        height: '100%',
                        background: `linear-gradient(90deg, ${CHART_COLORS[idx % CHART_COLORS.length]}, ${CHART_COLORS[idx % CHART_COLORS.length]}88)`,
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {productMonthlyData.length > 10 && (
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '12px' }}>
              +{productMonthlyData.length - 10} productos más
            </p>
          )}
        </div>
      )}

      {/* Monthly breakdown table */}
      <div className="card-glass" style={{ padding: '20px 16px' }}>
        <p style={{
          fontSize: '0.75rem', color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.05em',
          marginBottom: '16px', fontWeight: 600
        }}>
          Detalle Mensual
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--surface-border)', fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            <span style={{ flex: 1 }}>Mes</span>
            <span style={{ width: '60px', textAlign: 'right' }}>Salieron</span>
            <span style={{ width: '60px', textAlign: 'right' }}>Devueltas</span>
            <span style={{ width: '50px', textAlign: 'right' }}>Neto</span>
          </div>

          {monthlyData.map((row, idx) => (
            <motion.div
              key={row.month}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                padding: '6px 0',
                borderBottom: '1px solid var(--surface-border)'
              }}
            >
              <span style={{ flex: 1, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{row.month}</span>
              <span style={{ width: '60px', textAlign: 'right', color: '#8b5cf6', fontWeight: 500 }}>{row.entregadas}</span>
              <span style={{ width: '60px', textAlign: 'right', color: '#f59e0b', fontWeight: 500 }}>{row.devueltas}</span>
              <span style={{ width: '50px', textAlign: 'right', fontWeight: 600 }}>{row.neto}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
