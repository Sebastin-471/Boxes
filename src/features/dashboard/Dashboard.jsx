import React, { useMemo } from 'react';
import { Package, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  isWithinInterval
} from 'date-fns';
import Card from '../../components/common/Card';

export default function Dashboard({ orders, returns, onTabNavigate }) {
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

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED').length;

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
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)', lineHeight: 1 }}>{activeOrders}</p>
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
              borderColor: `${card.accentColor}15`,
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
    </div>
  );
}
