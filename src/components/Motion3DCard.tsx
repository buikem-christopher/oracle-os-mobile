import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Motion3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const Motion3DCard: React.FC<Motion3DCardProps> = ({ 
  children, className = '', intensity = 1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotateX(-y * 4 * intensity);
    setRotateY(x * 4 * intensity);
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.5 }}
      style={{ transformStyle: 'preserve-3d', perspective: 800, willChange: 'transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
