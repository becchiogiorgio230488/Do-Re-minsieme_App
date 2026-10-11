import React from 'react';
import { X, UserPlus, CreditCard, Repeat, Music, Building2, CalendarPlus, Pin } from 'lucide-react';

interface QuickNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: 'student' | 'payment' | 'recurring' | 'singleLesson' | 'genericEvent' | 'course' | 'quote') => void;
}

export const QuickNewModal: React.FC<QuickNewModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      id: 'student' as const,
      title: 'Nuova Anagrafica Allievo',
      desc: 'Inserisci dati personali, modulo di iscrizione firmato e assegna i corsi.',
      icon: UserPlus,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
    {
      id: 'payment' as const,
      title: 'Registra Pagamento & Stampa Ricevuta',
      desc: 'Emetti ricevuta numerata progressiva da rilasciare al genitore.',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      id: 'genericEvent' as const,
      title: 'Nuovo Appuntamento / Evento Generico',
      desc: 'Riunione docenti, saggio scuola, impegno personale o scadenza.',
      icon: Pin,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'singleLesson' as const,
      title: 'Nuova Lezione Singola nel Calendario',
      desc: 'Aggiungi un singolo appuntamento o recupero per una data specifica.',
      icon: CalendarPlus,
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
    {
      id: 'recurring' as const,
      title: 'Pianifica Lezione Ricorrente',
      desc: 'Es. allievo tutti i martedì dalle 14:00 alle 15:00 da data a data.',
      icon: Repeat,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      id: 'course' as const,
      title: 'Nuovo Corso o Gruppo',
      desc: 'Crea corso di canto singolo, coppia, coro o musica-gioco.',
      icon: Music,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      id: 'quote' as const,
      title: 'Nuovo Preventivo Laboratorio Scuola',
      desc: 'Formula preventivo per scuole materne/primarie (es. Musica in Movimento).',
      icon: Building2,
      color: 'bg-teal-50 text-teal-600 border-teal-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cosa desideri inserire?
            </h3>
            <p className="text-xs text-slate-500">
              Scegli l operazione rapida da compiere
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[75vh] overflow-y-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => {
                  onSelectAction(act.id);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition-colors flex flex-col justify-between group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 border ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};
