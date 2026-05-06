import React, { useState, useEffect, useRef } from 'react';
import { User, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClients } from '../lib/useClients';

export default function ClientAutocomplete({ value, onChange, placeholder = "Nombre del cliente..." }) {
  const { clients, loading } = useClients();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredClients, setFilteredClients] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value.trim() === '') {
      setFilteredClients([]);
      return;
    }

    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(value.toLowerCase()) &&
      client.name.toLowerCase() !== value.toLowerCase()
    );
    setFilteredClients(filtered.slice(0, 5)); // Limit to 5 suggestions
  }, [value, clients]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="autocomplete-container" ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          className="custom-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        {loading && (
          <div style={{ position: 'absolute', right: '12px', top: '16px' }}>
            <div className="spinner-small" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (filteredClients.length > 0 || (value.trim() !== '' && !clients.some(c => c.name.toLowerCase() === value.toLowerCase()))) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card-glass"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              marginTop: '4px',
              padding: '4px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  onChange(client.name);
                  setShowSuggestions(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  textAlign: 'left',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                <User size={16} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{client.name}</span>
              </button>
            ))}

            {value.trim() !== '' && !clients.some(c => c.name.toLowerCase() === value.toLowerCase()) && (
              <div
                style={{
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  borderTop: filteredClients.length > 0 ? '1px solid #333' : 'none',
                  marginTop: filteredClients.length > 0 ? '4px' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={12} />
                <span>Se registrará como cliente nuevo</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
