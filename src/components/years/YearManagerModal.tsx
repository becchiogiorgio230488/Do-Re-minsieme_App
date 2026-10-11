import React, { useState } from 'react';
import { X, Calendar, Plus, Check, Trash2, AlertTriangle, Star } from 'lucide-react';
import { AcademicYear } from '../../types';

interface YearManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  years: AcademicYear[];
  activeYearId: string;
  onSelectActiveYear: (yearId: string) => void;
  onAddYear: (newYear: AcademicYear) => void;
  onDeleteYear?: (yearId: string) => Promise<void> | void;
  onSetCurrentYear?: (yearId: string) => Promise<void> | void;
}

export const YearManagerModal: React.FC<YearManagerModalProps> = ({
  isOpen,
  onClose,
  years,
  activeYearId,
  onSelectActiveYear,
  onAddYear,
  onDeleteYear,
  onSetCurrentYear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [startYear, setStartYear] = useState(2027);
  const [isNewYearCurrent, setIsNewYearCurrent] = useState(false);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      isCurrent: isNewYearCurrent,
      notes: notes.trim() || undefined,
    };

    onAddYear(newYear);
    setShowAddForm(false);
    onSelectActiveYear(yearId);
    setNotes('');
    setIsNewYearCurrent(false);
  };

  const handleConfirmDelete = async () => {
    if (!yearToDelete || !onDeleteYear) return;
    setIsDeleting(true);
    try {
      await onDeleteYear(yearToDelete.id);
      setYearToDelete(null);
    } catch (err) {
      console.error('Error deleting academic year:', err);
    } finally {
      setIsDeleting(false);
    }
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
                Visualizza lo storico, cambia anno attivo, imposta l anno corrente o elimina anni creati per errore.
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
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Anni Accademici Configurati ({years.length})
            </span>
            {years.map((y) => {
              const isSelected = y.id === activeYearId;
              const canDelete = years.length > 1;

              return (
                <div
                  key={y.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    {/* Clickable info area to select year */}
                    <div 
                      onClick={() => onSelectActiveYear(y.id)}
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-3" /> : '•'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-slate-900">
                            A.S. {y.label}
                          </p>
                          {y.isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Anno Corrente
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              Attivo Ora
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {y.startDate} → {y.endDate} {y.notes ? `· ${y.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Set as current button if not already current */}
                      {!y.isCurrent && onSetCurrentYear && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetCurrentYear(y.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-transparent hover:border-amber-200"
                          title="Imposta questo anno come Anno Scolastico Corrente principale"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[11px] hidden sm:inline">Rendi Corrente</span>
                        </button>
                      )}

                      {/* Delete button */}
                      {onDeleteYear && (
                        <button
                          type="button"
                          disabled={!canDelete}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!canDelete) return;
                            setYearToDelete(y);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            !canDelete 
                              ? 'text-slate-300 cursor-not-allowed' 
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={!canDelete ? "Impossibile eliminare l'unico anno presente" : `Elimina anno ${y.label}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New year form trigger or drawer */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 border border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50/50 rounded-xl text-xs font-bold text-rose-600 transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
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

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isCurrentCheckbox"
                  checked={isNewYearCurrent}
                  onChange={(e) => setIsNewYearCurrent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <label htmlFor="isCurrentCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Imposta subito come Anno Scolastico Corrente
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Note descrittive (opzionale)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Es. Anno accademico ordinario"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Conferma e Crea Anno {startYear} / {startYear + 1}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Anno in uso: <strong>{activeYearId}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {yearToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">
                Eliminare l A.S. {yearToDelete.label}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Questa operazione rimuoverà l anno scolastico sia da questo dispositivo sia dal database <strong>Supabase Cloud</strong>.
              </p>
              {yearToDelete.id === activeYearId && (
                <p className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                  L anno attualmente attivo verrà automaticamente impostato su un altro anno disponibile.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setYearToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Eliminazione...' : 'Elimina Definitivamente'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
