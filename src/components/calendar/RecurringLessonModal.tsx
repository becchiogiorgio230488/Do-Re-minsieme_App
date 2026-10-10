import React, { useState, useMemo } from 'react';
import { X, Calendar, Clock, User, Music, DoorOpen, Repeat, CheckCircle } from 'lucide-react';
import { Student, Course, Lesson } from '../../types';
import { 
  generateRecurringDates, 
  ITALIAN_DAYS, 
  formatDateShort,
  getTodayString,
  addDays
} from '../../utils/dateHelpers';

interface RecurringLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecurring: (lessons: Lesson[]) => void;
  students: Student[];
  courses: Course[];
  activeYearId: string;
  preselectedStudent?: Student | null;
}

export const RecurringLessonModal: React.FC<RecurringLessonModalProps> = ({
  isOpen,
  onClose,
  onSaveRecurring,
  students,
  courses,
  activeYearId,
  preselectedStudent,
}) => {
  const [studentId, setStudentId] = useState(preselectedStudent?.id || '');
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Martedì by default (as in user prompt)
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(addDays(getTodayString(), 90)); // ~3 months default
  const [room, setRoom] = useState('Aula Canto 1');
  const [notes, setNotes] = useState('');

  // Update when preselectedStudent changes
  React.useEffect(() => {
    if (preselectedStudent) {
      setStudentId(preselectedStudent.id);
      setTitle(`Lezione Canto - ${preselectedStudent.firstName} ${preselectedStudent.lastName}`);
      if (preselectedStudent.courseIds?.length) {
        setCourseId(preselectedStudent.courseIds[0]);
      }
    }
  }, [preselectedStudent, isOpen]);

  // Handle student select change
  const handleStudentChange = (sId: string) => {
    setStudentId(sId);
    const selected = students.find((s) => s.id === sId);
    if (selected) {
      setTitle(`Lezione Canto - ${selected.firstName} ${selected.lastName}`);
      if (selected.courseIds?.length) {
        setCourseId(selected.courseIds[0]);
      }
    }
  };

  // Generate date preview
  const generatedDates = useMemo(() => {
    if (!startDate || !endDate) return [];
    return generateRecurringDates(dayOfWeek, startDate, endDate);
  }, [dayOfWeek, startDate, endDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (generatedDates.length === 0) return;

    const seriesId = `series-${Date.now()}`;
    const selectedStudent = students.find((s) => s.id === studentId);
    const lessonTitle = title.trim() || (selectedStudent ? `Lezione ${selectedStudent.firstName} ${selectedStudent.lastName}` : 'Lezione Ricorrente');

    const createdLessons: Lesson[] = generatedDates.map((date, idx) => ({
      id: `les-rec-${Date.now()}-${idx}`,
      academicYearId: activeYearId,
      studentId: studentId || undefined,
      courseId: courseId || undefined,
      title: lessonTitle,
      date,
      startTime,
      endTime,
      status: 'programmata',
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      isRecurringInstance: true,
      recurringSeriesId: seriesId,
    }));

    onSaveRecurring(createdLessons);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pianifica Lezioni Ricorrenti
              </h3>
              <p className="text-xs text-slate-500">
                Genera automaticamente gli appuntamenti (es. ogni Martedì dalle 14:00 alle 15:00).
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
                      {s.firstName} {s.lastName} {s.isMinor ? '(Minorenne)' : ''}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Course selection & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corso Associato
              </label>
              <div className="relative">
                <Music className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                >
                  <option value="">Nessun corso specifico</option>
                  {courses
                    .filter((c) => c.academicYearId === activeYearId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Titolo Lezione
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Lezione Canto Singolo - Leonardo"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Day of Week Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Giorno della Settimana <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {[
                { day: 1, label: 'Lun' },
                { day: 2, label: 'Mar' },
                { day: 3, label: 'Mer' },
                { day: 4, label: 'Gio' },
                { day: 5, label: 'Ven' },
                { day: 6, label: 'Sab' },
                { day: 0, label: 'Dom' },
              ].map(({ day, label }) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDayOfWeek(day)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-colors ${
                    dayOfWeek === day
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Selezionato: <strong>Tutti i {ITALIAN_DAYS[dayOfWeek]}</strong>
            </p>
          </div>

          {/* Time Slot */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ora Inizio <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ora Fine <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Inizio Ricorrenza <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Fine Ricorrenza <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Room & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aula / Spazio
              </label>
              <div className="relative">
                <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Es. Aula Canto 1"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Es. Ricorrenza settimanale fissa"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Summary / Calculation Box */}
          <div className="p-3.5 rounded-xl bg-linear-to-r from-amber-50 to-rose-50 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Anteprima Generazione:
              </p>
              <p className="text-[11px] text-amber-900 mt-0.5">
                Verranno inserite <strong>{generatedDates.length} lezioni</strong> ogni {ITALIAN_DAYS[dayOfWeek]} dalle {startTime} alle {endTime}.
              </p>
              <p className="text-[10px] text-amber-800">
                Potrai poi modificare o cancellare ogni singolo martedì in modo indipendente!
              </p>
            </div>

            <span className="text-xl font-black text-rose-600 shrink-0">
              {generatedDates.length} lezioni
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={generatedDates.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              Genera {generatedDates.length} Lezioni
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
