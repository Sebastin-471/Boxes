import React from 'react';
import { RotateCcw, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '../../hooks/useProducts';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

export default function ReturnList({ returns, loading }) {
  const { getProductLabel } = useProducts();

  const renderReturnGroups = () => {
    const groups = [];
    let currentDateStr = null;
    let currentGroup = [];

    returns.forEach(ret => {
      const dateObj = new Date(ret.created_at);
      const dateStr = format(dateObj, "d 'de' MMMM", { locale: es });

      if (dateStr !== currentDateStr) {
        if (currentGroup.length > 0) {
          groups.push({ dateStr: currentDateStr, returns: currentGroup });
        }
        currentDateStr = dateStr;
        currentGroup = [ret];
      } else {
        currentGroup.push(ret);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ dateStr: currentDateStr, returns: currentGroup });
    }

    return groups.map((group) => (
      <div key={group.dateStr} style={{ marginBottom: '20px' }}>
        <h4 className="section-divider" style={{ color: 'var(--accent-warning)' }}>
          {group.dateStr}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {group.returns.map((ret, idx) => renderReturnCard(ret, idx))}
        </div>
      </div>
    ));
  };

  const renderReturnCard = (ret, idx) => {
    const totalItems = (ret.items || []).reduce((acc, item) => acc + item.quantity, 0);

    return (
      <Card
        key={ret.id}
        idx={idx}
        style={{ borderLeft: '3px solid var(--accent-warning)', marginBottom: '0' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ret.client_name}</h3>
          <Badge color="var(--accent-warning)">Devolución</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {(ret.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{getProductLabel(item.boxType)}</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>x{item.quantity}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
            <Calendar size={12} />
            <span>{format(new Date(ret.created_at), "d MMM, h:mm aa", { locale: es })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-warning)', fontSize: '0.85rem', fontWeight: 600 }}>
            <Package size={14} />
            <span>{totalItems} cajas</span>
          </div>
        </div>

        {ret.notes && (
          <div style={{ marginTop: '10px', padding: '8px 12px', background: 'var(--accent-warning-soft)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            {ret.notes}
          </div>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="view-container">
        <h2 className="view-title">Devoluciones</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <h2 className="view-title">Devoluciones</h2>

      <AnimatePresence mode="wait">
        {returns.length > 0 ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {renderReturnGroups()}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <div className="empty-icon" style={{ color: 'var(--accent-warning)' }}>
              <RotateCcw size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Sin devoluciones</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>No hay devoluciones registradas.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
