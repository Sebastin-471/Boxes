import React, { useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  isWithinInterval
} from 'date-fns';

export default function Dashboard({ orders, returns }) {
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

  const cards = [
    {
      title: 'Hoy',
      icon: Calendar,
      ...stats.today,
      gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)',
      accentColor: '#a78bfa',
    },
    {
      title: 'Esta Semana',
      icon: TrendingUp,
      ...stats.week,
      gradient: 'linear-gradient(135deg, rgba(96,165,250,0.15) 0%, rgba(96,165,250,0.05) 100%)',
      accentColor: '#60a5fa',
    },
    {
      title: 'Este Mes',
      icon: Package,
      ...stats.month,
      gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
      accentColor: '#10b981',
    },
  ];

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '16px',
        fontWeight: 600
      }}>
        Resumen de Entregas
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="card-glass dashboard-card"
            style={{ background: card.gradient, borderColor: `${card.accentColor}22` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '6px', fontWeight: 500 }}>
                  {card.title}
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 700, color: card.accentColor, lineHeight: 1 }}>
                  {card.net}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  cajas netas
                </p>
              </div>

              <div style={{
                background: `${card.accentColor}15`,
                borderRadius: '14px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <card.icon size={24} color={card.accentColor} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid var(--surface-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUp size={14} color="#10b981" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {card.delivered} <span style={{ color: 'var(--text-tertiary)' }}>entregadas</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowDown size={14} color="#f59e0b" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {card.returned} <span style={{ color: 'var(--text-tertiary)' }}>devueltas</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
