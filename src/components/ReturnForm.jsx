import React, { useState } from 'react';
import { ChevronLeft, Check, Search, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../lib/ToastContext';
import { useProducts } from '../lib/useProducts';
import { useClients } from '../lib/useClients';
import ClientAutocomplete from './ClientAutocomplete';

export default function ReturnForm({ onReturnCreated }) {
  const toast = useToast();
  const { products, loading: productsLoading } = useProducts();
  const { addClient } = useClients();
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalCajas = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const filteredProducts = products.filter(p =>
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
      // Asegurar que el cliente existe
      await addClient(clientName);

      const itemsArray = Object.entries(selectedItems).map(([boxType, quantity]) => ({ boxType, quantity }));

      const payload = {
        client_name: clientName,
        items: itemsArray,
        notes: notes || null,
        created_by: 'Luis'
      };

      const { error } = await supabase
        .from('returns')
        .insert([payload]);

      if (error) throw error;

      toast.success('Devolución registrada con éxito');
      onReturnCreated();
    } catch (error) {
      toast.error('Error al registrar devolución: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={22} color="#f59e0b" />
        </div>
        <h2 className="step-title">Nueva Devolución</h2>
      </div>
      <p className="step-subtitle" style={{ marginLeft: '52px' }}>Paso 1 de 3</p>

      <label className="input-label">¿De quién es la devolución?</label>
      <ClientAutocomplete 
        value={clientName}
        onChange={setClientName}
        placeholder="Nombre del cliente..."
      />

      <label className="input-label">Notas (Opcional)</label>
      <textarea
        className="custom-textarea"
        placeholder="Motivo de la devolución..."
        rows="3"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        className={`btn-nav ${clientName ? 'active' : ''}`}
        disabled={!clientName}
        onClick={() => setStep(2)}
        style={{ marginTop: 'auto' }}
      >
        Siguiente
      </button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(1)} style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="step-title">Cajas Devueltas</h2>
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
        Selecciona las cajas devueltas y la cantidad
      </p>

      {productsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass skeleton" style={{ height: '56px' }} />
          ))}
        </div>
      ) : (
        <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
          {filteredProducts.map(product => {
            const isSelected = selectedItems[product.code] > 0;
            return (
              <div
                key={product.code}
                className={`box-item ${isSelected ? 'selected return-selected' : ''}`}
                onClick={() => handleUpdateQuantity(product.code, isSelected ? -selectedItems[product.code] : 1)}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 500 : 400 }}>{product.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected ? (
                    <input
                      type="number"
                      className="qty-input"
                      value={selectedItems[product.code]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        handleUpdateQuantity(product.code, isNaN(val) ? 0 : val - selectedItems[product.code]);
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
        Total a devolver: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{totalCajas} cajas</span>
      </div>

      <button
        className={`btn-nav ${totalCajas > 0 ? 'active' : ''}`}
        disabled={totalCajas === 0}
        onClick={() => setStep(3)}
      >
        Siguiente
      </button>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(2)} style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'white' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="step-title">Confirmar Devolución</h2>
      </div>
      <p className="step-subtitle" style={{ marginLeft: '40px' }}>Paso 3 de 3</p>

      <div className="card-glass" style={{ borderLeft: '3px solid #f59e0b' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Devuelto por</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{clientName}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Cajas Devueltas</p>
          {Object.entries(selectedItems).map(([code, qty]) => (
            <div key={code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{products.find(p => p.code === code)?.name || code}</span>
              <span style={{ fontWeight: 600, color: '#f59e0b' }}>x{qty}</span>
            </div>
          ))}
        </div>

        {notes && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Notas</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{notes}</p>
          </div>
        )}

        <div style={{ borderTop: '1px solid #333', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total devuelto</span>
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>{totalCajas} cajas</span>
        </div>
      </div>

      <button
        className="btn-submit"
        onClick={handleSubmit}
        disabled={loading}
        style={{ background: '#f59e0b', marginTop: '12px' }}
      >
        {loading ? 'Registrando...' : (
          <>
            <RotateCcw size={20} /> Registrar Devolución
          </>
        )}
      </button>
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
