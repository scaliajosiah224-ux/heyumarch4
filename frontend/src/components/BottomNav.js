import React from 'react';
import { MessageSquare, Phone, Voicemail, Grid3X3, Settings } from 'lucide-react';

const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'dialer', icon: Grid3X3, label: 'Dialer' },
    { id: 'calls', icon: Phone, label: 'Calls' },
    { id: 'voicemail', icon: Voicemail, label: 'Voicemail' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav px-4 py-3 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            data-testid={`nav-${item.id}`}
            onClick={() => onTabChange(item.id)}
            className={`bottom-nav-item flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              activeTab === item.id ? 'active' : 'text-white/50'
            }`}
          >
            <item.icon 
              className={`nav-icon w-6 h-6 transition-all ${
                activeTab === item.id ? 'text-fuchsia-400' : ''
              }`} 
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
