import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import { supabase } from './lib/supabase';
import { Package, PlusCircle, History, RefreshCw, Bell } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { useToast } from './lib/ToastContext';

function App() {
  const toast = useToast();
  const controls = useAnimation();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'new', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
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

    return () => { supabase.removeChannel(subscription); };
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
      await fetchOrders();
      setRefreshing(false);
      toast.info('Datos actualizados');
    }
  };

  return (
    <div className="app-container" style={{ overflow: 'hidden' }}>
      {!selectedOrder && <Header />}
      
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
            onClick={() => setActiveTab('dashboard')}
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Package size={24} />
            <span>Pedidos</span>
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
          >
            <PlusCircle size={28} style={{ color: activeTab === 'new' ? '#8b5cf6' : 'var(--text-tertiary)' }} />
            <span>Crear</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <History size={24} />
            <span>Historial</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
