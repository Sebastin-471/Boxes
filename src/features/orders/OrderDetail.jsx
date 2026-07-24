import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Truck, Calendar, CheckCircle2, User, X, PackageCheck, Edit3, RotateCcw, Trash2, UserX, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../api/client';
import { deliveryService, computeRemaining, isFullyDelivered } from '../../api/deliveryService';
import { useProducts } from '../../hooks/useProducts';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import DeliveryForm from '../../components/common/DeliveryForm';
import { markOwnAction } from '../../utils/notificationService';

const DELIVERERS = ['Jimmy', 'Sebastian', 'Luis', 'Mauricio', 'July', 'Recogido por el cliente'];

const STATUS_MAP = {
  'CREATED': { label: 'PENDIENTE', order: 1, next: 'READY', nextLabel: 'Marcar como Listo', nextIcon: PackageCheck, color: 'var(--accent-warning)', prev: null },
  'READY': { label: 'LISTO', order: 2, next: 'DELIVERED', nextLabel: 'Marcar Entregado', nextIcon: CheckCircle2, color: 'var(--accent-primary)', prev: 'CREATED' },
  'DELIVERED': { label: 'ENTREGADO', order: 3, next: null, color: 'var(--accent-success)', prev: 'READY' },
  'ABANDONED': { label: 'ABANDONADO', order: 4, next: null, color: 'var(--accent-error)', prev: 'READY' }
};

