import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Printer, 
  Euro, 
  Wallet, 
  Smartphone, 
  Calendar, 
  User, 
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Payment, Student, Course } from '../../types';
import { formatCurrency, formatDateShort, ITALIAN_MONTHS } from '../../utils/dateHelpers';

interface PaymentsListProps {
  payments: Payment[];
  students: Student[];
  courses: Course[];
  activeYearId: string;
  onNewPayment: () => void;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (paymentId: string) => void;
  onPrintReceipt: (payment: Payment) => void;
  onSelectStudent: (student: Student) => void;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({
  payments,
  students,
  courses,
  activeYearId,
  onNewPayment,
  onEditPayment,
  onDeletePayment,
  onPrintReceipt,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'contanti' | 'satispay'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // 'all' or 'YYYY-MM'
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState<boolean>(true);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Filter payments for active year
  const yearPayments = useMemo(() => {
    return payments
      .filter((p) => p.academicYearId === activeYearId)
      .sort((a, b) => b.receiptNumber - a.receiptNumber);
  }, [payments, activeYearId]);

  // Aggregate monthly statistics
  const monthlyStats = useMemo(() => {
    const map = new Map<string, {
      monthKey: string; // 'YYYY-MM'
      monthName: string; // 'Ottobre 2026'
      year: number;
      monthIndex: number;
      total: number;
      cash: number;
      satispay: number;
      count: number;
    }>();

    yearPayments.forEach((p) => {
      const monthKey = p.date ? p.date.slice(0, 7) : 'Altro';
      if (!map.has(monthKey)) {
        let monthName = monthKey;
        let year = 0;
        let monthIndex = 0;
        if (monthKey.includes('-')) {
          const [y, m] = monthKey.split('-').map(Number);
          year = y;
          monthIndex = m;
          const name = ITALIAN_MONTHS[m - 1] || monthKey;
          monthName = `${name} ${y}`;
        }
        map.set(monthKey, {
          monthKey,
          monthName,
          year,
          monthIndex,
          total: 0,
          cash: 0,
          satispay: 0,
          count: 0,
        });
      }

      const entry = map.get(monthKey)!;
      const amt = p.amount || 0;
      entry.total += amt;
      entry.count += 1;
      if (p.method === 'satispay') {
        entry.satispay += amt;
      } else {
        entry.cash += amt;
      }
    });

    // Sort months chronologically or descending
    return Array.from(map.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [yearPayments]);

  const filteredPayments = useMemo(() => {
    return yearPayments.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        p.receiptCode.toLowerCase().includes(q) ||
        p.payerName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.payerFiscalCode && p.payerFiscalCode.toLowerCase().includes(q));

      const matchesMethod = methodFilter === 'all' || p.method === methodFilter;
      const matchesMonth = selectedMonth === 'all' || p.date.startsWith(selectedMonth);

      return matchesSearch && matchesMethod && matchesMonth;
    });
  }, [yearPayments, searchTerm, methodFilter, selectedMonth]);

  // Aggregate statistics for active year
  const totalAmount = yearPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const cashAmount = yearPayments.filter((p) => p.method === 'contanti').reduce((acc, p) => acc + (p.amount || 0), 0);
  const satispayAmount = yearPayments.filter((p) => p.method === 'satispay').reduce((acc, p) => acc + (p.amount || 0), 0);

  // Month-filtered totals if a specific month is selected
  const activeSelectionTotal = filteredPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Pagamenti & Ricevute
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {yearPayments.length} ricevute
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ricevute numerate emesse in Contanti o Satispay, con monitoraggio degli incassi mensili e totali.
          </p>
        </div>

        <button
          onClick={onNewPayment}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Registra Ricevuta
        </button>
      </div>

      {/* KPI Summary Cards - Exclusively Contanti & Satispay + Totale */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Year Income */}
        <div className="p-4 rounded-2xl bg-linear-to-br from-rose-50 to-amber-50/70 border border-rose-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
              Totale Incassato Anno
            </span>
            <Euro className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600 tabular-nums">
            {formatCurrency(totalAmount)}
          </p>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-rose-200/60 text-[11px] text-slate-600">
            <span>A.S. {activeYearId}</span>
            <span className="font-semibold text-rose-700">{yearPayments.length} ricevute emesse</span>
          </div>
        </div>

        {/* Contanti */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Contanti
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {formatCurrency(cashAmount)}
          </p>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Ricevuta cartacea manuale</span>
            <span className="font-semibold text-emerald-700">
              {yearPayments.filter((p) => p.method === 'contanti').length} incassi
            </span>
          </div>
        </div>

        {/* Satispay */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Satispay
            </span>
            <Smartphone className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">
            {formatCurrency(satispayAmount)}
          </p>
          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Pagamento digitale Satispay</span>
            <span className="font-semibold text-rose-700">
              {yearPayments.filter((p) => p.method === 'satispay').length} incassi
            </span>
          </div>
        </div>
      </div>

      {/* MONTHLY REVENUE SECTION - Incassi Mensili */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-slate-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Incassi Mensili A.S. {activeYearId}
                <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {monthlyStats.length} {monthlyStats.length === 1 ? 'mese registrato' : 'mesi registrati'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Riepilogo entrate suddivise mese per mese tra Contanti e Satispay.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span>{showMonthlyBreakdown ? 'Nascondi Dettaglio' : 'Mostra Dettaglio Mesi'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMonthlyBreakdown ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showMonthlyBreakdown && (
          <div className="p-4 space-y-3">
            {monthlyStats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Nessun incasso registrato al momento per questo anno accademico.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {monthlyStats.map((m) => {
                  const isSelected = selectedMonth === m.monthKey;
                  const percentOfTotal = totalAmount > 0 ? Math.round((m.total / totalAmount) * 100) : 0;

                  return (
                    <div
                      key={m.monthKey}
                      onClick={() => {
                        setSelectedMonth(isSelected ? 'all' : m.monthKey);
                      }}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left relative ${
                        isSelected
                          ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-300 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900 capitalize flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          {m.monthName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {percentOfTotal}%
                        </span>
                      </div>

                      <div className="text-lg font-black text-rose-600 tabular-nums">
                        {formatCurrency(m.total)}
                      </div>

                      {/* Breakdown between contanti and satispay */}
                      <div className="mt-2 pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Contanti:
                          </span>
                          <span className="font-semibold text-slate-800">{formatCurrency(m.cash)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Satispay:
                          </span>
                          <span className="font-semibold text-slate-800">{formatCurrency(m.satispay)}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{m.count} {m.count === 1 ? 'ricevuta' : 'ricevute'}</span>
                        <span className={`font-semibold ${isSelected ? 'text-rose-600' : 'text-slate-500'}`}>
                          {isSelected ? '✓ Filtro attivo' : 'Clicca per filtrare'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per n° ricevuta (es. 001), genitore, allievo, causale..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-rose-500 bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month Filter Selector */}
            {monthlyStats.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">Mese:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 focus:outline-rose-500"
                >
                  <option value="all">Tutti i Mesi ({yearPayments.length})</option>
                  {monthlyStats.map((m) => (
                    <option key={m.monthKey} value={m.monthKey}>
                      {m.monthName} ({m.count} ric. - {formatCurrency(m.total)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Method Filter - Exclusively Contanti & Satispay */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'Tutti' },
                { id: 'contanti', label: 'Contanti' },
                { id: 'satispay', label: 'Satispay' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMethodFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    methodFilter === tab.id
                      ? 'bg-rose-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(selectedMonth !== 'all' || methodFilter !== 'all' || searchTerm.trim()) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Filtri attivi:</span>
              {selectedMonth !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                  Mese: {monthlyStats.find((m) => m.monthKey === selectedMonth)?.monthName || selectedMonth}
                  <button onClick={() => setSelectedMonth('all')} className="hover:text-rose-900">×</button>
                </span>
              )}
              {methodFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200 uppercase">
                  Metodo: {methodFilter}
                  <button onClick={() => setMethodFilter('all')} className="hover:text-slate-900">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
                  Ricerca: &ldquo;{searchTerm}&rdquo;
                  <button onClick={() => setSearchTerm('')} className="hover:text-amber-900">×</button>
                </span>
              )}
            </div>
            <div className="text-right font-bold text-slate-800">
              Totale filtrato: <span className="text-rose-600 font-black">{formatCurrency(activeSelectionTotal)}</span> ({filteredPayments.length} ricevute)
            </div>
          </div>
        )}
      </div>

      {/* Table of Payments */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nessun pagamento trovato</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Non risultano pagamenti registrati per l anno scolastico {activeYearId} corrispondenti ai filtri attuali.
            </p>
            <button
              onClick={onNewPayment}
              className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Registra Ricevuta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">N° Ricevuta</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Intestatario / Genitore</th>
                  <th className="py-3.5 px-4">Allievo</th>
                  <th className="py-3.5 px-4">Causale</th>
                  <th className="py-3.5 px-4">Metodo</th>
                  <th className="py-3.5 px-4 text-right">Importo</th>
                  <th className="py-3.5 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const student = students.find((s) => s.id === p.studentId);
                  const course = courses.find((c) => c.id === p.courseId);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Progressive code */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          {p.receiptCode}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDateShort(p.date)}
                      </td>

                      {/* Payer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.payerName}</div>
                        {p.payerFiscalCode && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {p.payerFiscalCode}
                          </div>
                        )}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        {student ? (
                          <button
                            onClick={() => onSelectStudent(student)}
                            className="font-medium text-rose-600 hover:underline"
                          >
                            {student.firstName} {student.lastName}
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Causale */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate font-medium text-slate-800" title={p.description}>
                          {p.description}
                        </div>
                        {course && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {course.name}
                          </div>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.method === 'satispay' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Satispay
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Contanti
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-rose-600 text-sm tabular-nums">
                        {formatCurrency(p.amount)}
                      </td>

                      {/* Actions: Edit, Print, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditPayment(p)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                            title="Modifica questo pagamento"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Modifica</span>
                          </button>

                          <button
                            onClick={() => onPrintReceipt(p)}
                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            title="Stampa ricevuta da consegnare al genitore"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Stampa</span>
                          </button>

                          <button
                            onClick={() => setPaymentToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                            title="Elimina pagamento / ricevuta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Payment Confirmation Modal (In-App) */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-slate-900">
                Elimina Ricevuta {paymentToDelete.receiptCode}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Confermi di voler eliminare definitivamente questa ricevuta?
              </p>
            </div>

            {/* Receipt Details Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">N° Progressivo:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {paymentToDelete.receiptCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intestatario:</span>
                <span className="font-bold text-slate-900">{paymentToDelete.payerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data Ricevuta:</span>
                <span className="font-medium text-slate-800">{formatDateShort(paymentToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metodo:</span>
                <span className="uppercase text-[11px] font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                  {paymentToDelete.method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Importo:</span>
                <span className="font-black text-rose-600 text-sm">{formatCurrency(paymentToDelete.amount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Causale:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]" title={paymentToDelete.description}>
                  {paymentToDelete.description}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200/60 font-medium text-center">
              L&apos;importo verrà detratto dal totale incassato per l&apos;A.S. {activeYearId}. Questa operazione non può essere annullata.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeletePayment(paymentToDelete.id);
                  setPaymentToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Sì, Elimina Ricevuta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
