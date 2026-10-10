import React from 'react';
import { X, Printer, Download, CheckCircle, Music } from 'lucide-react';
import { Payment, Student, Course } from '../../types';
import { formatDateLong, formatDateShort, formatCurrency } from '../../utils/dateHelpers';
import { LogoDoReMInsieme } from '../Logo';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  student?: Student | null;
  course?: Course | null;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  payment,
  student,
  course,
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col">
        {/* Action Header (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Ricevuta di Pagamento #{payment.receiptCode}
            </h3>
            <p className="text-xs text-slate-500">
              Anteprima di stampa ufficiale da rilasciare al genitore/allievo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Stampa / Salva in PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 sm:p-10 bg-white overflow-y-auto print-page">
          <div className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 relative bg-white">
            
            {/* Top School Branding Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b-2 border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <LogoDoReMInsieme size="md" />
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight">
                    DO-RE-MINSIEME
                  </h1>
                  <p className="text-xs font-semibold text-rose-600">
                    Scuola di Canto e Propedeutica Musicale
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Corsi individuali, cori e laboratori per bambini
                  </p>
                </div>
              </div>

              {/* Receipt Code Box */}
              <div className="text-right sm:text-right border border-slate-300 bg-slate-50 px-4 py-2.5 rounded-xl">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Ricevuta di Pagamento
                </div>
                <div className="text-lg font-black text-slate-900 tabular-nums">
                  N° {payment.receiptCode}
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Data: {formatDateLong(payment.date)}
                </div>
              </div>
            </div>

            {/* Recipient Details & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2">
              {/* Payer details */}
              <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Intestatario / Versante
                </span>
                <p className="text-sm font-black text-slate-900">
                  {payment.payerName}
                </p>
                {payment.payerFiscalCode && (
                  <p className="text-xs font-mono font-medium text-slate-700">
                    C.F.: {payment.payerFiscalCode}
                  </p>
                )}
                {student && (
                  <p className="text-xs text-slate-600">
                    Per l allievo: <strong>{student.firstName} {student.lastName}</strong>
                  </p>
                )}
              </div>

              {/* Payment Method & Year */}
              <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Dettagli Pagamento
                </span>
                <p className="text-xs text-slate-700">
                  Modalità di versamento: <strong className="uppercase font-bold text-slate-900">{payment.method}</strong>
                </p>
                <p className="text-xs text-slate-700">
                  Anno Accademico: <strong className="text-slate-900">{payment.academicYearId}</strong>
                </p>
                {course && (
                  <p className="text-xs text-slate-700">
                    Corso di riferimento: <strong>{course.name}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Description & Causale */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between text-xs font-bold text-slate-700">
                <span>Descrizione / Causale</span>
                <span>Importo</span>
              </div>
              <div className="p-4 flex items-center justify-between bg-white">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {payment.description}
                  </p>
                  {payment.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic">
                      Note: {payment.notes}
                    </p>
                  )}
                </div>
                <div className="text-xl font-black text-slate-900 tabular-nums">
                  {formatCurrency(payment.amount)}
                </div>
              </div>
            </div>

            {/* Grand Total Bar */}
            <div className="flex items-center justify-between p-4 bg-linear-to-r from-rose-50 to-amber-50 rounded-xl border-2 border-rose-300">
              <div>
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wider block">
                  Totale Ricevuto
                </span>
                <span className="text-[11px] text-slate-600">
                  Pagamento regolarmente registrato ed incassato
                </span>
              </div>
              <span className="text-2xl font-black text-rose-600 tabular-nums">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            {/* Signatures & Legal Disclaimer */}
            <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-6">
              <div className="text-[10px] text-slate-400 max-w-xs space-y-0.5">
                <p>Do-Re-MInsieme · Scuola di Canto e Propedeutica</p>
                <p>Operazione non soggetta ad IVA ai sensi dell art. 10 DPR 633/72 o attività associativa/didattica.</p>
              </div>

              <div className="text-center min-w-48">
                <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                  <span className="text-xs font-serif italic text-slate-600 font-semibold">
                    Do-Re-MInsieme
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Timbro e Firma per Quietanza
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions (no-print) */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            Foglietto di ricevuta pronto per essere consegnato al genitore
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Chiudi
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Stampa Ricevuta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
