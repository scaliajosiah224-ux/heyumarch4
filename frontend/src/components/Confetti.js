import React, { useEffect, useState, useCallback } from 'react';

const Confetti = ({ trigger, duration = 3000, onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [isActive, setIsActive] = useState(false);

  const colors = [
    '#D946EF', // Fuchsia
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#FBBF24', // Amber
    '#3B82F6', // Blue
  ];

  const shapes = ['circle', 'square', 'triangle', 'star'];

  const createParticle = useCallback((index) => {
    const particleColors = [
      '#D946EF', '#8B5CF6', '#06B6D4', '#F97316',
      '#EC4899', '#10B981', '#FBBF24', '#3B82F6',
    ];
    const particleShapes = ['circle', 'square', 'triangle', 'star'];
    
    const color = particleColors[Math.floor(Math.random() * particleColors.length)];
    const shape = particleShapes[Math.floor(Math.random() * particleShapes.length)];
    const size = Math.random() * 12 + 6;
    const startX = Math.random() * 100;
    const startY = -10;
    const endX = startX + (Math.random() - 0.5) * 40;
    const endY = 110 + Math.random() * 20;
    const rotation = Math.random() * 720 - 360;
    const delay = Math.random() * 500;
    const animDuration = 2000 + Math.random() * 1500;

    return {
      id: `${Date.now()}-${index}`,
      color,
      shape,
      size,
      startX,
      startY,
      endX,
      endY,
      rotation,
      delay,
      animDuration,
    };
  }, []);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      const newParticles = Array.from({ length: 80 }, (_, i) => createParticle(i));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setIsActive(false);
        setParticles([]);
        if (onComplete) onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, isActive, duration, createParticle, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            animation: `confetti-fall ${particle.animDuration}ms ease-out ${particle.delay}ms forwards`,
            '--end-x': `${particle.endX - particle.startX}vw`,
            '--end-y': `${particle.endY}vh`,
            '--rotation': `${particle.rotation}deg`,
          }}
        >
          {particle.shape === 'circle' && (
            <div
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
              }}
            />
          )}
          {particle.shape === 'square' && (
            <div
              className="rounded-sm"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
              }}
            />
          )}
          {particle.shape === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${particle.size / 2}px solid transparent`,
                borderRight: `${particle.size / 2}px solid transparent`,
                borderBottom: `${particle.size}px solid ${particle.color}`,
                filter: `drop-shadow(0 0 ${particle.size / 3}px ${particle.color})`,
              }}
            />
          )}
          {particle.shape === 'star' && (
            <div
              style={{
                fontSize: particle.size,
                color: particle.color,
                textShadow: `0 0 ${particle.size / 2}px ${particle.color}`,
              }}
            >
              ★
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateY(var(--end-y)) translateX(var(--end-x)) rotate(var(--rotation)) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Hook to manage confetti state
export const useConfetti = () => {
  const [showConfetti, setShowConfetti] = useState(false);

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
  }, []);

  const resetConfetti = useCallback(() => {
    setShowConfetti(false);
  }, []);

  return {
    showConfetti,
    triggerConfetti,
    resetConfetti,
    ConfettiComponent: () => (
      <Confetti trigger={showConfetti} onComplete={resetConfetti} />
    ),
  };
};

export default Confetti;
