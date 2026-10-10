import React from 'react';
import { User, Music, Calendar, CreditCard, Building2 } from 'lucide-react';
import { NavTab } from './Navbar';

interface MobileNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'students', label: 'Allievi', icon: User },
    { id: 'courses', label: 'Corsi', icon: Music },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'payments', label: 'Ricevute', icon: CreditCard },
    { id: 'quotes', label: 'Preventivi', icon: Building2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 bottom-nav no-print shadow-lg">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors min-h-[48px] ${
                isActive
                  ? 'text-rose-600 font-bold bg-rose-50/70'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-rose-600' : 'text-slate-500'}`} />
              <span className="text-[10px] leading-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
