import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Repeat, 
  Clock, 
  User, 
  Music, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  DoorOpen,
  CalendarDays,
  Pin,
  Users,
  Sparkles,
  Layers
} from 'lucide-react';
import { Lesson, Student, Course, CalendarEventType, GenericEventCategory } from '../../types';
import { 
  ITALIAN_DAYS, 
  ITALIAN_DAYS_SHORT, 
  ITALIAN_MONTHS, 
  formatDateLong, 
  formatDateShort,
  getTodayString 
} from '../../utils/dateHelpers';

interface CalendarViewProps {
  lessons: Lesson[];
  students: Student[];
  courses: Course[];
  activeYearId: string;
  onNewSingleLesson: (date?: string, eventType?: CalendarEventType) => void;
  onPlanRecurring: () => void;
  onSelectLesson: (lesson: Lesson) => void;
}

const CATEGORY_NAMES: Record<GenericEventCategory, string> = {
  riunione: 'Riunione',
  evento_scuola: 'Evento / Saggio',
  personale: 'Personale',
  scadenza: 'Scadenza',
  altro: 'Evento',
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  lessons,
  students,
  courses,
  activeYearId,
  onNewSingleLesson,
  onPlanRecurring,
  onSelectLesson,
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return new Date(2026, 9, 1); // October 2026 default seed date
  });
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'lezioni' | 'appuntamenti'>('all');

  // Filter lessons for active academic year
  const yearLessons = useMemo(() => {
    return lessons.filter((l) => l.academicYearId === activeYearId);
  }, [lessons, activeYearId]);

  const filteredLessons = useMemo(() => {
    return yearLessons.filter((lesson) => {
      const isGeneric = lesson.eventType === 'appuntamento';

      // Type filter
      if (selectedTypeFilter === 'lezioni' && isGeneric) return false;
      if (selectedTypeFilter === 'appuntamenti' && !isGeneric) return false;

      // Student filter (only applies to lessons)
      if (selectedStudentFilter !== 'all') {
        if (isGeneric) return false;
        const matchStudent =
          lesson.studentId === selectedStudentFilter ||
          (lesson.studentIds && lesson.studentIds.includes(selectedStudentFilter));
        if (!matchStudent) return false;
      }

      // Course filter (only applies to lessons)
      if (selectedCourseFilter !== 'all') {
        if (isGeneric) return false;
        if (lesson.courseId !== selectedCourseFilter) return false;
      }

      return true;
    });
  }, [yearLessons, selectedStudentFilter, selectedCourseFilter, selectedTypeFilter]);

  // Calendar matrix calculations for Month view
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 9, 1)); // October 2026
  };

  // Days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const startDayOffset = (firstDayOfMonth + 6) % 7; // Monday is 0
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create grid cells
  const calendarCells = useMemo(() => {
    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: d, isCurrentMonth: true });
    }

    // Next month padding to fill complete weeks (up to 35 or 42)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth + 2 > 12 ? 1 : currentMonth + 2;
      const y = currentMonth + 2 > 12 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }

    return cells;
  }, [currentYear, currentMonth, startDayOffset, daysInMonth]);

  // Group lessons by date for quick lookup
  const lessonsByDate = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    filteredLessons.forEach((l) => {
      const arr = map.get(l.date) || [];
      arr.push(l);
      map.set(l.date, arr);
    });
    // Sort lessons within each day by start time
    map.forEach((arr) => {
      arr.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return map;
  }, [filteredLessons]);

  // Lessons sorted for agenda view
  const agendaLessons = useMemo(() => {
    return [...filteredLessons].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [filteredLessons]);

  const countAppointments = useMemo(() => {
    return yearLessons.filter((l) => l.eventType === 'appuntamento').length;
  }, [yearLessons]);

  const countSingingLessons = useMemo(() => {
    return yearLessons.filter((l) => l.eventType !== 'appuntamento').length;
  }, [yearLessons]);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Calendario Scolastico & Eventi
            </h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                {countSingingLessons} lezioni
              </span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                <Pin className="w-3 h-3" />
                {countAppointments} appuntamenti
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pianifica lezioni di canto, serie ricorrenti, riunioni docenti, saggi ed eventi della scuola in un unica visuale.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Generic Appointment */}
          <button
            onClick={() => onNewSingleLesson(undefined, 'appuntamento')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Aggiungi riunione, saggio, impegno personale o scadenza"
          >
            <Pin className="w-4 h-4" />
            + Nuovo Appuntamento / Evento
          </button>

          {/* Plan Recurring Lessons */}
          <button
            onClick={onPlanRecurring}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-linear-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
            title="Imposta lezioni fisse settimanali da data a data"
          >
            <Repeat className="w-4 h-4" />
            Pianifica Ricorrenza
          </button>

          {/* Add Single Lesson */}
          <button
            onClick={() => onNewSingleLesson(undefined, 'lezione')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Nuova Lezione
          </button>
        </div>
      </div>

      {/* Control Bar: Month Switcher, Filters, Views */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Month selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Mese Precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm sm:text-base font-black text-slate-900 min-w-44 text-center">
              {ITALIAN_MONTHS[currentMonth]} {currentYear}
            </span>

            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Mese Successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={goToToday}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              Ottobre 2026
            </button>
          </div>

          {/* Filters & View switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type Filter */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedTypeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tutti ({yearLessons.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('lezioni')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedTypeFilter === 'lezioni'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Lezioni ({countSingingLessons})
              </button>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('appuntamenti')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedTypeFilter === 'appuntamenti'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Appuntamenti ({countAppointments})
              </button>
            </div>

            {/* Student filter (if not filtering only appointments) */}
            {selectedTypeFilter !== 'appuntamenti' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <User className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <select
                  value={selectedStudentFilter}
                  onChange={(e) => setSelectedStudentFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 px-1 py-1 outline-none cursor-pointer max-w-36 truncate"
                >
                  <option value="all">Tutti gli Allievi</option>
                  {students
                    .filter((s) => s.academicYearId === activeYearId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Course filter (if not filtering only appointments) */}
            {selectedTypeFilter !== 'appuntamenti' && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <Music className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 px-1 py-1 outline-none cursor-pointer max-w-36 truncate"
                >
                  <option value="all">Tutti i Corsi</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mese
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Elenco Agenda
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: MONTH GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center py-2.5 text-xs font-bold text-slate-600">
            {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map((day) => (
              <div key={day} className="truncate px-1">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100">
            {calendarCells.map((cell, idx) => {
              const dayLessons = lessonsByDate.get(cell.dateStr) || [];
              const isToday = cell.dateStr === getTodayString();

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => onNewSingleLesson(cell.dateStr)}
                  className={`min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 bg-white flex flex-col justify-between transition-colors hover:bg-rose-50/20 cursor-pointer ${
                    !cell.isCurrentMonth ? 'opacity-40 bg-slate-50/50' : ''
                  }`}
                >
                  {/* Day number header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        isToday
                          ? 'bg-rose-600 text-white font-black'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {dayLessons.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500">
                        {dayLessons.length}
                      </span>
                    )}
                  </div>

                  {/* Lessons & Events list inside day */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-24">
                    {dayLessons.map((les) => {
                      const isGeneric = les.eventType === 'appuntamento';

                      if (isGeneric) {
                        const eventColor = les.eventColor || '#4f46e5';
                        const categoryLabel = les.eventCategory ? CATEGORY_NAMES[les.eventCategory] || 'Evento' : 'Evento';

                        return (
                          <div
                            key={les.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectLesson(les);
                            }}
                            className="px-1.5 py-1 rounded-md text-[10px] font-semibold border truncate transition-transform hover:scale-[1.02] cursor-pointer shadow-2xs"
                            style={{
                              backgroundColor: `${eventColor}18`,
                              color: '#0F172A',
                              borderColor: `${eventColor}50`,
                            }}
                            title={`📌 [${categoryLabel}] ${les.title} (${les.startTime} - ${les.endTime})`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-black truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: eventColor }} />
                                <span className="opacity-70 text-[9px]">[{categoryLabel.slice(0, 4)}]</span>
                                <span>{les.startTime} {les.title}</span>
                              </span>
                              <Pin className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                            </div>
                          </div>
                        );
                      }

                      // Singing Lesson
                      const course = courses.find((c) => c.id === les.courseId);
                      const student = students.find((s) => s.id === les.studentId);
                      const courseColor = course?.color || '#00B4D8';

                      return (
                        <div
                          key={les.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(les);
                          }}
                          className="px-1.5 py-1 rounded-md text-[10px] font-semibold border truncate transition-transform hover:scale-[1.02] cursor-pointer shadow-2xs"
                          style={{
                            backgroundColor: `${courseColor}18`,
                            color: '#0F172A',
                            borderColor: `${courseColor}40`,
                          }}
                          title={`${les.title} (${les.startTime} - ${les.endTime}) - Clicca per spostare o modificare`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 truncate">
                              {les.startTime} {student ? `${student.firstName}` : les.title}
                            </span>
                            {les.isRecurringInstance && (
                              <Repeat className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: AGENDA LIST */}
      {viewMode === 'agenda' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
          {agendaLessons.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Nessun evento o lezione trovata</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Non ci sono eventi o lezioni corrispondenti ai filtri attuali.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => onNewSingleLesson(undefined, 'appuntamento')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                >
                  + Crea Appuntamento
                </button>
                <button
                  onClick={() => onNewSingleLesson(undefined, 'lezione')}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
                >
                  + Nuova Lezione
                </button>
              </div>
            </div>
          ) : (
            agendaLessons.map((les) => {
              const isGeneric = les.eventType === 'appuntamento';

              if (isGeneric) {
                const eventColor = les.eventColor || '#4f46e5';
                const categoryLabel = les.eventCategory ? CATEGORY_NAMES[les.eventCategory] || 'Evento' : 'Evento Generico';

                return (
                  <div
                    key={les.id}
                    onClick={() => onSelectLesson(les)}
                    className="p-4 hover:bg-indigo-50/30 cursor-pointer transition-colors flex items-center justify-between gap-4 border-l-4"
                    style={{ borderLeftColor: eventColor }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Date badge */}
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold uppercase text-indigo-600">
                          {formatDateShort(les.date).slice(3, 5)}/{formatDateShort(les.date).slice(0, 2)}
                        </span>
                        <span className="text-xs font-black text-indigo-950 mt-0.5">
                          {les.startTime}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{les.title}</h4>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                            style={{
                              backgroundColor: `${eventColor}20`,
                              color: eventColor,
                            }}
                          >
                            <Pin className="w-2.5 h-2.5" />
                            {categoryLabel}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              les.status === 'completata'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {les.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                          <span>{formatDateLong(les.date)}</span>
                          <span>·</span>
                          <span className="font-semibold text-slate-700">
                            {les.startTime} - {les.endTime}
                          </span>
                          {les.room && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-slate-600">
                                <DoorOpen className="w-3 h-3" />
                                {les.room}
                              </span>
                            </>
                          )}
                        </p>

                        {(les.description || les.notes) && (
                          <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-1">
                            &ldquo;{les.description || les.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLesson(les);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      Dettagli / Modifica
                    </button>
                  </div>
                );
              }

              // Standard Singing Lesson
              const course = courses.find((c) => c.id === les.courseId);
              const student = students.find((s) => s.id === les.studentId);
              const courseColor = course?.color || '#00B4D8';

              return (
                <div
                  key={les.id}
                  onClick={() => onSelectLesson(les)}
                  className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {formatDateShort(les.date).slice(3, 5)}/{formatDateShort(les.date).slice(0, 2)}
                      </span>
                      <span className="text-xs font-black text-slate-900 mt-0.5">
                        {les.startTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{les.title}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            les.status === 'completata'
                              ? 'bg-emerald-100 text-emerald-800'
                              : les.status === 'programmata'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {les.status}
                        </span>
                        {les.isRecurringInstance && (
                          <span className="text-[10px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Repeat className="w-2.5 h-2.5" />
                            Ricorrente
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                        <span>{formatDateLong(les.date)}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">
                          {les.startTime} - {les.endTime}
                        </span>
                        {les.room && (
                          <>
                            <span>·</span>
                            <span>{les.room}</span>
                          </>
                        )}
                        {course && (
                          <>
                            <span>·</span>
                            <span className="font-medium" style={{ color: courseColor }}>
                              {course.name}
                            </span>
                          </>
                        )}
                      </p>

                      {les.songsStudied && les.songsStudied.length > 0 && (
                        <p className="text-[11px] font-semibold text-rose-700 mt-1 flex items-center gap-1">
                          <Music className="w-3 h-3 text-rose-500" />
                          <span>Brani: {les.songsStudied.join(', ')}</span>
                        </p>
                      )}

                      {les.notes && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 italic mt-0.5">
                          &ldquo;{les.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLesson(les);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Modifica / Sposta
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
