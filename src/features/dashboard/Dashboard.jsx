import React, { useMemo } from 'react';
import { Package, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  isWithinInterval
} from 'date-fns';
import Card from '../../components/common/Card';
import { useProducts } from '../../hooks/useProducts';

export default function Dashboard({ orders, returns, onTabNavigate }) {
  const { getProductLabel } = useProducts();

  const stats = useMemo(() => {
    const now = new Date();
    const todayInterval = { start: startOfDay(now), end: endOfDay(now) };
    const weekInterval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };

    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

    const calcDelivered = (interval) => {
      return deliveredOrders
        .filter(o => {
          const date = new Date(o.delivery_date || o.created_at);
          return isWithinInterval(date, interval);
        })
        .reduce((total, o) => {
          return total + (o.items || []).reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const calcReturned = (interval) => {
      return (returns || [])
        .filter(r => {
          const date = new Date(r.created_at);
          return isWithinInterval(date, interval);
        })
        .reduce((total, r) => {
          return total + (r.items || []).reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const todayDelivered = calcDelivered(todayInterval);
    const todayReturned = calcReturned(todayInterval);
    const weekDelivered = calcDelivered(weekInterval);
    const weekReturned = calcReturned(weekInterval);
    const monthDelivered = calcDelivered(monthInterval);
    const monthReturned = calcReturned(monthInterval);

    return {
      today: { delivered: todayDelivered, returned: todayReturned, net: todayDelivered - todayReturned },
      week: { delivered: weekDelivered, returned: weekReturned, net: weekDelivered - weekReturned },
      month: { delivered: monthDelivered, returned: monthReturned, net: monthDelivered - monthReturned },
    };
  }, [orders, returns]);

  const activeBoxesData = useMemo(() => {
    const activeOrders = orders.filter(o => o.status === 'CREATED' || o.status === 'READY');
    if (activeOrders.length === 0) return null;

    const totals = {};
    activeOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const code = item.boxType || item.type;
        totals[code] = (totals[code] || 0) + item.quantity;
      });
    });

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([code, qty]) => ({ code, qty, label: getProductLabel(code) }));
  }, [orders, getProductLabel]);

  const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED').length;

  const cards = [
    {
      title: 'Hoy',
      id: 'dashboard',
      icon: Calendar,
      ...stats.today,
      accentColor: 'var(--accent-warning)',
      gradientFrom: 'var(--accent-warning-soft)',
      gradientTo: 'transparent',
    },
    {
      title: 'Semana',
      id: 'dashboard',
      icon: TrendingUp,
      ...stats.week,
      accentColor: 'var(--accent-primary)',
      gradientFrom: 'var(--accent-primary-soft)',
      gradientTo: 'transparent',
    },
    {
      title: 'Mes',
      id: 'history',
      icon: Package,
      ...stats.month,
      accentColor: 'var(--accent-success)',
      gradientFrom: 'var(--accent-success-soft)',
      gradientTo: 'transparent',
    },
  ];

  return (
    <div style={{ marginBottom: '8px' }}>
      {/* Quick stats bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        padding: '0 2px'
      }}>
        <div style={{
          flex: 1,
          background: 'var(--accent-primary-soft)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1 }}>{activeOrdersCount}</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activos</p>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--accent-success-soft)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-success)', lineHeight: 1 }}>{stats.today.delivered}</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hoy</p>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--accent-warning-soft)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-warning)', lineHeight: 1 }}>{stats.today.returned}</p>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Devueltas</p>
        </div>
      </div>

      <h3 className="section-title">Resumen de Entregas</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {cards.map((card, idx) => (
          <Card
            key={card.title}
            idx={idx}
            onClick={() => onTabNavigate?.(card.id)}
            style={{
              background: `linear-gradient(135deg, ${card.gradientFrom} 0%, ${card.gradientTo} 100%)`,
              borderColor: 'var(--hairline)',
              marginBottom: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: `${card.accentColor}18`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <card.icon size={20} color={card.accentColor} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>
                    {card.title}
                  </p>
                  <p style={{ fontSize: '1.6rem', fontWeight: 700, color: card.accentColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
                    {card.net}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: '6px' }}>netas</span>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={12} color="var(--accent-success)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.delivered}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowDownRight size={12} color="var(--accent-error)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{card.returned}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Active boxes summary — aggregate by type for pending + ready orders */}
      <div style={{ marginTop: '28px' }}>
        <h3 className="section-title">Pedidos Activos por Tipo</h3>

        {activeBoxesData === null ? (
          <Card style={{ padding: '24px', textAlign: 'center' }}>
            <Box size={32} color="var(--text-tertiary)" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
              No hay pedidos pendientes ni listos
            </p>
          </Card>
        ) : (
          <Card style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeBoxesData.map(({ code, qty, label }, idx) => (
                <div
                  key={code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: idx % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px',
                      background: 'var(--accent-primary-soft)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Box size={16} color="var(--accent-primary)" />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {label}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '1.1rem', fontWeight: 700,
                    color: 'var(--accent-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    background: 'var(--accent-primary-soft)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)'
                  }}>
                    {qty}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '12px', textAlign: 'right' }}>
              {activeBoxesData.length} tipo{activeBoxesData.length !== 1 ? 's' : ''} • Solo pendientes y listos
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}