import React, { useState } from 'react';
import { ChevronLeft, Check, Search, RotateCcw } from 'lucide-react';
import { supabase, sanitizeText } from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useProducts } from '../../hooks/useProducts';
import { useClients } from '../clients/useClients';
import ClientAutocomplete from '../clients/ClientAutocomplete';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { haptics } from '../../utils/haptics';
import { markOwnAction } from '../../utils/notificationService';
import { useAuth } from '../../context/AuthContext';

export default function ReturnForm({ onReturnCreated }) {
  const { userName } = useAuth();
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
      // 1. Data Validation
      const trimmedClientName = clientName ? clientName.trim() : '';
      if (!trimmedClientName) {
        throw new Error('El nombre del cliente es obligatorio.');
      }
      if (trimmedClientName.length < 2 || trimmedClientName.length > 100) {
        throw new Error('El nombre del cliente debe tener entre 2 y 100 caracteres.');
      }
      const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-.,#]+$/;
      if (!nameRegex.test(trimmedClientName)) {
        throw new Error('El nombre del cliente contiene caracteres no permitidos.');
      }

      if (notes && notes.length > 500) {
        throw new Error('Las notas no pueden superar los 500 caracteres.');
      }

      const itemsArray = Object.entries(selectedItems).map(([boxType, quantity]) => {
        const parsedQty = Math.floor(Number(quantity));
        return { boxType, quantity: parsedQty };
      });

      if (itemsArray.length === 0) {
        throw new Error('Debe seleccionar al menos un tipo de caja.');
      }

      for (const item of itemsArray) {
        if (isNaN(item.quantity) || item.quantity <= 0) {
          throw new Error('La cantidad de cajas debe ser un número entero mayor a cero.');
        }
        if (item.quantity > 9999) {
          throw new Error('La cantidad de cajas por tipo no puede ser mayor a 9999.');
        }
        const productExists = products.some(p => p.code === item.boxType);
        if (!productExists) {
          throw new Error(`El tipo de caja "${item.boxType}" no existe en el catálogo.`);
        }
      }

      await addClient(trimmedClientName);

      const payload = {
        client_name: trimmedClientName,
        items: itemsArray,
        notes: notes ? sanitizeText(notes) : null,
        created_by: userName
      };

      const { data, error } = await supabase
        .from('returns')
        .insert([payload])
        .select();

      if (error) {
        console.error('Supabase DB error:', error);
        throw new Error('Error al conectar con el servidor. No se pudo registrar la devolución.');
      }
      
      if (data && data[0]) {
        markOwnAction(data[0].id);
      }

      haptics.success();
      toast.success('Devolución registrada con éxito');
      onReturnCreated();
    } catch (error) {
      haptics.error();
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <div style={{ background: 'var(--accent-warning-soft)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RotateCcw size={22} color="var(--accent-warning)" />
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

      <Button
        active={!!clientName}
        disabled={!clientName}
        onClick={() => setStep(2)}
        style={{ marginTop: 'auto', background: 'var(--accent-warning)' }}
      >
        Siguiente
      </Button>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(1)} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'var(--text-primary)' }}>
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
                        background: '#ffffff',
                        border: '1px solid var(--surface-border)',
                        borderRadius: '8px',
                        width: '80px',
                        height: '40px',
                        textAlign: 'center',
                        color: 'var(--text-primary)',
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
        Total a devolver: <span style={{ color: 'var(--accent-warning)', fontWeight: 600 }}>{totalCajas} cajas</span>
      </div>

      <Button
        active={totalCajas > 0}
        disabled={totalCajas === 0}
        onClick={() => setStep(3)}
        style={{ background: 'var(--accent-warning)' }}
      >
        Siguiente
      </Button>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
        <button onClick={() => setStep(2)} className="btn-icon" style={{ background: 'var(--surface-color)', border: 'none', borderRadius: '10px', padding: '8px', color: 'var(--text-primary)' }}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="step-title">Confirmar Devolución</h2>
      </div>
      <p className="step-subtitle" style={{ marginLeft: '40px' }}>Paso 3 de 3</p>

      <Card style={{ borderLeft: '3px solid var(--accent-warning)' }}>
        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Devuelto por</p>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{clientName}</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Cajas Devueltas</p>
          {Object.entries(selectedItems).map(([code, qty]) => (
            <div key={code} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{products.find(p => p.code === code)?.name || code}</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>x{qty}</span>
            </div>
          ))}
        </div>

        {notes && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Notas</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{notes}</p>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total devuelto</span>
          <span style={{ color: 'var(--accent-warning)', fontWeight: 700 }}>{totalCajas} cajas</span>
        </div>
      </Card>

      <Button
        variant="warning"
        onClick={handleSubmit}
        loading={loading}
        icon={RotateCcw}
        style={{ background: 'var(--accent-warning)', marginTop: '12px' }}
      >
        Registrar Devolución
      </Button>
    </motion.div>
  );

  return (
    <div className="view-container centered-view">
      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </AnimatePresence>
    </div>
  );
}
