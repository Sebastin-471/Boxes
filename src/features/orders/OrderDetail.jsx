import React, { useState } from 'react';
import { ChevronLeft, Truck, Calendar, CheckCircle2, User, X, Play, PackageCheck, Edit3, RotateCcw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../api/client';
import { useProducts } from '../../hooks/useProducts';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const DELIVERERS = ['Jimmy', 'Sebastian', 'Luis', 'Mauricio', 'July', 'Recogido por el cliente'];

const STATUS_MAP = {
  'CREATED': { label: 'PENDIENTE', order: 1, next: 'PREPARING', nextLabel: 'Empezar Preparación', nextIcon: Play, color: '#a78bfa', prev: null },
  'PREPARING': { label: 'EN CURSO', order: 2, next: 'READY', nextLabel: 'Marcar como Listo', nextIcon: PackageCheck, color: '#f59e0b', prev: 'CREATED' },
  'READY': { label: 'LISTO', order: 3, next: 'DELIVERED', nextLabel: 'Marcar como Entregado', nextIcon: CheckCircle2, color: '#60a5fa', prev: 'PREPARING' },
  'DELIVERED': { label: 'ENTREGADO', order: 4, next: null, color: 'var(--accent-success)', prev: 'READY' }
};

export default function OrderDetail({ order, onBack, onStatusUpdate, onEdit }) {
  const toast = useToast();
  const { getProductLabel } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const totalItems = (order.items || []).reduce((acc, item) => acc + item.quantity, 0);

  const currentStatusInfo = STATUS_MAP[order.status] || STATUS_MAP['CREATED'];

  const handleUpdateStatus = async (newStatus, deliverer = null) => {
    setLoading(true);
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'DELIVERED') {
        updateData.delivery_date = new Date().toISOString();
        updateData.delivered_by = deliverer;
      } else {
        updateData.delivery_date = null;
        updateData.delivered_by = null;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;
      toast.success(`Pedido: ${newStatus === 'DELIVERED' ? 'Entregado' : STATUS_MAP[newStatus].label}`);
      setShowModal(false);
      
      // Pass optimistic data so the UI updates immediately
      onStatusUpdate({ ...order, ...updateData });
    } catch (error) {
      toast.error('Error al actualizar: ' + error.message);
      // Refetch to revert any optimistic state
      onStatusUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el pedido de "${order.client_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (error) throw error;
      toast.success('Pedido eliminado correctamente');
      onBack();
      onStatusUpdate();
    } catch (error) {
      toast.error('Error al eliminar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const currentOrder = currentStatusInfo.order;
    return (
      <div className="progress-container" style={{ justifyContent: 'space-between', padding: '0 10px' }}>
        {[1, 2, 3, 4].map((step, i) => (
          <React.Fragment key={step}>
            <div className={`progress-dot ${currentOrder >= step ? 'active' : ''}`} />
            {i < 3 && <div className={`progress-line ${currentOrder > step ? 'active' : ''}`} style={{ flex: 1 }} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="view-container"
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="step-title" style={{ marginBottom: 0 }}>Detalles</h2>
        </div>
        <Button 
          variant="secondary"
          onClick={() => onEdit(order)}
          icon={Edit3}
          style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'fit-content' }}
        >
          Editar
        </Button>
      </div>

      <Card style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{order.client_name}</h3>
          <div style={{ 
            background: order.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(139, 92, 246, 0.1)',
            padding: '10px',
            borderRadius: '12px',
            color: order.status === 'DELIVERED' ? 'var(--accent-success)' : 'var(--accent-primary)'
          }}>
            <Truck size={24} />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} />
            <span>Creado por: <strong style={{color: 'white'}}>{order.created_by || 'Luis'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={14} />
            <span>Fecha: {format(new Date(order.created_at), "d 'de' MMMM, h:mm aa", { locale: es })}</span>
          </div>
          {order.status === 'DELIVERED' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-success)', marginTop: '4px' }}>
              <User size={14} />
              <span>Entregado por: <strong style={{color: 'var(--accent-success)'}}>{order.delivered_by || 'Sin asignar'}</strong></span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="section-subtitle">Contenido del Pedido</p>
        {(order.items || []).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{getProductLabel(item.boxType || item.type)}</span>
            <span style={{ fontWeight: 600 }}>{item.quantity}x</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #333', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{totalItems} cajas</span>
        </div>
      </Card>

      {order.notes && (
        <Card>
          <p className="section-subtitle">Notas</p>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{order.notes}</p>
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '1rem' }}>Estado</span>
          <Badge color={currentStatusInfo.color}>{currentStatusInfo.label}</Badge>
        </div>
        
        {renderProgressBar()}

        {currentStatusInfo.prev && (
          <button 
            onClick={() => handleUpdateStatus(currentStatusInfo.prev)}
            disabled={loading}
            style={{ 
              marginTop: '20px', 
              background: 'none', border: 'none', 
              color: 'var(--text-tertiary)', 
              display: 'flex', alignItems: 'center', gap: '8px', 
              fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 
            }}
          >
            <RotateCcw size={14} /> {loading ? '...' : 'Volver al estado anterior'}
          </button>
        )}
      </Card>

      {currentStatusInfo.next && (
        <Button 
          variant={currentStatusInfo.next === 'DELIVERED' ? 'success' : 'primary'}
          loading={loading}
          onClick={() => currentStatusInfo.next === 'DELIVERED' ? setShowModal(true) : handleUpdateStatus(currentStatusInfo.next)}
          icon={currentStatusInfo.nextIcon}
          style={{ marginTop: '20px', background: currentStatusInfo.next === 'DELIVERED' ? 'var(--accent-success)' : 'var(--accent-primary)' }}
        >
          {currentStatusInfo.nextLabel}
        </Button>
      )}

      <Button
        variant="danger"
        ghost
        onClick={handleDelete}
        disabled={loading}
        icon={Trash2}
        style={{ marginTop: '12px', background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)' }}
      >
        Eliminar Registro
      </Button>

      {/* Delivery Selection Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="modal-backdrop"
              style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                background: 'rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(4px)' 
              }}
            />
            <motion.div 
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="modal-content"
              style={{ 
                position: 'fixed', bottom: 0, left: 0, right: 0, 
                background: 'var(--bg-color)', zIndex: 1001, 
                borderTop: '1px solid var(--surface-border)',
                borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '24px', paddingBottom: '40px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem' }}>¿Quién entregó el pedido?</h3>
                <button onClick={() => setShowModal(false)} className="btn-icon">
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {DELIVERERS.map(person => (
                  <button 
                    key={person}
                    disabled={loading}
                    onClick={() => handleUpdateStatus('DELIVERED', person)}
                    className="box-item"
                    style={{ justifyContent: 'center', padding: '18px', fontSize: '1.1rem', fontWeight: 500 }}
                  >
                    {person}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
