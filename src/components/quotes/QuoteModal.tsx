import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Plus, 
  Trash2, 
  Euro, 
  Calendar, 
  Sparkles, 
  CheckSquare, 
  FileText, 
  Check,
  FileDown,
  Download,
  AlertTriangle,
  Users,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SchoolQuote, SchoolQuoteItem } from '../../types';
import { getTodayString } from '../../utils/dateHelpers';
import { exportQuoteToWord } from '../../utils/exportQuoteDocx';
import { exportQuoteToPdf } from '../../utils/exportQuotePdf';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: SchoolQuote) => void;
  onDelete?: (quoteId: string) => void;
  initialQuote?: SchoolQuote | null;
  activeYearId: string;
  quotesCount: number;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialQuote,
  activeYearId,
  quotesCount,
}) => {
  const [quoteNumber, setQuoteNumber] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [projectTitle, setProjectTitle] = useState('Laboratorio "Musica in Movimento"');
  const [description, setDescription] = useState(
    'Percorso didattico musicale esperienziale per la scuola dell infanzia, mirato allo sviluppo dell orecchio, del senso ritmico, dell espressività vocale e della coordinazione corporea attraverso filastrocche e lo strumentario didattico Orff.'
  );

  // Items per age group
  const [items, setItems] = useState<SchoolQuoteItem[]>([
    {
      id: 'item-1',
      ageGroup: 'Bambini di 3 anni (Sezione Piccoli)',
      numLessons: 10,
      pricePerLesson: 25,
      total: 250,
      notes: 'Incontri da 45 min cad. con giochi motorio-musicali ed esplorazione sonora.',
      hasOpenLesson: true,
      openLessonDetails: '1 lezione aperta conclusiva con le famiglie della sezione 3 anni.',
      includeOpenLessonCost: false,
      openLessonCost: 0,
    },
    {
      id: 'item-2',
      ageGroup: 'Bambini di 4 anni (Sezione Medi)',
      numLessons: 10,
      pricePerLesson: 25,
      total: 250,
      notes: 'Incontri da 45-50 min cad. con percussioni Orff e canti mimati.',
      hasOpenLesson: true,
      openLessonDetails: '1 lezione aperta conclusiva con le famiglie della sezione 4 anni.',
      includeOpenLessonCost: false,
      openLessonCost: 0,
    },
    {
      id: 'item-3',
      ageGroup: 'Bambini di 5 anni (Sezione Grandi)',
      numLessons: 10,
      pricePerLesson: 25,
      total: 250,
      notes: 'Incontri da 50 min cad. con poliritmie e canto d insieme.',
      hasOpenLesson: true,
      openLessonDetails: '1 lezione aperta conclusiva con le famiglie della sezione 5 anni.',
      includeOpenLessonCost: false,
      openLessonCost: 0,
    },
  ]);

  // Open lessons mode:
  // 'per_item' = impostata per ogni singola fascia di età
  // 'global' = una che vale per tutti
  // 'none' = nessuna lezione aperta
  const [openLessonsScope, setOpenLessonsScope] = useState<'per_item' | 'global' | 'none'>('per_item');

  // Shared / Global open lesson fields (used when openLessonsScope === 'global')
  const [openLessonsDetails, setOpenLessonsDetails] = useState(
    'È prevista 1 Lezione Aperta conclusiva per ciascun gruppo alla presenza dei genitori, per condividere le attività svolte.'
  );
  const [includeOpenLessonCost, setIncludeOpenLessonCost] = useState(false);
  const [openLessonsCost, setOpenLessonsCost] = useState<number>(0);

  const [materialsIncluded, setMaterialsIncluded] = useState(
    'Tutto lo strumentario didattico (strumentario Orff, percussioni, teli, oggetti sonori) e impianto audio forniti dall insegnante esperta.'
  );
  const [validityDays, setValidityDays] = useState(60);
  const [status, setStatus] = useState<'bozza' | 'inviato' | 'approvato' | 'rifiutato'>('bozza');
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialQuote) {
      setQuoteNumber(initialQuote.quoteNumber);
      setDate(initialQuote.date);
      setSchoolName(initialQuote.schoolName);
      setSchoolAddress(initialQuote.schoolAddress || '');
      setContactPerson(initialQuote.contactPerson);
      setContactPhone(initialQuote.contactPhone || '');
      setContactEmail(initialQuote.contactEmail || '');
      setProjectTitle(initialQuote.projectTitle);
      setDescription(initialQuote.description);

      // Determine openLessonsScope
      let scope: 'per_item' | 'global' | 'none' = 'none';
      if (initialQuote.openLessonsScope) {
        scope = initialQuote.openLessonsScope;
      } else if (initialQuote.items && initialQuote.items.some((it) => it.hasOpenLesson !== undefined)) {
        scope = 'per_item';
      } else if (initialQuote.hasOpenLessons) {
        scope = 'global';
      } else {
        scope = 'none';
      }
      setOpenLessonsScope(scope);

      // Populate items ensuring open lesson fields exist
      setItems(
        initialQuote.items.map((it) => ({
          ...it,
          hasOpenLesson: it.hasOpenLesson ?? (scope === 'per_item'),
          openLessonDetails: it.openLessonDetails ?? '1 lezione aperta finale con le famiglie.',
          includeOpenLessonCost: it.includeOpenLessonCost ?? Boolean(it.openLessonCost && it.openLessonCost > 0),
          openLessonCost: it.openLessonCost ?? 0,
        }))
      );

      // Global open lesson settings
      setOpenLessonsDetails(initialQuote.openLessonsDetails || '1 Lezione Aperta conclusiva alla presenza dei genitori.');
      const hasCost = Boolean(
        initialQuote.includeOpenLessonCost ??
        (initialQuote.openLessonsCost && initialQuote.openLessonsCost > 0)
      );
      setIncludeOpenLessonCost(hasCost);
      setOpenLessonsCost(initialQuote.openLessonsCost || 0);

      setMaterialsIncluded(initialQuote.materialsIncluded || '');
      setValidityDays(initialQuote.validityDays || 60);
      setStatus(initialQuote.status);
      setNotes(initialQuote.notes || '');
      setShowDeleteConfirm(false);
    } else {
      const year = activeYearId.slice(0, 4);
      const nextNum = String(quotesCount + 1).padStart(2, '0');
      setQuoteNumber(`PREV-${year}/${nextNum}`);
      setDate(getTodayString());
      setSchoolName('');
      setSchoolAddress('');
      setContactPerson('');
      setContactPhone('');
      setContactEmail('');
      setProjectTitle('Laboratorio "Musica in Movimento"');
      setDescription(
        'Percorso didattico musicale esperienziale per la scuola dell infanzia, mirato allo sviluppo dell orecchio, del senso ritmico, dell espressività vocale e della coordinazione corporea attraverso filastrocche e lo strumentario didattico Orff.'
      );
      setItems([
        {
          id: `item-${Date.now()}-1`,
          ageGroup: 'Bambini di 3 anni (Sezione Piccoli)',
          numLessons: 10,
          pricePerLesson: 25,
          total: 250,
          notes: 'Incontri da 45 min cad. con giochi motorio-musicali ed esplorazione sonora.',
          hasOpenLesson: true,
          openLessonDetails: '1 lezione aperta con le famiglie a fine percorso.',
          includeOpenLessonCost: false,
          openLessonCost: 0,
        },
        {
          id: `item-${Date.now()}-2`,
          ageGroup: 'Bambini di 4 anni (Sezione Medi)',
          numLessons: 10,
          pricePerLesson: 25,
          total: 250,
          notes: 'Incontri da 45-50 min cad. con percussioni Orff e canti mimati.',
          hasOpenLesson: true,
          openLessonDetails: '1 lezione aperta con le famiglie a fine percorso.',
          includeOpenLessonCost: false,
          openLessonCost: 0,
        },
        {
          id: `item-${Date.now()}-3`,
          ageGroup: 'Bambini di 5 anni (Sezione Grandi)',
          numLessons: 10,
          pricePerLesson: 25,
          total: 250,
          notes: 'Incontri da 50 min cad. con poliritmie e canto d insieme.',
          hasOpenLesson: true,
          openLessonDetails: '1 lezione aperta con le famiglie a fine percorso.',
          includeOpenLessonCost: false,
          openLessonCost: 0,
        },
      ]);
      setOpenLessonsScope('per_item');
      setIncludeOpenLessonCost(false);
      setOpenLessonsCost(0);
      setOpenLessonsDetails(
        'È prevista 1 Lezione Aperta conclusiva per ciascun gruppo alla presenza dei genitori, per condividere le attività svolte.'
      );
      setMaterialsIncluded(
        'Tutto lo strumentario didattico (strumentario Orff, percussioni, teli, oggetti sonori) e impianto audio forniti dall insegnante esperta.'
      );
      setStatus('bozza');
      setNotes('');
      setShowDeleteConfirm(false);
    }
  }, [initialQuote, isOpen, activeYearId, quotesCount]);

  if (!isOpen) return null;

  // Item field handlers
  const handleItemChange = (
    id: string,
    field: keyof SchoolQuoteItem,
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'numLessons' || field === 'pricePerLesson') {
          updated.total = Number(updated.numLessons) * Number(updated.pricePerLesson);
        }
        return updated;
      })
    );
  };

  const handleAddItem = () => {
    const newItem: SchoolQuoteItem = {
      id: `item-${Date.now()}`,
      ageGroup: 'Nuova fascia d età / gruppo',
      numLessons: 10,
      pricePerLesson: 25,
      total: 250,
      notes: '',
      hasOpenLesson: true,
      openLessonDetails: '1 lezione aperta con le famiglie a fine percorso.',
      includeOpenLessonCost: false,
      openLessonCost: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Replicate open lesson settings from one item to all others
  const handleCopyOpenLessonToAll = (sourceItem: SchoolQuoteItem) => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        hasOpenLesson: sourceItem.hasOpenLesson,
        openLessonDetails: sourceItem.openLessonDetails,
        includeOpenLessonCost: sourceItem.includeOpenLessonCost,
        openLessonCost: sourceItem.openLessonCost,
      }))
    );
  };

  // Grand total calculations
  const itemsLessonsTotal = items.reduce((acc, it) => acc + (it.total || 0), 0);

  const perItemOpenLessonsCost =
    openLessonsScope === 'per_item'
      ? items.reduce((acc, it) => {
          if (it.hasOpenLesson && it.includeOpenLessonCost && it.openLessonCost) {
            return acc + Math.max(0, Number(it.openLessonCost) || 0);
          }
          return acc;
        }, 0)
      : 0;

  const globalOpenLessonCost =
    openLessonsScope === 'global' && includeOpenLessonCost && openLessonsCost
      ? Math.max(0, Number(openLessonsCost) || 0)
      : 0;

  const totalAmount = itemsLessonsTotal + perItemOpenLessonsCost + globalOpenLessonCost;

  const hasAnyOpenLessons =
    openLessonsScope === 'per_item'
      ? items.some((it) => it.hasOpenLesson)
      : openLessonsScope === 'global';

  const buildQuoteObject = (): SchoolQuote => ({
    id: initialQuote?.id || `quote-${Date.now()}`,
    academicYearId: initialQuote?.academicYearId || activeYearId,
    quoteNumber: quoteNumber.trim(),
    date,
    schoolName: schoolName.trim(),
    schoolAddress: schoolAddress.trim() || undefined,
    contactPerson: contactPerson.trim(),
    contactPhone: contactPhone.trim() || undefined,
    contactEmail: contactEmail.trim() || undefined,
    projectTitle: projectTitle.trim(),
    description: description.trim(),
    items: items.map((it) => ({
      ...it,
      hasOpenLesson: openLessonsScope === 'per_item' ? Boolean(it.hasOpenLesson) : false,
      openLessonDetails:
        openLessonsScope === 'per_item' && it.hasOpenLesson
          ? (it.openLessonDetails || '').trim()
          : undefined,
      includeOpenLessonCost:
        openLessonsScope === 'per_item' && it.hasOpenLesson
          ? Boolean(it.includeOpenLessonCost)
          : false,
      openLessonCost:
        openLessonsScope === 'per_item' && it.hasOpenLesson && it.includeOpenLessonCost
          ? Number(it.openLessonCost || 0)
          : 0,
    })),
    openLessonsScope,
    hasOpenLessons: hasAnyOpenLessons,
    openLessonsDetails:
      openLessonsScope === 'global' ? openLessonsDetails.trim() : undefined,
    includeOpenLessonCost:
      openLessonsScope === 'global' ? includeOpenLessonCost : false,
    openLessonsCost:
      openLessonsScope === 'global' && includeOpenLessonCost
        ? Number(openLessonsCost || 0)
        : 0,
    materialsIncluded: materialsIncluded.trim() || undefined,
    totalAmount,
    validityDays,
    status,
    notes: notes.trim() || undefined,
    createdAt: initialQuote?.createdAt || new Date().toISOString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !projectTitle.trim()) return;
    const quoteToSave = buildQuoteObject();
    onSave(quoteToSave);
    onClose();
  };

  const handleExportWord = async () => {
    if (!schoolName.trim()) {
      alert('Inserisci il nome della scuola prima di esportare in Word.');
      return;
    }
    const currentQuote = buildQuoteObject();
    await exportQuoteToWord(currentQuote);
  };

  const handleDownloadPdf = () => {
    if (!schoolName.trim()) {
      alert('Inserisci il nome della scuola prima di scaricare il PDF.');
      return;
    }
    const currentQuote = buildQuoteObject();
    exportQuoteToPdf(currentQuote);
  };

  const handleDelete = () => {
    if (initialQuote && onDelete) {
      onDelete(initialQuote.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-teal-50 via-amber-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {initialQuote ? 'Modifica Preventivo Scuola' : 'Crea Preventivo Laboratorio Scuola'}
                </h3>
                <span className="text-xs font-mono font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                  {quoteNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                A.S. {activeYearId} · Lezioni aperte personalizzabili per fascia d età o uniche per tutti · Scarica PDF / Word
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              title="Scarica preventivo direttamente in formato PDF"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scarica</span> PDF
            </button>
            <button
              type="button"
              onClick={handleExportWord}
              title="Esporta preventivo in formato Microsoft Word modificabile"
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Word</span> (.docx)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete confirmation banner if triggered */}
        {showDeleteConfirm && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-900">
                  Confermi la cancellazione definitiva di questo preventivo?
                </p>
                <p className="text-[11px] text-rose-700">
                  {quoteNumber} - {schoolName || 'Senza nome'}. Questa azione non potrà essere annullata.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Sì, Elimina
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Metadata row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numero Preventivo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Emissione <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* School details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Dati della Scuola Destinataria
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nome Scuola / Istituto Comprensivo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Es. Scuola dell'Infanzia San Francesco"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Indirizzo Scuola
                </label>
                <input
                  type="text"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  placeholder="Es. Via Roma 12, Asti"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Alla C.A. di (Referente/Coordinatrice) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Es. Coordinatrice Maria Rossi"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Telefono Referente
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Es. 333 1234567"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email Referente
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Es. infanzia.sanfrancesco@email.it"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titolo del Progetto Didattico <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Es. Laboratorio di Propedeutica 'Musica in Movimento'"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrizione Obiettivi e Metodologia
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-rose-500 leading-relaxed"
              />
            </div>
          </div>

          {/* MODALITÀ LEZIONE APERTA SELECTOR (Richiesto dall'utente) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div>
              <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-1">
                Configurazione Lezione Aperta con le Famiglie
              </label>
              <p className="text-[11px] text-amber-900">
                Scegli se impostare la lezione aperta <strong>per ogni singola fascia d età</strong> (personalizzata) oppure <strong>una che valga per tutti</strong> (globale).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Option 1: Per ogni fascia di età */}
              <button
                type="button"
                onClick={() => setOpenLessonsScope('per_item')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  openLessonsScope === 'per_item'
                    ? 'bg-white border-amber-500 ring-2 ring-amber-400 shadow-xs'
                    : 'bg-amber-100/40 border-amber-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    Per ogni fascia d età
                  </span>
                  {openLessonsScope === 'per_item' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                      Attiva
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Imposta la presenza ed eventuale costo della lezione aperta su ciascun gruppo singolarmente.
                </p>
              </button>

              {/* Option 2: Unica che vale per tutti */}
              <button
                type="button"
                onClick={() => setOpenLessonsScope('global')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  openLessonsScope === 'global'
                    ? 'bg-white border-rose-500 ring-2 ring-rose-400 shadow-xs'
                    : 'bg-amber-100/40 border-amber-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    Unica per tutti
                  </span>
                  {openLessonsScope === 'global' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                      Attiva
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Un'unica lezione aperta collettiva condivisa con una sola quota o inclusa per tutti.
                </p>
              </button>

              {/* Option 3: Nessuna lezione aperta */}
              <button
                type="button"
                onClick={() => setOpenLessonsScope('none')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  openLessonsScope === 'none'
                    ? 'bg-white border-slate-500 ring-2 ring-slate-400 shadow-xs'
                    : 'bg-amber-100/40 border-amber-200 hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    Nessuna lezione aperta
                  </span>
                  {openLessonsScope === 'none' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-600 text-white">
                      Attiva
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600">
                  Il preventivo comprende solo gli incontri didattici ordinari, senza restituzione con genitori.
                </p>
              </button>
            </div>

            {/* Global option settings box if 'global' is active */}
            {openLessonsScope === 'global' && (
              <div className="pt-3 border-t border-amber-200/80 space-y-3 bg-white p-3.5 rounded-xl border">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-800 mb-1">
                    Dettaglio Lezione Aperta Unica (per tutti i gruppi)
                  </label>
                  <input
                    type="text"
                    value={openLessonsDetails}
                    onChange={(e) => setOpenLessonsDetails(e.target.value)}
                    placeholder="Es. 1 lezione aperta finale di condivisione per tutti i gruppi con le famiglie"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-2">
                    Costo Lezione Aperta Unica:
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIncludeOpenLessonCost(false);
                        setOpenLessonsCost(0);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        !includeOpenLessonCost
                          ? 'bg-amber-50 border-amber-400 font-bold text-amber-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs">Inclusa nel pacchetto (€ 0)</div>
                      <div className="text-[10px] font-normal opacity-80">Nessun costo extra, compresa nel totale</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIncludeOpenLessonCost(true);
                        if (openLessonsCost === 0) setOpenLessonsCost(30);
                      }}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        includeOpenLessonCost
                          ? 'bg-rose-50 border-rose-400 font-bold text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      <div className="text-xs">Applica costo specifico (€)</div>
                      <div className="text-[10px] font-normal opacity-80">Sommata al totale del preventivo</div>
                    </button>
                  </div>

                  {includeOpenLessonCost && (
                    <div className="mt-2 p-2.5 bg-rose-50/50 rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">Importo (€):</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={openLessonsCost}
                          onChange={(e) => setOpenLessonsCost(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-24 px-2 py-1 rounded border border-rose-300 text-xs font-bold text-rose-600 text-right bg-white"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {[25, 30, 40, 50, 60].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setOpenLessonsCost(preset)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 hover:border-rose-400"
                          >
                            € {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Items breakdown per age group */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Fasce d Età / Articolazione Percorso
                </h4>
                <p className="text-[11px] text-slate-500">
                  {openLessonsScope === 'per_item' 
                    ? 'Puoi configurare o escludere la lezione aperta per ciascuna specifica fascia qui sotto.' 
                    : 'Composizione delle sezioni e monte ore.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-1 border border-teal-200"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi Fascia
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const itemOpenCost = item.hasOpenLesson && item.includeOpenLessonCost ? (Number(item.openLessonCost) || 0) : 0;
                const itemTotalCombined = item.total + (openLessonsScope === 'per_item' ? itemOpenCost : 0);

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Header line for item */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      {/* Fascia name */}
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                          Fascia d'età / Gruppo
                        </label>
                        <input
                          type="text"
                          value={item.ageGroup}
                          onChange={(e) => handleItemChange(item.id, 'ageGroup', e.target.value)}
                          placeholder="Es. Bambini di 3 anni"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-rose-500"
                        />
                      </div>

                      {/* Num lessons */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                          N° Lezioni
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.numLessons}
                          onChange={(e) => handleItemChange(item.id, 'numLessons', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center text-slate-900 focus:outline-rose-500"
                        />
                      </div>

                      {/* Price per lesson */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                          € / Lezione
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.pricePerLesson}
                          onChange={(e) => handleItemChange(item.id, 'pricePerLesson', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-center text-slate-900 focus:outline-rose-500"
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="sm:col-span-2 text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Subtotale</span>
                        <span className="text-xs font-black text-rose-600 tabular-nums block">
                          € {item.total.toFixed(2).replace('.00', '').replace('.', ',')}
                        </span>
                      </div>

                      {/* Remove button */}
                      <div className="sm:col-span-1 text-right">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Rimuovi fascia"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Item notes / detail */}
                    <div>
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                        placeholder="Note didattiche fascia (es. durata 45 min, percussioni Orff e canti mimati)"
                        className="w-full px-2.5 py-1 rounded-md border border-slate-100 text-[11px] text-slate-600 focus:outline-rose-500 bg-slate-50/50"
                      />
                    </div>

                    {/* SEZIONE LEZIONE APERTA SPECIFICA PER QUESTA FASCIA D'ETÀ (Quando openLessonsScope === 'per_item') */}
                    {openLessonsScope === 'per_item' && (
                      <div className="pt-2 border-t border-slate-100 bg-amber-50/40 p-3 rounded-xl border border-amber-100 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={Boolean(item.hasOpenLesson)}
                              onChange={(e) => handleItemChange(item.id, 'hasOpenLesson', e.target.checked)}
                              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                            />
                            <span className="text-xs font-bold text-amber-950">
                              Lezione aperta con genitori per <em>{item.ageGroup || 'questa fascia'}</em>
                            </span>
                          </label>

                          {/* Action to copy this open lesson config to all other items */}
                          <button
                            type="button"
                            onClick={() => handleCopyOpenLessonToAll(item)}
                            title="Applica le impostazioni di questa lezione aperta a tutte le altre fasce d'età"
                            className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 hover:bg-amber-100/60 px-2 py-0.5 rounded transition-colors flex items-center gap-1 self-start sm:self-auto"
                          >
                            <Copy className="w-3 h-3" />
                            Copia su tutte le fasce
                          </button>
                        </div>

                        {item.hasOpenLesson && (
                          <div className="space-y-2 pt-1">
                            <div>
                              <input
                                type="text"
                                value={item.openLessonDetails || ''}
                                onChange={(e) => handleItemChange(item.id, 'openLessonDetails', e.target.value)}
                                placeholder="Dettaglio lezione aperta per questa fascia (es. 1 incontro aperto con canti e ritmi condivisi)"
                                className="w-full px-2.5 py-1 rounded-md border border-amber-200 text-xs text-slate-800 bg-white focus:outline-rose-500"
                              />
                            </div>

                            {/* Cost choice for this age group */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2 rounded-lg border border-amber-200/70">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-700">Costo lezione aperta:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleItemChange(item.id, 'includeOpenLessonCost', false);
                                      handleItemChange(item.id, 'openLessonCost', 0);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                      !item.includeOpenLessonCost
                                        ? 'bg-amber-500 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    Inclusa (€ 0)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleItemChange(item.id, 'includeOpenLessonCost', true);
                                      if (!item.openLessonCost) handleItemChange(item.id, 'openLessonCost', 25);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                                      item.includeOpenLessonCost
                                        ? 'bg-rose-600 text-white shadow-2xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    Aggiungi costo (€)
                                  </button>
                                </div>
                              </div>

                              {item.includeOpenLessonCost && (
                                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                  <span className="text-xs font-bold text-rose-600">€</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.openLessonCost || 0}
                                    onChange={(e) => handleItemChange(item.id, 'openLessonCost', Math.max(0, parseFloat(e.target.value) || 0))}
                                    className="w-20 px-2 py-0.5 rounded border border-rose-300 text-xs font-bold text-rose-600 text-right bg-white"
                                  />
                                  <span className="text-[10px] text-rose-700 font-semibold">(nel tot)</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Materials included */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Materiali e Strumentario Inclusi
            </label>
            <input
              type="text"
              value={materialsIncluded}
              onChange={(e) => setMaterialsIncluded(e.target.value)}
              placeholder="Es. Strumentario Orff, tracce audio e dispense fornite dall'insegnante"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Grand total bar */}
          <div className="p-4 bg-linear-to-r from-teal-500 to-rose-600 rounded-2xl text-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90">
                  Totale Preventivo Progetto
                </span>
                <div className="text-[11px] opacity-85 flex flex-wrap gap-x-2">
                  <span>Corsi ({items.length} fasce): € {itemsLessonsTotal.toFixed(2)}</span>
                  {openLessonsScope === 'per_item' && perItemOpenLessonsCost > 0 ? (
                    <span className="font-bold underline">+ Lezioni aperte per fasce: € {perItemOpenLessonsCost.toFixed(2)}</span>
                  ) : openLessonsScope === 'per_item' && items.some(i => i.hasOpenLesson) ? (
                    <span>(Lezioni aperte incluse nelle fasce: € 0)</span>
                  ) : openLessonsScope === 'global' && globalOpenLessonCost > 0 ? (
                    <span className="font-bold underline">+ Lezione aperta unica: € {globalOpenLessonCost.toFixed(2)}</span>
                  ) : openLessonsScope === 'global' ? (
                    <span>(Lezione aperta unica inclusa: € 0)</span>
                  ) : (
                    <span>(Senza lezioni aperte)</span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-black tabular-nums self-end sm:self-auto">
                € {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Status & Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stato del Preventivo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-rose-500 bg-white"
              >
                <option value="bozza">Bozza (In lavorazione)</option>
                <option value="inviato">Inviato alla Scuola</option>
                <option value="approvato">Approvato dal Collegio Docenti</option>
                <option value="rifiutato">Rifiutato / Archiviato</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validità Preventivo (giorni)
              </label>
              <input
                type="number"
                value={validityDays}
                onChange={(e) => setValidityDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note interne / aggiuntive
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. In attesa di delibera del collegio docenti entro fine mese"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {initialQuote && onDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Elimina Preventivo
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                {initialQuote ? 'Salva Modifiche' : 'Genera Preventivo'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
