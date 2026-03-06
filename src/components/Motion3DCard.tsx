import React, { useRef, useState, useCallback } from 'react';

interface Motion3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const Motion3DCard: React.FC<Motion3DCardProps> = ({ 
  children, className = '', intensity = 1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-y * 4 * intensity).toFixed(2);
    const ry = (x * 4 * intensity).toFixed(2);
    setTransform(`perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`);
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)');
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform, 
        transformStyle: 'preserve-3d', 
        willChange: 'transform',
        transition: 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)',
      }}
      className={className}
    >
      {children}
    </div>
  );
};
