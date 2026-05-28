import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { haptics } from '../../utils/haptics';
import { useToast } from '../../context/ToastContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const toast = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('boxmanager_remember_me');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [email, setEmail] = useState(() => {
    const saved = localStorage.getItem('boxmanager_remember_me');
    const shouldRemember = saved !== null ? JSON.parse(saved) : true;
    return shouldRemember ? (localStorage.getItem('boxmanager_remembered_email') || '') : '';
  });
  const [password, setPassword] = useState(() => {
    const saved = localStorage.getItem('boxmanager_remember_me');
    const shouldRemember = saved !== null ? JSON.parse(saved) : true;
    return shouldRemember ? (localStorage.getItem('boxmanager_remembered_password') || '') : '';
  });
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRememberMeChange = (checked) => {
    setRememberMe(checked);
    localStorage.setItem('boxmanager_remember_me', JSON.stringify(checked));
    if (!checked) {
      localStorage.removeItem('boxmanager_remembered_email');
      localStorage.removeItem('boxmanager_remembered_password');
    }
  };

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Client-side validations
    if (!email || !password) {
      haptics.error();
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (!validateEmail(email)) {
      haptics.error();
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      haptics.error();
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (!isLogin && !displayName.trim()) {
      haptics.error();
      setErrorMsg('Por favor ingresa tu nombre.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        haptics.success();
        toast.success('Sesión iniciada con éxito');
        
        if (rememberMe) {
          localStorage.setItem('boxmanager_remember_me', 'true');
          localStorage.setItem('boxmanager_remembered_email', email);
          localStorage.setItem('boxmanager_remembered_password', password);
        } else {
          localStorage.setItem('boxmanager_remember_me', 'false');
          localStorage.removeItem('boxmanager_remembered_email');
          localStorage.removeItem('boxmanager_remembered_password');
        }
      } else {
        await signUp(email, password, displayName.trim());
        haptics.success();
        toast.success('Registro completado. ¡Bienvenido!');
        
        if (rememberMe) {
          localStorage.setItem('boxmanager_remember_me', 'true');
          localStorage.setItem('boxmanager_remembered_email', email);
          localStorage.setItem('boxmanager_remembered_password', password);
        } else {
          localStorage.setItem('boxmanager_remember_me', 'false');
          localStorage.removeItem('boxmanager_remembered_email');
          localStorage.removeItem('boxmanager_remembered_password');
        }
      }
    } catch (err) {
      haptics.error();
      console.error('Auth error detail:', err);
      
      // Map Supabase errors to friendly messages
      let friendlyMessage = 'Ocurrió un error. Por favor intenta de nuevo.';
      if (err.message === 'Invalid login credentials') {
        friendlyMessage = 'Correo o contraseña incorrectos.';
      } else if (err.message === 'User already registered') {
        friendlyMessage = 'El correo ya está registrado.';
      } else if (err.message?.includes('network')) {
        friendlyMessage = 'Error de red. Verifica tu conexión a internet.';
      }
      
      setErrorMsg(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(circle at top left, #120e2e 0%, #050505 50%, #050505 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'absolute', width: '250px', height: '250px',
        background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%',
        top: '-50px', left: '-50px', filter: 'blur(80px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '250px', height: '250px',
        background: 'rgba(16, 185, 129, 0.08)', borderRadius: '50%',
        bottom: '-50px', right: '-50px', filter: 'blur(80px)', pointerEvents: 'none'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '400px', zIndex: 1 }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyItems: 'center',
            justifyContent: 'center',
            fontWeight: 900, fontSize: '1.6rem', color: 'white',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
            marginBottom: '16px'
          }}>
            B
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>
            BoxManager
          </h1>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginTop: '4px' }}>
            {isLogin ? 'Inicia sesión para gestionar pedidos' : 'Crea una cuenta para comenzar'}
          </p>
        </div>

        <Card style={{ padding: '28px 24px', background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: '#f87171',
                    fontSize: '0.85rem'
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="input-label" style={{ marginBottom: '8px' }}>Nombre Completo</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Tu nombre..."
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{ paddingLeft: '48px', marginBottom: 0 }}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="input-label" style={{ marginBottom: '8px' }}>Correo Electrónico</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                <input
                  type="email"
                  className="custom-input"
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '48px', marginBottom: 0 }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label" style={{ marginBottom: '8px' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="custom-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '48px', paddingRight: '48px', marginBottom: 0 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '16px', top: '16px',
                    background: 'none', border: 'none', color: 'var(--text-tertiary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', margin: '-4px 0 -4px 0' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--accent-primary)',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                  }}
                />
                <span>Recordar mi usuario</span>
              </label>
            </div>

            <Button
              type="submit"
              variant={isLogin ? 'primary' : 'success'}
              loading={loading}
              style={{ marginTop: '8px', padding: '15px' }}
            >
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Button>
          </form>

          {/* Toggle Link */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>
              {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            </span>
            <button
              onClick={() => {
                setErrorMsg('');
                setIsLogin(!isLogin);
              }}
              style={{
                background: 'none', border: 'none',
                color: 'var(--accent-primary)', fontWeight: 600,
                cursor: 'pointer', fontSize: 'inherit', padding: 0
              }}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
