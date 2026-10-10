import React, { useState } from 'react';
import { X, Calendar, Plus, Check, History, Sparkles } from 'lucide-react';
import { AcademicYear } from '../../types';

interface YearManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  years: AcademicYear[];
  activeYearId: string;
  onSelectActiveYear: (yearId: string) => void;
  onAddYear: (newYear: AcademicYear) => void;
}

export const YearManagerModal: React.FC<YearManagerModalProps> = ({
  isOpen,
  onClose,
  years,
  activeYearId,
  onSelectActiveYear,
  onAddYear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [startYear, setStartYear] = useState(2027);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const endYear = startYear + 1;
    const yearId = `${startYear}-${endYear}`;
    const label = `${startYear} / ${endYear}`;

    // Check if exists
    if (years.some((y) => y.id === yearId)) {
      setErrorMessage('Questo anno accademico è già presente.');
      return;
    }

    const newYear: AcademicYear = {
      id: yearId,
      label,
      startDate: `${startYear}-09-01`,
      endDate: `${endYear}-06-30`,
      isCurrent: false,
      notes: notes.trim() || undefined,
    };

    onAddYear(newYear);
    setShowAddForm(false);
    onSelectActiveYear(yearId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gestione Anni Scolastici & Storico
              </h3>
              <p className="text-xs text-slate-500">
                Visualizza lo storico degli anni passati o crea un nuovo anno accademico.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* List of existing years */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Seleziona Anno Accademico di Lavoro
            </span>
            {years.map((y) => {
              const isSelected = y.id === activeYearId;
              return (
                <div
                  key={y.id}
                  onClick={() => onSelectActiveYear(y.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-bold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-3" /> : '•'}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        Anno Accademico {y.label}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {y.startDate} → {y.endDate} {y.notes ? `· ${y.notes}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {y.isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Anno Corrente
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-xs font-bold text-rose-600">
                        Attivo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* New year form trigger or drawer */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 border border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/50 rounded-xl text-xs font-bold text-rose-600 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <Plus className="w-4 h-4" />
              Crea Nuovo Anno Scolastico
            </button>
          ) : (
            <form onSubmit={handleCreateYear} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950">
                  Nuovo Anno Scolastico
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Annulla
                </button>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Anno di Inizio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  />
                  <span className="text-xs text-slate-600 font-semibold">
                    → Diventerà A.S. {startYear} / {startYear + 1}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Note descrittive
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Nuovo anno con apertura corso coro giovani"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Conferma e Crea Anno {startYear} / {startYear + 1}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Anno selezionato: <strong>{activeYearId}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fatto
          </button>
        </div>
      </div>
    </div>
  );
};
