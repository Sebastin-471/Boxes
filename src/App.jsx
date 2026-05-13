import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// Layout & Context
import Header from './components/layout/Header';
import SideDrawer from './components/layout/SideDrawer';
import BottomNav from './components/layout/BottomNav';
import { ToastProvider } from './context/ToastContext';

// Pages
import Resumen from './pages/Resumen';
import Pedidos from './pages/Pedidos';
import Crear from './pages/Crear';
import Devolver from './pages/Devolver';
import Analisis from './pages/Analisis';
import Historial from './pages/Historial';

// Feature Components
import OrderDetail from './features/orders/OrderDetail';
import OrderForm from './features/orders/OrderForm';

// Hooks
import { useOrders } from './features/orders/useOrders';
import { useReturns } from './features/returns/useReturns';

function AppContent() {
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { orders, loading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { returns, loading: returnsLoading, refetch: refetchReturns } = useReturns();
  const toast = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.info('Conexión restaurada');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sin conexión a internet');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    setSelectedOrder(null);
    setEditingOrder(null);
  };

  const handleOrderCreated = () => {
    refetchOrders();
    setActiveTab('dashboard');
  };

  const handleReturnCreated = () => {
    refetchReturns();
    setActiveTab('resumen');
  };

  const renderContent = () => {
    if (selectedOrder) {
      return (
        <OrderDetail 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)} 
          onStatusUpdate={refetchOrders}
          onEdit={(order) => {
            setEditingOrder(order);
            setSelectedOrder(null);
          }}
        />
      );
    }

    if (editingOrder) {
      return (
        <OrderForm 
          initialData={editingOrder} 
          onOrderCreated={() => {
            setEditingOrder(null);
            refetchOrders();
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'resumen':
        return <Resumen key="resumen" orders={orders} returns={returns} onOrderClick={setSelectedOrder} loading={ordersLoading} onTabNavigate={handleNavigate} />;
      case 'dashboard':
        return <Pedidos key="pedidos" orders={orders} onOrderClick={setSelectedOrder} loading={ordersLoading} refetch={refetchOrders} />;
      case 'new':
        return <Crear key="crear" onOrderCreated={handleOrderCreated} />;
      case 'returns':
        return <Devolver key="devolver" onReturnCreated={handleReturnCreated} />;
      case 'analytics':
        return <Analisis key="analytics" orders={orders} returns={returns} />;
      case 'history':
        return <Historial key="history" orders={orders} onOrderClick={setSelectedOrder} loading={ordersLoading} refetch={refetchOrders} />;
      default:
        return <Resumen key="resumen-def" orders={orders} returns={returns} onOrderClick={setSelectedOrder} loading={ordersLoading} />;
    }
  };

  return (
    <div className="app-container">
      <Header onMenuClick={() => setIsDrawerOpen(true)} />
      
      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onNavigate={handleNavigate}
        activeTab={activeTab}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {!selectedOrder && !editingOrder && (
        <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
