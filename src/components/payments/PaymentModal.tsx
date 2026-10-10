import React, { useState, useEffect } from 'react';
import { X, CreditCard, Euro, Calendar, User, FileText, Check, Printer, Trash2, AlertTriangle, Hash } from 'lucide-react';
import { Payment, Student, Course, PaymentMethod } from '../../types';
import { getNextReceiptNumber, formatReceiptCode } from '../../utils/storage';
import { getTodayString } from '../../utils/dateHelpers';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getNextReceiptNumberFromSupabase } from '../../services/supabaseDb';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment, printImmediately?: boolean) => void;
  onDelete?: (paymentId: string) => void;
  payments: Payment[];
  students: Student[];
  courses: Course[];
  activeYearId: string;
  preselectedStudent?: Student | null;
  initialPayment?: Payment | null;
}

const CAUSALE_PRESETS = [
  'Quota iscrizione annuale all anno accademico',
  'Quota mensile Canto Singolo Pop',
  'Quota mensile Coro Voci Bianche',
  'Quota trimestrale Musica-Gioco per Piccoli',
  'Pacchetto 4 lezioni individuali di canto',
  'Pacchetto 10 lezioni canto singolo',
  'Quota mensile Canto di Coppia',
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  payments,
  students,
  courses,
  activeYearId,
  preselectedStudent,
  initialPayment,
}) => {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amountStr, setAmountStr] = useState('90');
  const [date, setDate] = useState(getTodayString());
  const [method, setMethod] = useState<PaymentMethod>('contanti');
  const [description, setDescription] = useState('Quota mensile canto singolo');
  const [payerName, setPayerName] = useState('');
  const [payerFiscalCode, setPayerFiscalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptNumber, setReceiptNumber] = useState<number>(1);
  const [receiptCode, setReceiptCode] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Setup form values
  useEffect(() => {
    setShowDeleteConfirm(false);
    if (initialPayment) {
      setStudentId(initialPayment.studentId);
      setCourseId(initialPayment.courseId || '');
      setAmountStr(String(initialPayment.amount).replace('.', ','));
      setDate(initialPayment.date);
      setMethod(initialPayment.method);
      setDescription(initialPayment.description);
      setPayerName(initialPayment.payerName);
      setPayerFiscalCode(initialPayment.payerFiscalCode || '');
      setNotes(initialPayment.notes || '');
      setReceiptNumber(initialPayment.receiptNumber);
      setReceiptCode(initialPayment.receiptCode);
    } else {
      if (isSupabaseConfigured()) {
        getNextReceiptNumberFromSupabase(activeYearId).then((res) => {
          setReceiptNumber(res.receiptNumber);
          setReceiptCode(res.receiptCode);
        });
      } else {
        const nextNum = getNextReceiptNumber(payments, activeYearId);
        setReceiptNumber(nextNum);
        setReceiptCode(formatReceiptCode(nextNum, activeYearId));
      }
      setDate(getTodayString());
      setMethod('contanti');
      setNotes('');

      if (preselectedStudent) {
        setStudentId(preselectedStudent.id);
        const nameToUse = preselectedStudent.isMinor && preselectedStudent.parentName
          ? preselectedStudent.parentName
          : `${preselectedStudent.firstName} ${preselectedStudent.lastName}`;
        setPayerName(nameToUse);
        setPayerFiscalCode(
          preselectedStudent.isMinor ? preselectedStudent.parentFiscalCode || '' : preselectedStudent.fiscalCode || ''
        );
        if (preselectedStudent.courseIds?.length) {
          const c = courses.find((crs) => crs.id === preselectedStudent.courseIds[0]);
          if (c) {
            setCourseId(c.id);
            const defaultRate = c.defaultMonthlyRate ?? c.defaultHourlyRate ?? 90;
            setAmountStr(String(defaultRate).replace('.', ','));
            setDescription(`Quota mensile ${c.name}`);
          }
        }
      } else {
        setStudentId('');
        setPayerName('');
        setPayerFiscalCode('');
        setCourseId('');
        setAmountStr('90');
        setDescription('Quota mensile canto');
      }
    }
  }, [initialPayment, preselectedStudent, isOpen, activeYearId, payments, courses]);

  if (!isOpen) return null;

  const handleStudentChange = (sId: string) => {
    setStudentId(sId);
    const sel = students.find((s) => s.id === sId);
    if (sel) {
      const nameToUse = sel.isMinor && sel.parentName ? sel.parentName : `${sel.firstName} ${sel.lastName}`;
      setPayerName(nameToUse);
      setPayerFiscalCode(sel.isMinor ? sel.parentFiscalCode || '' : sel.fiscalCode || '');

      if (sel.courseIds?.length) {
        const c = courses.find((crs) => crs.id === sel.courseIds[0]);
        if (c) {
          setCourseId(c.id);
          const defaultRate = c.defaultMonthlyRate ?? c.defaultHourlyRate ?? 90;
          setAmountStr(String(defaultRate).replace('.', ','));
          setDescription(`Quota mensile ${c.name}`);
        }
      }
    }
  };

  const handleCourseChange = (cId: string) => {
    setCourseId(cId);
    const c = courses.find((crs) => crs.id === cId);
    if (c) {
      const defaultRate = c.defaultMonthlyRate ?? c.defaultHourlyRate;
      if (defaultRate !== undefined) setAmountStr(String(defaultRate).replace('.', ','));
      setDescription(`Quota mensile ${c.name}`);
    }
  };

  const handleSubmit = (printImmediately = false) => {
    const parsedAmount = parseFloat(amountStr.trim().replace(',', '.'));
    if (!payerName.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !description.trim()) return;

    const num = Number(receiptNumber) || 1;
    const paymentToSave: Payment = {
      id: initialPayment?.id || `pay-${Date.now()}`,
      academicYearId: initialPayment?.academicYearId || activeYearId,
      receiptNumber: num,
      receiptCode: receiptCode.trim() || formatReceiptCode(num, initialPayment?.academicYearId || activeYearId),
      studentId,
      courseId: courseId || undefined,
      amount: parsedAmount,
      date,
      method,
      description: description.trim(),
      payerName: payerName.trim(),
      payerFiscalCode: payerFiscalCode.trim().toUpperCase() || undefined,
      notes: notes.trim() || undefined,
      issuedBy: 'Do-Re-MInsieme',
      createdAt: initialPayment?.createdAt || new Date().toISOString(),
    };

    onSave(paymentToSave, printImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
        {/* Header with progressive number highlight */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-amber-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {initialPayment ? 'Modifica Pagamento' : 'Registra Pagamento'}
                </h3>
                <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  N° {receiptCode}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Numero progressivo certificato per l A.S. {activeYearId}.
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

        {/* Form Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
        >
          {/* Progressive Receipt Details (Editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
            <div>
              <label className="block text-[11px] font-bold text-amber-950 mb-1">
                N° Progressivo Ricevuta
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-amber-600 absolute left-2.5 top-2" />
                <input
                  type="number"
                  min="1"
                  required
                  value={receiptNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setReceiptNumber(val);
                    setReceiptCode(formatReceiptCode(val, initialPayment?.academicYearId || activeYearId));
                  }}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-amber-300 text-xs font-black text-amber-950 focus:outline-rose-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-950 mb-1">
                Codice Ricevuta
              </label>
              <input
                type="text"
                required
                value={receiptCode}
                onChange={(e) => setReceiptCode(e.target.value)}
                placeholder="Es. 001/2026-27"
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-mono font-bold text-amber-950 focus:outline-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Student selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Allievo <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                required
                value={studentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              >
                <option value="">Seleziona Allievo...</option>
                {students
                  .filter((s) => s.academicYearId === activeYearId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} {s.isMinor && s.parentName ? `(Genitore: ${s.parentName})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Payer name & CF */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Intestatario Ricevuta <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Genitore o Allievo"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                C.F. Intestatario (opzionale)
              </label>
              <input
                type="text"
                value={payerFiscalCode}
                onChange={(e) => setPayerFiscalCode(e.target.value)}
                placeholder="Codice Fiscale"
                maxLength={16}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Importo Versato (€) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Euro className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="Es. 90 o 85,50"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm font-black text-rose-600 focus:outline-rose-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Accetta qualsiasi cifra anche con virgola (es. 25,50 €).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data del Pagamento <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          {/* Payment Method - Only Contanti & Satispay */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Metodo di Pagamento Ricevuto <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod('contanti')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  method === 'contanti'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                Contanti
              </button>

              <button
                type="button"
                onClick={() => setMethod('satispay')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                  method === 'satispay'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                Satispay
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Metodi abilitati per ricevuta diretta: <strong>Contanti</strong> o <strong>Satispay</strong>.
            </p>
          </div>

          {/* Causale & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Causale / Descrizione <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Es. Quota mensile Canto Singolo - Ottobre"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 mb-2"
            />

            <div className="flex flex-wrap gap-1">
              {CAUSALE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDescription(preset)}
                  className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note (Opzionali)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Note interne o dettagli sulla ricevuta"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {initialPayment && onDelete ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Elimina Ricevuta</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Annulla
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end">
              {initialPayment && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Annulla
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Salva e Stampa Subito</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {initialPayment ? 'Salva Modifiche' : 'Salva Pagamento'}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal (In-App) */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-rose-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="text-base font-black text-slate-900">
                  Elimina Ricevuta N° {receiptCode}?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Questa operazione eliminerà definitivamente il pagamento di <strong className="text-rose-600">{amountStr} €</strong> intestato a <strong>{payerName || 'questo contatto'}</strong>.
                </p>
                <p className="text-[11px] text-rose-600 mt-2 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200/60">
                  L&apos;importo verrà sottratto dal totale incassato per l&apos;anno scolastico.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (initialPayment && onDelete) {
                      onDelete(initialPayment.id);
                    }
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  Sì, Elimina
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
