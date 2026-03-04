import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Confetti from './Confetti';

const AchievementContext = createContext(null);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

export const AchievementProvider = ({ children }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [achievements, setAchievements] = useState(() => {
    const stored = localStorage.getItem('gummytext_achievements');
    return stored ? JSON.parse(stored) : {
      firstMessage: false,
      firstCall: false,
      firstVoicemail: false,
      tenMessages: false,
      firstContact: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('gummytext_achievements', JSON.stringify(achievements));
  }, [achievements]);

  const triggerAchievement = useCallback((type) => {
    if (!achievements[type]) {
      setAchievements(prev => ({ ...prev, [type]: true }));
      setShowConfetti(true);
      
      // Play a celebration sound (optional)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6YkH5wYmRxgI2cnJOGdWVlb36MmpmQgnFgYW2AjpqZkIBvXmBugI+bmZB/bl1fb4GQm5mPfmxcXm+BkZyZjnxqW11vgZKcmY17aVpdcIKTnJmMemhaXXCDk5yZjHlnWVxxg5ScmYt4ZlhccYSVnJmKd2RXWXGF');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }, [achievements]);

  const resetConfetti = useCallback(() => {
    setShowConfetti(false);
  }, []);

  const checkMessageCount = useCallback((count) => {
    if (count >= 1 && !achievements.firstMessage) {
      triggerAchievement('firstMessage');
    }
    if (count >= 10 && !achievements.tenMessages) {
      triggerAchievement('tenMessages');
    }
  }, [achievements, triggerAchievement]);

  return (
    <AchievementContext.Provider value={{
      achievements,
      triggerAchievement,
      checkMessageCount,
    }}>
      {children}
      <Confetti trigger={showConfetti} onComplete={resetConfetti} duration={4000} />
    </AchievementContext.Provider>
  );
};

export default AchievementProvider;
