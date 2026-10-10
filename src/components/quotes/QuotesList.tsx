import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Printer, 
  Edit2, 
  Euro, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  Sparkles,
  Users,
  Trash2,
  FileDown,
  Download,
  Eye,
  AlertTriangle,
  X
} from 'lucide-react';
import { SchoolQuote } from '../../types';
import { formatCurrency, formatDateShort } from '../../utils/dateHelpers';
import { exportQuoteToWord } from '../../utils/exportQuoteDocx';
import { exportQuoteToPdf } from '../../utils/exportQuotePdf';

interface QuotesListProps {
  quotes: SchoolQuote[];
  activeYearId: string;
  onNewQuote: () => void;
  onEditQuote: (quote: SchoolQuote) => void;
  onPrintQuote: (quote: SchoolQuote) => void;
  onDeleteQuote: (quoteId: string) => void;
}

export const QuotesList: React.FC<QuotesListProps> = ({
  quotes,
  activeYearId,
  onNewQuote,
  onEditQuote,
  onPrintQuote,
  onDeleteQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quoteToDelete, setQuoteToDelete] = useState<SchoolQuote | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const yearQuotes = useMemo(() => {
    return quotes
      .filter((q) => q.academicYearId === activeYearId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [quotes, activeYearId]);

  const filteredQuotes = useMemo(() => {
    return yearQuotes.filter((q) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        q.schoolName.toLowerCase().includes(query) ||
        q.projectTitle.toLowerCase().includes(query) ||
        q.quoteNumber.toLowerCase().includes(query) ||
        q.contactPerson.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [yearQuotes, searchTerm, statusFilter]);

  const totalQuotesValue = yearQuotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
  const approvedCount = yearQuotes.filter((q) => q.status === 'approvato').length;

  const handleExportWord = async (q: SchoolQuote) => {
    setExportingId(q.id);
    try {
      await exportQuoteToWord(q);
    } catch (err) {
      console.error('Errore esportazione Word:', err);
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadPdf = (q: SchoolQuote) => {
    try {
      exportQuoteToPdf(q);
    } catch (err) {
      console.error('Errore download PDF:', err);
    }
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      onDeleteQuote(quoteToDelete.id);
      setQuoteToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Preventivi Laboratori Scuole
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {yearQuotes.length} preventivi
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Crea preventivi per scuole, personalizza opzioni e costo della lezione aperta, esporta in Word (.docx) o stampa.
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuovo Preventivo Scuola
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Valore Totale Proposte
          </span>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {formatCurrency(totalQuotesValue)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            A.S. {activeYearId} ({yearQuotes.length} progetti formulati)
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Progetti Approvati
          </span>
          <p className="text-2xl font-black text-emerald-600 tabular-nums">
            {approvedCount} scuole
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Laboratori confermati dai collegi docenti
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-linear-to-r from-teal-50 to-blue-50 border border-teal-200 shadow-2xs">
          <span className="text-xs font-bold text-teal-950 block mb-1">
            Funzionalità Avanzate
          </span>
          <p className="text-sm font-black text-slate-900 flex items-center gap-1.5">
            <FileDown className="w-4 h-4 text-blue-600" />
            Esportazione Word (.docx)
          </p>
          <span className="text-[11px] text-slate-600 mt-0.5 block">
            Modificabile in ogni parte + costo lezione aperta opzionale
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per scuola, progetto, referente, numero..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-rose-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tutti gli Stati' },
              { id: 'bozza', label: 'Bozze' },
              { id: 'inviato', label: 'Inviati' },
              { id: 'approvato', label: 'Approvati' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Quotes */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nessun preventivo trovato</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Non ci sono preventivi per laboratori scolastici registrati per l anno {activeYearId}.
          </p>
          <button
            onClick={onNewQuote}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crea Primo Preventivo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredQuotes.map((q) => {
            const hasOpenLessonCost = Boolean(
              q.hasOpenLessons &&
              q.includeOpenLessonCost &&
              q.openLessonsCost &&
              q.openLessonsCost > 0
            );

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {q.quoteNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            q.status === 'approvato'
                              ? 'bg-emerald-100 text-emerald-800'
                              : q.status === 'inviato'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {q.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          · {formatDateShort(q.date)}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {q.schoolName}
                      </h3>
                      <p className="text-xs font-semibold text-rose-600">
                        {q.projectTitle}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block">Totale</span>
                      <span className="text-lg font-black text-slate-900 tabular-nums">
                        {formatCurrency(q.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Recipient */}
                  <p className="text-xs text-slate-500 mb-3">
                    Alla C.A. di <strong>{q.contactPerson}</strong>
                    {q.schoolAddress && ` · ${q.schoolAddress}`}
                  </p>

                    {/* Items breakdown summary */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Composizione Percorso:
                        </span>
                        {q.openLessonsScope === 'per_item' ? (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            Lezioni aperte per fascia
                          </span>
                        ) : q.openLessonsScope === 'global' ? (
                          <span className="text-[10px] font-semibold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-full">
                            Lezione aperta unica
                          </span>
                        ) : null}
                      </div>

                      {q.items.map((item) => {
                        const itemHasOpen = Boolean(item.hasOpenLesson);
                        const itemOpenCost = itemHasOpen && item.includeOpenLessonCost ? (Number(item.openLessonCost) || 0) : 0;

                        return (
                          <div key={item.id} className="text-xs text-slate-700 bg-white/70 p-2 rounded-lg border border-slate-200/50 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900 truncate pr-2">
                                • {item.ageGroup}
                              </span>
                              <span className="font-bold text-slate-900 tabular-nums shrink-0">
                                € {item.total}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>{item.numLessons} lezioni a € {item.pricePerLesson}</span>
                              {itemHasOpen && (
                                <span className={`inline-flex items-center gap-1 font-semibold ${itemOpenCost > 0 ? 'text-rose-600' : 'text-amber-800'}`}>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Lez. aperta {itemOpenCost > 0 ? `(+ € ${itemOpenCost})` : '(inclusa)'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Open lessons summary pill */}
                      {q.openLessonsScope === 'global' && q.hasOpenLessons && (
                        <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lezione aperta unica per tutti:
                          </span>
                          <span className={`font-bold ${hasOpenLessonCost ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {hasOpenLessonCost
                              ? `+ € ${Number(q.openLessonsCost).toFixed(2)} (nel totale)`
                              : 'Inclusa nel pacchetto (€ 0)'}
                          </span>
                        </div>
                      )}

                      {q.openLessonsScope === 'per_item' && (
                        <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-amber-950 font-medium">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lezioni aperte fasce d'età:
                          </span>
                          <span className="font-bold text-amber-900">
                            {q.items.filter((i) => i.hasOpenLesson).length} di {q.items.length} fasce
                            {q.items.some((i) => i.hasOpenLesson && i.includeOpenLessonCost && i.openLessonCost) && (
                              <span className="text-rose-600 ml-1">
                                (+ € {q.items.reduce((acc, it) => acc + (it.hasOpenLesson && it.includeOpenLessonCost ? (Number(it.openLessonCost) || 0) : 0), 0).toFixed(2)})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                {/* Footer actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    Valido {q.validityDays || 60} gg
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Direct PDF Download button */}
                    <button
                      onClick={() => handleDownloadPdf(q)}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      title="Scarica direttamente il file PDF ufficiale del preventivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    {/* Word (.docx) export button */}
                    <button
                      onClick={() => handleExportWord(q)}
                      disabled={exportingId === q.id}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-blue-200/60"
                      title="Esporta preventivo in formato Microsoft Word (.docx) per modificarlo liberamente"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>{exportingId === q.id ? '...' : 'Word'}</span>
                    </button>

                    {/* Preview button */}
                    <button
                      onClick={() => onPrintQuote(q)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Visualizza anteprima documento ufficiale"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditQuote(q)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Modifica Preventivo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setQuoteToDelete(q)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Elimina Preventivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Elimina Preventivo Scuola
                </h3>
                <p className="text-xs text-slate-500">
                  Questa azione non può essere annullata.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800">
                Numero: <span className="font-mono text-rose-600">{quoteToDelete.quoteNumber}</span>
              </p>
              <p className="text-slate-700">
                Scuola: <strong>{quoteToDelete.schoolName}</strong>
              </p>
              <p className="text-slate-500">
                Progetto: {quoteToDelete.projectTitle} · Totale: {formatCurrency(quoteToDelete.totalAmount)}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Sei sicuro di voler cancellare questo preventivo dall'elenco? Tutti i dati e le voci associate verranno rimossi definitivamente.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Elimina Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
