import React from 'react';
import { Calendar, Database, Plus, ChevronDown, Sparkles, Cloud } from 'lucide-react';
import { LogoDoReMInsieme } from './Logo';
import { AcademicYear } from '../types';

export type NavTab = 'students' | 'courses' | 'calendar' | 'payments' | 'quotes';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeYear: AcademicYear | undefined;
  onOpenYearManager: () => void;
  onOpenBackup: () => void;
  onOpenSupabase: () => void;
  isCloudConnected: boolean;
  onQuickNew: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeYear,
  onOpenYearManager,
  onOpenBackup,
  onOpenSupabase,
  isCloudConnected,
  onQuickNew,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          
          {/* Zone 1: Single brand mark element */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => onTabChange('students')}>
            <LogoDoReMInsieme size="sm" showText={true} />
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-semibold text-slate-600">
            <button
              onClick={() => onTabChange('students')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentTab === 'students'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Allievi
            </button>

            <button
              onClick={() => onTabChange('courses')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentTab === 'courses'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Corsi & Gruppi
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentTab === 'calendar'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Calendario Lezioni
            </button>

            <button
              onClick={() => onTabChange('payments')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentTab === 'payments'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Pagamenti & Ricevute
            </button>

            <button
              onClick={() => onTabChange('quotes')}
              className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                currentTab === 'quotes'
                  ? 'border-rose-600 text-rose-600 font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Preventivi Scuole
            </button>
          </nav>

          {/* Zone 3: Academic Year context & Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Academic Year Switcher button */}
            <button
              onClick={onOpenYearManager}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition-colors whitespace-nowrap shrink-0 border border-slate-200"
              title="Cambia o gestisci anno accademico"
            >
              <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>A.S. {activeYear?.label || '2026 / 2027'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Supabase Cloud Database button */}
            <button
              onClick={onOpenSupabase}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border shadow-2xs ${
                isCloudConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400'
              }`}
              title={isCloudConnected ? "Supabase Cloud attivo e sincronizzato" : "Configura Supabase Database Cloud"}
            >
              <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-600' : 'text-amber-600'} shrink-0`} />
              <span className="hidden sm:inline">{isCloudConnected ? 'Cloud Attivo' : 'Supabase'}</span>
              <span className="sm:hidden">{isCloudConnected ? 'Cloud' : 'DB'}</span>
            </button>

            {/* Backup & Data button */}
            <button
              onClick={onOpenBackup}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Backup e gestione dati JSON"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onQuickNew}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-3" />
              <span className="hidden sm:inline">Nuovo Inserimento</span>
              <span className="sm:hidden">Nuovo</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
