import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const controls = useAnimation();

  const PULL_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].pageY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].pageY;
    const distance = currentY - startY.current;

    if (distance > 0) {
      // Resistance effect
      const resistance = 0.4;
      const dampedDistance = Math.min(distance * resistance, PULL_THRESHOLD + 20);
      setPullDistance(dampedDistance);
      
      if (dampedDistance > 10) {
        if (e.cancelable) e.preventDefault();
      }
    } else {
      setPullDistance(0);
      isPulling.current = false;
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <motion.div
        animate={{ 
          y: pullDistance,
          transition: { type: 'spring', damping: 20, stiffness: 300 } 
        }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        {children}
      </motion.div>

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: PULL_THRESHOLD,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
        zIndex: 1
      }}>
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : { rotate: (pullDistance / PULL_THRESHOLD) * 180 }}
          transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
        >
          <RefreshCw 
            size={24} 
            color={pullDistance >= PULL_THRESHOLD ? 'var(--accent-primary)' : 'var(--text-tertiary)'} 
          />
        </motion.div>
      </div>
    </div>
  );
}
