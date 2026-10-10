import React, { useState, useEffect } from 'react';
import { X, Music, Users, Clock, Euro, Palette, DoorOpen, Trash2, AlertTriangle } from 'lucide-react';
import { Course, CourseType, Student } from '../../types';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  onDelete?: (courseId: string) => void;
  initialCourse?: Course | null;
  students?: Student[];
  activeYearId: string;
}

const BRAND_PALETTE = [
  '#EF233C', // Coral Red
  '#FFB703', // Golden Yellow
  '#00B4D8', // Cyan Teal
  '#F77F00', // Warm Orange
  '#7209B7', // Purple
  '#06D6A0', // Mint
  '#3A86FF', // Royal Blue
  '#D90429', // Crimson
];

const COURSE_TYPES: { id: CourseType; label: string; defaultDesc: string }[] = [
  { id: 'canto_singolo', label: 'Canto Singolo (Individuale)', defaultDesc: 'Lezione singola di canto moderno e tecnica vocale' },
  { id: 'canto_coppia', label: 'Canto di Coppia (Duo Vocale)', defaultDesc: 'Lezioni a due allievi per duetti e armonizzazione' },
  { id: 'coro', label: 'Coro (Voci Bianche o Adulti)', defaultDesc: 'Corso corale d insieme' },
  { id: 'musica_gioco', label: 'Musica-Gioco per Bambini (Propedeutica)', defaultDesc: 'Propedeutica musicale ludica con ritmo e movimento' },
  { id: 'laboratorio_scuola', label: 'Laboratorio Esterno Scuole', defaultDesc: 'Workshop e laboratori per scuole materne o primarie' },
  { id: 'altro', label: 'Altro Corso / Laboratorio', defaultDesc: 'Attività musicale' },
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialCourse,
  students,
  activeYearId,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<CourseType>('canto_singolo');
  const [description, setDescription] = useState('');
  const [targetAge, setTargetAge] = useState('');
  const [hourlyRateStr, setHourlyRateStr] = useState('25');
  const [monthlyRateStr, setMonthlyRateStr] = useState('90');
  const [color, setColor] = useState(BRAND_PALETTE[0]);
  const [maxStudents, setMaxStudents] = useState<number | undefined>(1);
  const [room, setRoom] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | undefined>(2); // Martedì default
  const [defaultTimeSlot, setDefaultTimeSlot] = useState('');
  const [active, setActive] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialCourse) {
      setName(initialCourse.name);
      setType(initialCourse.type);
      setDescription(initialCourse.description);
      setTargetAge(initialCourse.targetAge || '');
      setHourlyRateStr(
        initialCourse.defaultHourlyRate !== undefined
          ? String(initialCourse.defaultHourlyRate).replace('.', ',')
          : ''
      );
      setMonthlyRateStr(
        initialCourse.defaultMonthlyRate !== undefined
          ? String(initialCourse.defaultMonthlyRate).replace('.', ',')
          : ''
      );
      setColor(initialCourse.color);
      setMaxStudents(initialCourse.maxStudents);
      setRoom(initialCourse.room || '');
      setDayOfWeek(initialCourse.dayOfWeek);
      setDefaultTimeSlot(initialCourse.defaultTimeSlot || '');
      setActive(initialCourse.active);
    } else {
      setName('');
      setType('canto_singolo');
      setDescription('Lezione personalizzata di tecnica vocale e canto.');
      setTargetAge('Bambini e Ragazzi');
      setHourlyRateStr('25');
      setMonthlyRateStr('90');
      setColor(BRAND_PALETTE[0]);
      setMaxStudents(1);
      setRoom('Aula Canto 1');
      setDayOfWeek(2);
      setDefaultTimeSlot('14:00 - 15:00');
      setActive(true);
    }
    setShowDeleteConfirm(false);
  }, [initialCourse, isOpen]);

  if (!isOpen) return null;

  const parseDecimal = (val: string): number | undefined => {
    if (val === undefined || val === null || !val.trim()) return undefined;
    const normalized = val.trim().replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? undefined : num;
  };

  const handleTypeChange = (newType: CourseType) => {
    setType(newType);
    if (!initialCourse) {
      if (newType === 'canto_singolo') {
        setMaxStudents(1);
        setHourlyRateStr('25');
        setMonthlyRateStr('90');
      } else if (newType === 'canto_coppia') {
        setMaxStudents(2);
        setHourlyRateStr('20');
        setMonthlyRateStr('70');
      } else if (newType === 'coro') {
        setMaxStudents(20);
        setHourlyRateStr('15');
        setMonthlyRateStr('50');
      } else if (newType === 'musica_gioco') {
        setMaxStudents(12);
        setHourlyRateStr('15');
        setMonthlyRateStr('45');
        setTargetAge('3 - 5 anni');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const courseToSave: Course = {
      id: initialCourse?.id || `course-${Date.now()}`,
      academicYearId: initialCourse?.academicYearId || activeYearId,
      name: name.trim(),
      type,
      description: description.trim(),
      targetAge: targetAge.trim() || undefined,
      defaultHourlyRate: parseDecimal(hourlyRateStr),
      defaultMonthlyRate: parseDecimal(monthlyRateStr),
      color,
      maxStudents: maxStudents ? Number(maxStudents) : undefined,
      room: room.trim() || undefined,
      dayOfWeek: dayOfWeek !== undefined ? Number(dayOfWeek) : undefined,
      defaultTimeSlot: defaultTimeSlot.trim() || undefined,
      active,
    };

    onSave(courseToSave);
    onClose();
  };

  const enrolledCount = initialCourse && students
    ? students.filter((s) => s.courseIds?.includes(initialCourse.id)).length
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: color }}
            >
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {initialCourse ? 'Modifica Corso / Gruppo' : 'Crea Nuovo Corso o Gruppo'}
              </h3>
              <p className="text-xs text-slate-500">
                Anno Accademico: <span className="font-semibold text-rose-600">{activeYearId}</span>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Tipologia di corso */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tipologia Corso <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COURSE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTypeChange(t.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex flex-col justify-between ${
                    type === t.id
                      ? 'border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-semibold">{t.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">{t.defaultDesc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nome corso */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome del Corso / Gruppo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Canto Singolo Pop, Coro Voci Bianche..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Fascia d'età & Aula */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fascia d Età / Livello
              </label>
              <input
                type="text"
                value={targetAge}
                onChange={(e) => setTargetAge(e.target.value)}
                placeholder="Es. 3 - 5 anni / Ragazzi 12-16"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aula / Sede
              </label>
              <div className="relative">
                <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Es. Aula Canto 1 / Sala Coro"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Tariffe orarie & mensili (accetta qualsiasi valore anche con virgola) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quota Mensile (€)
              </label>
              <div className="relative">
                <Euro className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={monthlyRateStr}
                  onChange={(e) => setMonthlyRateStr(e.target.value)}
                  placeholder="Es. 90 o 85,50"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prezzo all Ora / Lezione (€)
              </label>
              <div className="relative">
                <Euro className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={hourlyRateStr}
                  onChange={(e) => setHourlyRateStr(e.target.value)}
                  placeholder="Es. 25 o 22,50"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Inserisci qualsiasi importo, anche con la virgola (es. 25,50).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Max Partecipanti
              </label>
              <div className="relative">
                <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  value={maxStudents || ''}
                  onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1"
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Giorno & Orario di default */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giorno della Settimana Consueto
              </label>
              <select
                value={dayOfWeek ?? ''}
                onChange={(e) => setDayOfWeek(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              >
                <option value="">Nessun giorno fisso</option>
                <option value="1">Lunedì</option>
                <option value="2">Martedì</option>
                <option value="3">Mercoledì</option>
                <option value="4">Giovedì</option>
                <option value="5">Venerdì</option>
                <option value="6">Sabato</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Orario Consueto (Fascia)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={defaultTimeSlot}
                  onChange={(e) => setDefaultTimeSlot(e.target.value)}
                  placeholder="Es. 14:00 - 15:00"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Colore Distintivo nel Calendario
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {BRAND_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-slate-900 shadow-md' : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrizione o Obiettivi Didattici
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrizione del programma e degli obiettivi..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="courseActive"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded"
            />
            <label htmlFor="courseActive" className="text-xs font-medium text-slate-700 cursor-pointer">
              Corso attivo in questo anno accademico
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {initialCourse && onDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina Corso
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
                {initialCourse ? 'Salva Modifiche' : 'Crea Corso'}
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Dialog Overlay for deleting course */}
        {showDeleteConfirm && initialCourse && onDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Elimina Corso o Gruppo
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {initialCourse.name}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Confermi l eliminazione di questo corso?
                </p>
                <p className="text-[11px] leading-relaxed">
                  {enrolledCount > 0 ? (
                    <>
                      Attualmente <strong>{enrolledCount} allievi</strong> risultano iscritti a questo corso.
                      Se elimini il corso, gli allievi non saranno più assegnati a questo gruppo, ma le loro anagrafiche e i pagamenti rimarranno salvi.
                    </>
                  ) : (
                    'Nessun allievo è attualmente assegnato a questo corso.'
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialCourse.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Definitivamente il Corso
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
