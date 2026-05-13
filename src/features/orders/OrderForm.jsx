import React, { useState } from 'react';
import { ChevronLeft, Check, Plus, Minus, Search } from 'lucide-react';
import { supabase } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../hooks/useProducts';
import { useClients } from '../clients/useClients';
import ClientAutocomplete from '../clients/ClientAutocomplete';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { haptics } from '../../utils/haptics';
import { markOwnAction } from '../../utils/notificationService';

export default function OrderForm({ onOrderCreated, initialData = null }) {
  const toast = useToast();
  const { products, loading: productsLoading } = useProducts();
  const { addClient } = useClients();
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState(initialData?.client_name || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [selectedItems, setSelectedItems] = useState(() => {
    if (initialData?.items) {
      const itemsMap = {};
      initialData.items.forEach(item => {
        itemsMap[item.boxType || item.type] = item.quantity;
      });
      return itemsMap;
    }
    return {};
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalCajas = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const filteredBoxes = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateQuantity = (code, delta) => {
    setSelectedItems(prev => {
      const current = prev[code] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const newState = { ...prev };
        delete newState[code];
        return newState;
      }
      return { ...prev, [code]: newValue };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addClient(clientName);

      const itemsArray = Object.entries(selectedItems).map(([boxType, quantity]) => ({ boxType, quantity }));
      
      const payload = {
        client_name: clientName,
        items: itemsArray,
        notes: notes,
        status: initialData?.status || 'CREATED',
        created_by: initialData?.created_by || 'Luis'
      };

      let error;
      if (initialData?.id) {
        const { error: err } = await supabase
          .from('orders')
          .update(payload)
          .eq('id', initialData.id);
        error = err;
      } else {
        const { data, error: err } = await supabase
          .from('orders')
          .insert([payload])
          .select();
        error = err;
        if (data && data[0]) {
          markOwnAction(data[0].id);
        }
      }

      if (error) throw error;
      if (initialData) markOwnAction(initialData.id);

      haptics.success();
      toast.success(initialData ? 'Pedido actualizado' : 'Pedido creado con éxito');
      onOrderCreated();
    } catch (error) {
      haptics.error();
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <h2 className="step-title">{initialData ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
      <p className="step-subtitle">Paso 1 de 3</p>

      <label className="input-label">Nombre del Cliente</label>
      <ClientAutocomplete 
        value={clientName}
        onChange={setClientName}
        placeholder="A quién se entrega..."
      />

      <label className="input-label">Notas (Opcional)</label>
      <textarea 
        className="custom-textarea" 
        placeholder="Detalles adicionales..." 
        rows="4"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Button 
        active={!!clientName}
        disabled={!clientName}
        onClick={() => setStep(2)}
        style={{ marginTop: 'auto' }}
      >
        Siguiente
      </Button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(1)} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="step-title">Seleccionar Cajas</h2>
      </div>
      <p className="step-subtitle" style={{ marginLeft: '40px' }}>Paso 2 de 3</p>

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
        <input 
          className="custom-input" 
          placeholder="Buscar tipo de caja..." 
          style={{ paddingLeft: '48px', marginBottom: 0 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
        Selecciona las cajas y especifica la cantidad de cada una
      </p>

      {productsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass skeleton" style={{ height: '56px' }} />
          ))}
        </div>
      ) : (
        <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
          {filteredBoxes.map(box => {
            const isSelected = selectedItems[box.code] > 0;
            return (
              <div 
                key={box.code} 
                className={`box-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleUpdateQuantity(box.code, isSelected ? -selectedItems[box.code] : 1)}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 500 : 400 }}>{box.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="number"
                        className="qty-input"
                        value={selectedItems[box.code]}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          handleUpdateQuantity(box.code, isNaN(val) ? 0 : val - selectedItems[box.code]);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.target.select()}
                        style={{
                          background: '#2a2a2a',
                          border: 'none',
                          borderRadius: '8px',
                          width: '80px',
                          height: '40px',
                          textAlign: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '40px' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: 'center', marginBottom: '16px', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
        Total: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{totalCajas} cajas</span>
      </div>

      <Button 
        active={totalCajas > 0}
        disabled={totalCajas === 0}
        onClick={() => setStep(3)}
      >
        Siguiente
      </Button>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(2)} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="step-title">Confirmar</h2>
      </div>
      <p className="step-subtitle" style={{ marginLeft: '40px' }}>Paso 3 de 3</p>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Cliente</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{clientName}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Cajas</p>
          {Object.entries(selectedItems).map(([code, qty]) => (
            <div key={code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{products.find(p => p.code === code)?.name || code}</span>
              <span style={{ fontWeight: 600 }}>x{qty}</span>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total</span>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{totalCajas} cajas</span>
        </div>
      </Card>

      <Button variant="primary" onClick={handleSubmit} loading={loading} icon={Check}>
        {initialData ? 'Guardar Cambios' : 'Crear Pedido'}
      </Button>
    </motion.div>
  );

  return (
    <div className="view-container">
      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>
    </div>
  );
}
