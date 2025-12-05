'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'liquid' | 'liquid-premium';
  className?: string;
  strength?: number;
  onClick?: () => void;
}

export function MagneticCard({
  children,
  variant = 'default',
  className = '',
  strength = 15,
  onClick
}: MagneticCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) / (rect.width / 2);
    const distanceY = (e.clientY - centerY) / (rect.height / 2);
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };
  
  const baseStyles = 'rounded-3xl transition-all duration-300';
  const variantStyles = {
    default: 'bg-white/70 dark:bg-gray-800/40 backdrop-blur-xl border border-gray-200 dark:border-gray-700/30',
    elevated: 'bg-white/80 dark:bg-gray-800/50 backdrop-blur-2xl border border-gray-200 dark:border-gray-700/40 shadow-xl',
    subtle: 'bg-white/60 dark:bg-gray-800/30 backdrop-blur-lg border border-gray-200 dark:border-gray-700/20',
    liquid: 'liquid-glass border border-gray-200 dark:border-gray-700/30 shadow-[0px_6px_21px_-8px_rgba(0,0,0,0.1)]',
    'liquid-premium': 'liquid-glass liquid-glass-premium border border-gray-300 dark:border-gray-700/40 shadow-[0px_8px_32px_-8px_rgba(0,0,0,0.15)]'
  };
  
  return (
    <motion.div
      ref={ref}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={variant.includes('liquid') ? 'liquid-glass-content' : ''}>
        {children}
      </div>
    </motion.div>
  );
}