export default function OrderDetail({ order, onBack, onStatusUpdate, onEdit }) {
  const toast = useToast();
  const { getProductLabel } = useProducts();
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [deliveries, setDeliveries] = useState([]);

  const totalItems = (order.items || []).reduce((acc, item) => acc + item.quantity, 0);
  const currentStatusInfo = STATUS_MAP[order.status] || STATUS_MAP['CREATED'];

  // Load deliveries for this order
  useEffect(() => {
    if (!order?.id) return;
    let cancelled = false;
    deliveryService.getAllByOrder(order.id)
      .then((data) => { if (!cancelled) setDeliveries(data || []); })
      .catch((err) => console.error('Error loading deliveries:', err));
    return () => { cancelled = true; };
  }, [order?.id]);

  // Computed remaining quantities
  const remainingItems = useMemo(
    () => computeRemaining(order.items, deliveries),
    [order.items, deliveries]
  );

  const canMarkDelivered = useMemo(
    () => isFullyDelivered(order.items, deliveries),
    [order.items, deliveries]
  );

  const totalDelivered = deliveries.reduce((sum, d) => sum + d.quantity, 0);

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
      markOwnAction(order.id);
      toast.success(`Pedido: ${newStatus === 'DELIVERED' ? 'Entregado' : STATUS_MAP[newStatus].label}`);
      
      // Pass optimistic data so the UI updates immediately
      onStatusUpdate({ ...order, ...updateData });
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el pedido.');
      // Refetch to revert any optimistic state
      onStatusUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async (payload) => {
    setLoadingDelivery(true);
    try {
      if (payload.mode === 'ALL') {
        const availableItems = remainingItems.filter((r) => r.remaining > 0);
        const newDeliveries = availableItems.map(item => ({
          order_id: order.id,
          box_type: item.boxType,
          quantity: item.remaining,
          client_name: order.client_name,
          deliverer: payload.deliverer,
          notes: payload.notes,
          created_by: order.created_by || null,
        }));
        
        if (newDeliveries.length > 0) {
          const createdList = await deliveryService.createMany(newDeliveries);
          setDeliveries((prev) => [...createdList, ...prev]);
        }
        setShowDeliveryForm(false);
        // Automatically mark as DELIVERED
        await handleUpdateStatus('DELIVERED', payload.deliverer);
      } else {
        const newDeliveries = payload.items.map(item => ({
          order_id: order.id,
          box_type: item.boxType,
          quantity: item.quantity,
          client_name: payload.client_name,
          deliverer: payload.deliverer,
          notes: payload.notes,
          created_by: order.created_by || null,
        }));
        
        let createdList = [];
        if (newDeliveries.length > 0) {
          createdList = await deliveryService.createMany(newDeliveries);
          setDeliveries((prev) => [...createdList, ...prev]);
        }
        setShowDeliveryForm(false);
        toast.success(`Despacho parcial registrado`);
        
        // If this makes it fully delivered, auto mark it
        const allDeliveries = [...createdList, ...deliveries];
        if (isFullyDelivered(order.items, allDeliveries)) {
          await handleUpdateStatus('DELIVERED', payload.deliverer);
        }
      }
    } catch (error) {
      console.error('Error creating delivery:', error);
      toast.error(error.message || 'Error al registrar el despacho.');
    } finally {
      setLoadingDelivery(false);
    }
  };

  const handleDeleteDelivery = async (deliveryId) => {
    if (!window.confirm('¿Eliminar este registro de despacho?')) return;
    try {
      await deliveryService.delete(deliveryId);
      setDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
      toast.success('Despacho eliminado');
    } catch (error) {
      console.error('Error deleting delivery:', error);
      toast.error('Error al eliminar el despacho.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar (desactivar) el pedido de "${order.client_name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', order.id);

      if (error) throw error;
      markOwnAction(order.id);
      toast.success('Pedido eliminado correctamente');
      onBack();
      onStatusUpdate();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const currentOrder = currentStatusInfo.order;
    return (
      <div className="progress-container" style={{ justifyContent: 'space-between', padding: '0 10px' }}>
        {[1, 2, 3].map((step, i) => (
          <React.Fragment key={step}>
            <div className={`progress-dot ${currentOrder >= step ? 'active' : ''}`} />
            {i < 2 && <div className={`progress-line ${currentOrder > step ? 'active' : ''}`} style={{ flex: 1 }} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="view-container centered-view"
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'var(--text-primary)' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="step-title" style={{ marginBottom: 0 }}>Detalles</h2>
        </div>
        {order.status !== 'DELIVERED' && (
          <Button 
            variant="secondary"
            onClick={() => onEdit(order)}
            icon={Edit3}
            style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'fit-content' }}
          >
            Editar
          </Button>
        )}
      </div>

      <Card style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{order.client_name}</h3>
          <div style={{ 
            background: order.status === 'DELIVERED' ? 'var(--accent-success-soft)' : 'var(--accent-primary-soft)',
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
             <span>Creado por: <strong style={{color: 'var(--text-primary)'}}>{order.created_by || 'Luis'}</strong></span>
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

      {/* Order Content with delivery progress */}
      <Card>
        <p className="section-subtitle">Contenido del Pedido</p>
        {remainingItems.map((item, idx) => {
          const pct = item.total > 0 ? Math.min((item.delivered / item.total) * 100, 100) : 0;
          const isDone = item.remaining <= 0;
          return (
            <div key={idx} style={{ marginBottom: idx < remainingItems.length - 1 ? '14px' : '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  {getProductLabel(item.boxType)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {deliveries.length > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: isDone ? 'var(--accent-success)' : 'var(--text-tertiary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {item.delivered}/{item.total}
                    </span>
                  )}
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{item.total}x</span>
                </div>
              </div>
              {/* Progress bar — only show if there are deliveries */}
              {deliveries.length > 0 && (
                <div style={{
                  height: '4px',
                  background: 'var(--surface-hover)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                      height: '100%',
                      background: isDone
                        ? 'var(--accent-success)'
                        : 'var(--accent-primary)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
        <div style={{ borderTop: '1px solid var(--hairline)', marginTop: '16px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{totalItems} cajas</span>
        </div>
        {totalDelivered > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Despachadas</span>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: canMarkDelivered ? 'var(--accent-success)' : 'var(--accent-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {totalDelivered} cajas
            </span>
          </div>
        )}
      </Card>

      {order.notes && (
        <Card>
          <p className="section-subtitle">Notas</p>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{order.notes}</p>
        </Card>
      )}

      {/* Delivery History */}
      {deliveries.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p className="section-subtitle" style={{ margin: 0 }}>Historial de Despachos</p>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-tertiary)',
              background: 'var(--surface-hover)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 500,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {deliveries.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deliveries.map((d, idx) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: idx % 2 === 0 ? 'transparent' : 'var(--surface-hover)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <Package size={12} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                       {d.quantity}x {getProductLabel(d.box_type)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {d.deliverer}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {format(new Date(d.delivered_at), "dd/MM/yy HH:mm", { locale: es })}
                    </span>
                    {d.client_name && d.client_name !== order.client_name && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        → {d.client_name}
                      </span>
                    )}
                  </div>
                  {d.notes && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '3px', fontStyle: 'italic' }}>
                      {d.notes}
                    </p>
                  )}
                </div>
                {order.status !== 'DELIVERED' && (
                  <button
                    onClick={() => handleDeleteDelivery(d.id)}
                    aria-label="Eliminar despacho"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      opacity: 0.5,
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
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

      {/* Action buttons */}
      {order.status === 'READY' && (
        <Button
          variant="primary"
          loading={loadingDelivery || loading}
          onClick={() => setShowDeliveryForm(true)}
          icon={Truck}
          style={{
            marginTop: '20px',
            background: 'var(--accent-primary)',
          }}
        >
          Registrar Entrega
        </Button>
      )}

      {currentStatusInfo.next && currentStatusInfo.next !== 'DELIVERED' && (
        <Button 
          variant="primary"
          loading={loading}
          onClick={() => handleUpdateStatus(currentStatusInfo.next)}
          icon={currentStatusInfo.nextIcon}
          style={{ marginTop: '20px', background: 'var(--accent-primary)' }}
        >
          {currentStatusInfo.nextLabel}
        </Button>
      )}

      {order.status === 'READY' && (
        <Button
          variant="danger"
          ghost
          onClick={() => setShowAbandonModal(true)}
          disabled={loading}
          icon={UserX}
          style={{ marginTop: '12px', background: 'none', border: '1px solid var(--accent-error)', color: 'var(--accent-error)' }}
        >
          Marcar Abandonado
        </Button>
      )}

      {order.status !== 'DELIVERED' && (
        <Button
          variant="danger"
          ghost
          onClick={handleDelete}
          disabled={loading}
          icon={Trash2}
          style={{ marginTop: '12px', background: 'none', border: '1px solid rgba(255, 59, 48, 0.3)' }}
        >
          Eliminar Registro
        </Button>
      )}

      {/* Delivery Form Modal */}
      <AnimatePresence>
        {showDeliveryForm && (
          <DeliveryForm
            order={order}
            deliveries={deliveries}
            onSubmit={handleCreateDelivery}
            onCancel={() => setShowDeliveryForm(false)}
            loading={loadingDelivery}
          />
        )}
      </AnimatePresence>



       {/* Abandon Confirmation Modal */}
       <AnimatePresence>
         {showAbandonModal && (
           <>
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAbandonModal(false)}
               className="modal-backdrop"
               style={{ 
                 position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                 background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(4px)' 
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
                 <h3 style={{ fontSize: '1.25rem' }}>Marcar como Abandonado</h3>
                 <button onClick={() => setShowAbandonModal(false)} className="btn-icon">
                   <X size={24} />
                 </button>
               </div>

               <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
                 El cliente no ha recogido el pedido después de un tiempo prolongado. 
                 ¿Confirmar abandono?
               </p>

               <Button
                 variant="danger"
                 loading={loading}
                 onClick={() => {
                   handleUpdateStatus('ABANDONED');
                   setShowAbandonModal(false);
                 }}
                 style={{ width: '100%' }}
               >
                 Confirmar Abandono
               </Button>
             </motion.div>
           </>
         )}
       </AnimatePresence>
     </motion.div>
   );
 }
