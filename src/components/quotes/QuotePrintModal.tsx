import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Building2, 
  CheckCircle, 
  FileText, 
  Music, 
  Sparkles, 
  FileDown, 
  Users,
  Check
} from 'lucide-react';
import { SchoolQuote } from '../../types';
import { formatDateLong, formatCurrency } from '../../utils/dateHelpers';
import { exportQuoteToWord } from '../../utils/exportQuoteDocx';
import { exportQuoteToPdf } from '../../utils/exportQuotePdf';

interface QuotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: SchoolQuote | null;
}

export const QuotePrintModal: React.FC<QuotePrintModalProps> = ({
  isOpen,
  onClose,
  quote,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen || !quote) return null;

  const handleDownloadPdf = () => {
    try {
      exportQuoteToPdf(quote);
      setDownloadSuccess('PDF scaricato con successo!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Errore durante il download del PDF:', err);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Stampa del browser non disponibile, avvio download PDF', err);
      handleDownloadPdf();
    }
  };

  const handleExportWord = async () => {
    try {
      await exportQuoteToWord(quote);
      setDownloadSuccess('Documento Word scaricato!');
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Errore durante l\'esportazione in Word:', err);
    }
  };

  const isPerItem = quote.openLessonsScope === 'per_item' || quote.items.some((it) => it.hasOpenLesson);
  const isGlobal = quote.openLessonsScope === 'global' || (!quote.openLessonsScope && quote.hasOpenLessons && !isPerItem);

  const globalHasCost = Boolean(
    isGlobal &&
    quote.hasOpenLessons &&
    quote.includeOpenLessonCost &&
    quote.openLessonsCost &&
    quote.openLessonsCost > 0
  );

  const perItemTotalOpenCost = isPerItem
    ? quote.items.reduce((acc, it) => {
        if (it.hasOpenLesson && it.includeOpenLessonCost && it.openLessonCost) {
          return acc + (Number(it.openLessonCost) || 0);
        }
        return acc;
      }, 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col">
        {/* Actions header (hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 gap-3 no-print">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Preventivo #{quote.quoteNumber}
              </h3>
              {downloadSuccess && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" />
                  {downloadSuccess}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Scarica direttamente il file PDF ufficiale o il documento Word (.docx) modificabile.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              title="Scarica direttamente il file PDF ufficiale del preventivo"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Scarica PDF
            </button>

            {/* Word (.docx) Export Button */}
            <button
              onClick={handleExportWord}
              title="Scarica documento Word (.docx) modificabile in ogni sua parte"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              Word (.docx)
            </button>

            {/* Secondary Browser Print Button */}
            <button
              onClick={handlePrint}
              title="Stampa tramite stampante o driver del browser"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors border border-slate-200"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Container */}
        <div className="p-8 sm:p-12 bg-white overflow-y-auto print-page space-y-6 text-slate-800 text-xs">
          
          {/* Official Letterhead */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b-2 border-rose-500 pb-5">
            <div>
              <h1 className="text-2xl font-black text-rose-600 tracking-tight leading-tight">
                DO-RE-MINSIEME
              </h1>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                Scuola di Canto e Propedeutica Musicale
              </p>
              <p className="text-[11px] text-slate-500 font-medium italic mt-0.5">
                Laboratori e Corsi Didattico-Musicali nelle Scuole
              </p>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Preventivo Ufficiale
              </div>
              <div className="text-base font-black text-slate-900 font-mono">
                {quote.quoteNumber}
              </div>
              <div className="text-xs text-slate-500">
                Data: {formatDateLong(quote.date)}
              </div>
            </div>
          </div>

          {/* Recipient block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Destinatario
              </span>
              <p className="font-bold text-sm text-slate-900">{quote.schoolName}</p>
              {quote.schoolAddress && (
                <p className="text-slate-600 mt-0.5">{quote.schoolAddress}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Alla C.A. di
              </span>
              <p className="font-semibold text-slate-800">{quote.contactPerson || 'Dirigente Scolastico / Coordinatrice'}</p>
              {quote.contactEmail && <p className="text-slate-500">{quote.contactEmail}</p>}
              {quote.contactPhone && <p className="text-slate-500">{quote.contactPhone}</p>}
            </div>
          </div>

          {/* Project Title & Overview */}
          <div className="space-y-2">
            <div className="bg-rose-50 border-l-4 border-rose-600 p-3 rounded-r-xl">
              <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">
                Oggetto della Proposta
              </span>
              <h2 className="text-base font-black text-slate-900 mt-0.5">
                {quote.projectTitle}
              </h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {quote.description}
            </p>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs flex justify-between">
              <span>Fascia d Età / Articolazione Percorso</span>
              <div className="flex items-center gap-6 pr-2">
                <span>N° Lezioni</span>
                <span>Tariffa / Lez.</span>
                <span>Subtotale</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 bg-white">
              {quote.items.map((item) => {
                const itemHasOpen = Boolean(item.hasOpenLesson);
                const itemOpenCost = itemHasOpen && item.includeOpenLessonCost ? (Number(item.openLessonCost) || 0) : 0;

                return (
                  <div key={item.id} className="p-3.5 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-bold text-slate-900">{item.ageGroup}</p>
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-8 justify-end text-xs font-semibold tabular-nums shrink-0">
                        <span className="w-16 text-center">{item.numLessons} lezioni</span>
                        <span className="w-16 text-right">€ {item.pricePerLesson.toFixed(2)}</span>
                        <span className="w-20 text-right font-black text-rose-600">
                          € {item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Per-item open lesson line if per_item */}
                    {isPerItem && itemHasOpen && (
                      <div className="pl-3 border-l-2 border-amber-400 bg-amber-50/50 p-2 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-amber-950">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Lezione Aperta con le famiglie:</strong> {item.openLessonDetails || 'Incontro finale di condivisione'}
                          </span>
                        </div>
                        <span className="font-bold tabular-nums shrink-0 text-amber-900">
                          {itemOpenCost > 0 ? `+ € ${itemOpenCost.toFixed(2)}` : 'Inclusa nel monte ore (€ 0)'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Lessons section if GLOBAL */}
          {isGlobal && quote.hasOpenLessons && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Opzione "Lezione Aperta Unica con le Famiglie" (per tutti i gruppi)
                </span>
                <span className="font-black text-amber-950 text-xs tabular-nums">
                  {globalHasCost ? `+ € ${Number(quote.openLessonsCost).toFixed(2)}` : 'Inclusa nel progetto (senza costi extra)'}
                </span>
              </div>
              <p className="text-[11px] text-amber-900">
                {quote.openLessonsDetails || '1 lezione aperta finale di condivisione per ciascun gruppo alla presenza dei genitori.'}
              </p>
            </div>
          )}

          {/* Open Lessons section if PER_ITEM (Summary recap) */}
          {isPerItem && quote.items.some((it) => it.hasOpenLesson) && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                  <Users className="w-4 h-4 text-amber-600" />
                  Riepilogo Lezioni Aperte con le Famiglie per Fascia d'Età
                </span>
                <span className="font-black text-amber-950 text-xs tabular-nums">
                  {perItemTotalOpenCost > 0 ? `+ € ${perItemTotalOpenCost.toFixed(2)} (totale quote aperte)` : 'Tutte incluse nel progetto'}
                </span>
              </div>
              <p className="text-[11px] text-amber-900">
                Previste lezioni aperte dedicate per {quote.items.filter((it) => it.hasOpenLesson).length} sezioni/fasce d'età con la partecipazione delle famiglie.
              </p>
            </div>
          )}

          {/* Materials & Details */}
          {quote.materialsIncluded && (
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <strong className="text-slate-800">Materiali e Strumentario:</strong> {quote.materialsIncluded}
            </div>
          )}

          {/* Grand Total Box */}
          <div className="flex items-center justify-between p-4 bg-linear-to-r from-teal-50 to-rose-50 border-2 border-rose-300 rounded-xl">
            <div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Totale Complessivo Preventivo
              </span>
              <span className="text-[11px] text-slate-500">
                {isPerItem && perItemTotalOpenCost > 0
                  ? `Include tariffa lezioni percorsi + lezioni aperte per fasce (+ € ${perItemTotalOpenCost.toFixed(2)})`
                  : globalHasCost
                  ? `Include tariffa lezioni + lezione aperta unica (+ € ${Number(quote.openLessonsCost).toFixed(2)})`
                  : quote.hasOpenLessons
                  ? 'Include tariffa lezioni con lezioni aperte incluse gratuitamente'
                  : 'Validità offerta'}{' '}
                · Validità: {quote.validityDays || 60} giorni dalla data di emissione
              </span>
            </div>
            <div className="text-2xl font-black text-rose-600 tabular-nums">
              {formatCurrency(quote.totalAmount)}
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 items-end text-center">
            <div>
              <div className="h-14 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                <span className="text-xs font-serif italic text-slate-600">
                  Do-Re-MInsieme
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Il Responsabile Didattico
              </span>
            </div>

            <div>
              <div className="h-14 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Per Accettazione (Timbro e Firma Scuola)
              </span>
            </div>
          </div>

        </div>

        {/* Footer (no-print) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Documento pronto per il download diretto in PDF o Word (.docx)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Chiudi
            </button>
            <button
              onClick={handleExportWord}
              className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              Scarica Word (.docx)
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              Scarica PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
