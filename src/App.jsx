import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import Dashboard from './components/Dashboard';
import ReturnForm from './components/ReturnForm';
import ReturnList from './components/ReturnList';
import Analytics from './components/Analytics';
import SideDrawer from './components/SideDrawer';
import { supabase } from './lib/supabase';
import { Package, PlusCircle, History, RefreshCw, RotateCcw, BarChart3, LayoutDashboard } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useToast } from './lib/ToastContext';

function App() {
  const toast = useToast();
  const controls = useAnimation();
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen', 'dashboard', 'new', 'returns', 'analytics', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { 
        body,
        icon: '/pwa-192x192.png'
      });
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
      
      // Update selected order reference if it exists
      if (selectedOrder) {
        const updated = data.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    try {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      setReturns([]);
    }
  };

  const fetchAll = async () => {
    await Promise.all([fetchOrders(), fetchReturns()]);
  };

  useEffect(() => {
    fetchAll();

    // Orders realtime subscription
    const ordersSubscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders();
        
        // Trigger notifications
        if (payload.eventType === 'INSERT') {
          sendNotification('Nuevo Pedido', `Se ha creado un pedido para ${payload.new.client_name}`);
        } else if (payload.eventType === 'UPDATE') {
          if (payload.new.status === 'DELIVERED' && payload.old.status !== 'DELIVERED') {
            sendNotification('Pedido Entregado', `El pedido de ${payload.new.client_name} ha sido entregado`);
          }
        }
      })
      .subscribe();

    // Returns realtime subscription
    const returnsSubscription = supabase
      .channel('returns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'returns' }, (payload) => {
        fetchReturns();
        if (payload.eventType === 'INSERT') {
          sendNotification('Nueva Devolución', `Devolución registrada de ${payload.new.client_name}`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(returnsSubscription);
    };
  }, []);

  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').sort((a, b) => {
    const dateA = new Date(a.delivery_date || a.created_at);
    const dateB = new Date(b.delivery_date || b.created_at);
    return dateB - dateA;
  });

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing && selectedOrder) {
      return (
        <OrderForm 
          initialData={selectedOrder}
          onOrderCreated={() => {
            fetchOrders();
            setIsEditing(false);
          }} 
        />
      );
    }

    if (selectedOrder) {
      return (
        <OrderDetail 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)}
          onStatusUpdate={() => {
            fetchOrders();
          }}
        />
      );
    }

    switch (activeTab) {
      case 'resumen':
        return (
          <div className="view-container">
            <Dashboard orders={orders} returns={returns} />
          </div>
        );
      case 'dashboard':
        return (
          <OrderList 
            orders={pendingOrders} 
            title="Pedidos Activos" 
            onOrderClick={handleOrderClick} 
            loading={loading} 
          />
        );
      case 'new':
        return (
          <OrderForm onOrderCreated={() => {
            fetchOrders();
            setActiveTab('dashboard');
          }} />
        );
      case 'returns':
        if (showReturnForm) {
          return (
            <ReturnForm onReturnCreated={() => {
              fetchReturns();
              setShowReturnForm(false);
            }} />
          );
        }
        return (
          <div>
            <ReturnList returns={returns} loading={loading} />
            <div style={{ padding: '0 20px 20px' }}>
              <button
                className="btn-submit"
                onClick={() => setShowReturnForm(true)}
                style={{ background: '#f59e0b' }}
              >
                <RotateCcw size={20} /> Nueva Devolución
              </button>
            </div>
          </div>
        );
      case 'analytics':
        return <Analytics orders={orders} returns={returns} />;
      case 'history':
        return (
          <OrderList 
            orders={deliveredOrders} 
            title="Historial" 
            onOrderClick={handleOrderClick} 
            loading={loading} 
          />
        );
      default:
        return null;
    }
  };

  const handlePullToRefresh = async (event, info) => {
    if (info.offset.y > 80 && !refreshing) {
      setRefreshing(true);
      await fetchAll();
      setRefreshing(false);
      toast.info('Datos actualizados');
    }
  };

  // Reset return form view when switching tabs
  useEffect(() => {
    if (activeTab !== 'returns') {
      setShowReturnForm(false);
    }
  }, [activeTab]);

  return (
    <div className="app-container" style={{ overflow: 'hidden' }}>
      {!selectedOrder && <Header onMenuClick={() => setIsDrawerOpen(true)} />}
      
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onNavigate={setActiveTab}
        activeTab={activeTab}
      />
      
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDragEnd={handlePullToRefresh}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        {refreshing && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 60, opacity: 1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', gap: '10px' }}
          >
            <RefreshCw size={20} className="spin" />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Actualizando...</span>
          </motion.div>
        )}
        
        <main style={{ flex: 1, paddingBottom: '100px', overflowY: 'auto' }}>
          {renderContent()}
        </main>
      </motion.div>

      {!selectedOrder && (
        <nav className="bottom-nav">
          <button 
            onClick={() => setActiveTab('resumen')}
            className={`nav-btn ${activeTab === 'resumen' ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Resumen</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Package size={20} />
            <span>Pedidos</span>
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
          >
            <PlusCircle size={22} style={{ color: activeTab === 'new' ? '#8b5cf6' : 'var(--text-tertiary)' }} />
            <span>Crear</span>
          </button>
          <button 
            onClick={() => setActiveTab('returns')}
            className={`nav-btn ${activeTab === 'returns' ? 'active' : ''}`}
          >
            <RotateCcw size={20} style={{ color: activeTab === 'returns' ? '#f59e0b' : 'var(--text-tertiary)' }} />
            <span>Devolver</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
