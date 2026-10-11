import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Music, 
  DoorOpen, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Repeat,
  Sparkles,
  BookOpen,
  Target,
  ListCheck,
  Check,
  Plus,
  Pin,
  Users,
  Briefcase,
  CalendarCheck,
  FileText
} from 'lucide-react';
import { 
  Lesson, 
  Student, 
  Course, 
  LessonStatus, 
  LessonRating, 
  CalendarEventType, 
  GenericEventCategory 
} from '../../types';
import { formatDateWithDay, formatDateLong } from '../../utils/dateHelpers';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Lesson) => void;
  onDeleteSingle: (lessonId: string) => void;
  onDeleteSeries?: (recurringSeriesId: string, currentLessonId?: string) => void;
  lesson?: Lesson | null;
  lessons?: Lesson[];
  students: Student[];
  courses: Course[];
  activeYearId: string;
  defaultEventType?: CalendarEventType;
}

const EVENT_CATEGORIES: { id: GenericEventCategory; label: string; color: string; bg: string; border: string; icon: any }[] = [
  { id: 'riunione', label: 'Riunione', color: '#2563eb', bg: 'bg-blue-50 text-blue-700', border: 'border-blue-300', icon: Users },
  { id: 'evento_scuola', label: 'Evento / Saggio Scuola', color: '#7c3aed', bg: 'bg-purple-50 text-purple-700', border: 'border-purple-300', icon: Sparkles },
  { id: 'personale', label: 'Personale / Impegno', color: '#059669', bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-300', icon: User },
  { id: 'scadenza', label: 'Scadenza / Amministrativo', color: '#d97706', bg: 'bg-amber-50 text-amber-700', border: 'border-amber-300', icon: Clock },
  { id: 'altro', label: 'Altro Evento', color: '#475569', bg: 'bg-slate-100 text-slate-700', border: 'border-slate-300', icon: Pin },
];

const APPOINTMENT_TITLE_PRESETS = [
  'Riunione Corpo Docenti',
  'Saggio di Natale - Prove Generali',
  'Concerto di Fine Anno',
  'Colloquio con Genitori',
  'Scadenza Invio Quote & Iscrizioni',
  'Masterclass Tecnica Vocale',
  'Manutenzione Strumenti & Aula',
  'Impegno Personale / Assenza Docente',
];

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDeleteSingle,
  onDeleteSeries,
  lesson,
  lessons = [],
  students,
  courses,
  activeYearId,
  defaultEventType = 'lezione',
}) => {
  // Event Type: 'lezione' vs 'appuntamento'
  const [eventType, setEventType] = useState<CalendarEventType>('lezione');
  const [eventCategory, setEventCategory] = useState<GenericEventCategory>('riunione');
  const [eventColor, setEventColor] = useState<string>('#2563eb');

  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [status, setStatus] = useState<LessonStatus>('programmata');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  
  // Didactic diary & repertoire states (for lessons)
  const [lessonRating, setLessonRating] = useState<LessonRating | undefined>('ottimo');
  const [songsStudied, setSongsStudied] = useState<string[]>([]);
  const [topicsCovered, setTopicsCovered] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [homework, setHomework] = useState('');
  const [customSongInput, setCustomSongInput] = useState('');

  const [showDeleteSeriesConfirm, setShowDeleteSeriesConfirm] = useState(false);
  const [showDeleteSingleConfirm, setShowDeleteSingleConfirm] = useState(false);

  // Check if this lesson is part of a recurring series
  const isRecurring = Boolean(lesson?.recurringSeriesId || lesson?.isRecurringInstance);
  const effectiveSeriesId = lesson?.recurringSeriesId;

  // Selected student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === studentId);
  }, [students, studentId]);

  // Count lessons in this series
  const seriesLessons = useMemo(() => {
    if (!lesson || !isRecurring) return [];
    if (effectiveSeriesId) {
      return lessons.filter((l) => l.recurringSeriesId === effectiveSeriesId);
    }
    return lessons.filter(
      (l) => l.isRecurringInstance && l.studentId === lesson.studentId && l.courseId === lesson.courseId
    );
  }, [lesson, isRecurring, effectiveSeriesId, lessons]);

  const seriesCount = seriesLessons.length > 0 ? seriesLessons.length : 1;

  useEffect(() => {
    if (lesson) {
      const type = lesson.eventType || (lesson.studentId || lesson.courseId ? 'lezione' : (lesson.eventCategory ? 'appuntamento' : 'lezione'));
      setEventType(type);
      setEventCategory(lesson.eventCategory || 'riunione');
      setEventColor(lesson.eventColor || '#2563eb');
      setTitle(lesson.title);
      setStudentId(lesson.studentId || '');
      setCourseId(lesson.courseId || '');
      setDate(lesson.date);
      setStartTime(lesson.startTime);
      setEndTime(lesson.endTime);
      setStatus(lesson.status);
      setRoom(lesson.room || '');
      setNotes(lesson.notes || lesson.description || '');
      setLessonRating(lesson.lessonRating || 'ottimo');
      setSongsStudied(lesson.songsStudied || []);
      setTopicsCovered(lesson.topicsCovered || '');
      setNextGoals(lesson.nextGoals || '');
      setHomework(lesson.homework || '');
    } else {
      setEventType(defaultEventType);
      setEventCategory('riunione');
      setEventColor('#2563eb');
      setTitle(defaultEventType === 'appuntamento' ? 'Riunione Docenti' : 'Lezione di Canto');
      setStudentId('');
      setCourseId('');
      setDate(new Date().toISOString().slice(0, 10));
      setStartTime('14:00');
      setEndTime('15:00');
      setStatus('programmata');
      setRoom(defaultEventType === 'appuntamento' ? 'Sede Scuola' : 'Aula Canto 1');
      setNotes('');
      setLessonRating('ottimo');
      setSongsStudied([]);
      setTopicsCovered('');
      setNextGoals('');
      setHomework('');
    }
    setCustomSongInput('');
    setShowDeleteSeriesConfirm(false);
    setShowDeleteSingleConfirm(false);
  }, [lesson, isOpen, defaultEventType]);

  if (!isOpen) return null;

  const handleToggleSong = (songTitle: string) => {
    if (songsStudied.includes(songTitle)) {
      setSongsStudied(songsStudied.filter((s) => s !== songTitle));
    } else {
      setSongsStudied([...songsStudied, songTitle]);
    }
  };

  const handleAddCustomSong = () => {
    const trimmed = customSongInput.trim();
    if (!trimmed) return;
    if (!songsStudied.includes(trimmed)) {
      setSongsStudied([...songsStudied, trimmed]);
    }
    setCustomSongInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const isGeneric = eventType === 'appuntamento';

    const lessonToSave: Lesson = {
      id: lesson?.id || `les-${Date.now()}`,
      academicYearId: lesson?.academicYearId || activeYearId,
      eventType,
      eventCategory: isGeneric ? eventCategory : undefined,
      eventColor: isGeneric ? eventColor : undefined,
      description: isGeneric ? notes.trim() : undefined,
      studentId: !isGeneric && studentId ? studentId : undefined,
      courseId: !isGeneric && courseId ? courseId : undefined,
      title: title.trim(),
      date,
      startTime,
      endTime,
      status,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      isRecurringInstance: lesson?.isRecurringInstance,
      recurringSeriesId: lesson?.recurringSeriesId,
      // Didactic fields only preserved if it's a lesson
      lessonRating: !isGeneric ? lessonRating : undefined,
      songsStudied: !isGeneric && songsStudied.length > 0 ? songsStudied : undefined,
      topicsCovered: !isGeneric && topicsCovered.trim() ? topicsCovered.trim() : undefined,
      nextGoals: !isGeneric && nextGoals.trim() ? nextGoals.trim() : undefined,
      homework: !isGeneric && homework.trim() ? homework.trim() : undefined,
    };

    onSave(lessonToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
        
        {/* Header with Type Toggle */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-xs ${
                eventType === 'appuntamento' ? 'bg-indigo-600' : 'bg-rose-600'
              }`}>
                {eventType === 'appuntamento' ? <Pin className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lesson 
                    ? (eventType === 'appuntamento' ? 'Modifica Appuntamento / Evento' : 'Modifica / Sposta Lezione')
                    : (eventType === 'appuntamento' ? 'Nuovo Appuntamento / Evento Generico' : 'Nuova Lezione nel Calendario')}
                </h3>
                <p className="text-xs text-slate-500">
                  {eventType === 'appuntamento'
                    ? 'Riunioni, impegni personali, scadenze ed eventi della scuola'
                    : 'Lezione didattica associata a corsi, allievi e diario musicale'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Type Switcher Pills */}
          {!lesson && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setEventType('lezione');
                  if (title === 'Riunione Docenti' || !title) setTitle('Lezione di Canto');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  eventType === 'lezione'
                    ? 'bg-white text-rose-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-rose-600" />
                <span>Lezione Allievo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEventType('appuntamento');
                  if (title === 'Lezione di Canto' || !title) setTitle('Riunione Docenti');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  eventType === 'appuntamento'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Pin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Appuntamento / Evento</span>
              </button>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* APPOINTMENT SPECIFIC: Category Selector */}
          {eventType === 'appuntamento' && (
            <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <label className="block text-xs font-bold text-indigo-950">
                Categoria Evento <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {EVENT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isCatSelected = eventCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setEventCategory(cat.id);
                        setEventColor(cat.color);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold text-left transition-all border flex items-center gap-2 cursor-pointer ${
                        isCatSelected
                          ? `${cat.bg} ${cat.border} ring-2 ring-indigo-400 shadow-xs`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Title Quick Presets for Appointments */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Suggerimenti rapidi oggetto:
                </span>
                <div className="flex flex-wrap gap-1">
                  {APPOINTMENT_TITLE_PRESETS.slice(0, 5).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTitle(preset)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-200 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Title / Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {eventType === 'appuntamento' ? 'Titolo / Oggetto Evento' : 'Titolo / Descrizione Lezione'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === 'appuntamento' ? 'Es. Riunione con Collegio Docenti' : 'Es. Lezione Canto Singolo - Leonardo Ferri'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
            />
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Stato
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['programmata', 'completata', 'assente', 'cancellata'] as LessonStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    status === st
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Student & Course (ONLY FOR LESSONS) */}
          {eventType === 'lezione' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Allievo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                  >
                    <option value="">Seleziona Allievo (opzionale)</option>
                    {students
                      .filter((s) => s.academicYearId === activeYearId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corso / Gruppo
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
            </div>
          )}

          {/* Date & Time */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <span className="text-xs font-bold text-amber-900 block">
              Giorno e Orario (Modificabile liberamente)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-rose-500 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ora Inizio
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Ora Fine
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 font-bold focus:outline-rose-500 bg-white"
                />
              </div>
            </div>
            {date && (
              <p className="text-[11px] text-amber-800">
                Data impostata: <strong>{formatDateWithDay(date)}</strong> dalle {startTime} alle {endTime}
              </p>
            )}
          </div>

          {/* Room / Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {eventType === 'appuntamento' ? 'Luogo / Sede / Aula (opzionale)' : 'Aula / Sede'}
            </label>
            <div className="relative">
              <DoorOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder={eventType === 'appuntamento' ? 'Es. Sala Riunioni / Teatro Comunale / Aula 2' : 'Es. Aula Canto 1 (Pianoforte)'}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Notes / Description for Appointment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {eventType === 'appuntamento' ? 'Descrizione / Note Evento' : 'Note Generali'}
            </label>
            <textarea
              rows={eventType === 'appuntamento' ? 3 : 2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={eventType === 'appuntamento' ? 'Dettagli dell incontro, ordine del giorno, materiali da portare...' : 'Note libere sulla lezione...'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
            />
          </div>

          {/* DIDACTIC DIARY FIELDS (SHOWN ONLY FOR LESSONS) */}
          {eventType === 'lezione' && (
            <>
              {/* Section: Valutazione & Andamento */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Andamento & Valutazione della Lezione
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { value: 'eccellente', label: 'Eccellente', color: 'bg-emerald-600 text-white' },
                    { value: 'ottimo', label: 'Ottimo', color: 'bg-teal-600 text-white' },
                    { value: 'buono', label: 'Buono', color: 'bg-blue-600 text-white' },
                    { value: 'sufficiente', label: 'Sufficiente', color: 'bg-amber-600 text-white' },
                    { value: 'da_rivedere', label: 'Da Consolidare', color: 'bg-rose-600 text-white' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setLessonRating(r.value as LessonRating)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg text-center transition-all border cursor-pointer ${
                        lessonRating === r.value
                          ? `${r.color} border-transparent shadow-2xs font-bold`
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section: Brani Studiati */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-rose-600" />
                    Brani Studiati in Questa Lezione
                  </label>
                  {selectedStudent && (
                    <span className="text-[11px] text-slate-500">
                      Repertorio di {selectedStudent.firstName}
                    </span>
                  )}
                </div>

                {selectedStudent && selectedStudent.studiedSongs && selectedStudent.studiedSongs.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.studiedSongs.map((song) => {
                      const isSelected = songsStudied.includes(song.title);
                      return (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() => handleToggleSong(song.title)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold shadow-2xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{song.title}</span>
                          {isSelected && <Check className="w-3 h-3 text-rose-600 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Selected songs chips */}
                {songsStudied.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    <span className="text-[11px] font-semibold text-slate-600">Selezionati:</span>
                    {songsStudied.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 text-[11px] font-bold"
                      >
                        {st}
                        <button
                          type="button"
                          onClick={() => handleToggleSong(st)}
                          className="text-rose-500 hover:text-rose-800 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Custom song manual input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSongInput}
                    onChange={(e) => setCustomSongInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSong();
                      }
                    }}
                    placeholder="Aggiungi altro brano affrontato..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSong}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Aggiungi
                  </button>
                </div>
              </div>

              {/* Section: Argomenti trattati */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  Argomenti e Tecniche Affrontate
                </label>
                <input
                  type="text"
                  value={topicsCovered}
                  onChange={(e) => setTopicsCovered(e.target.value)}
                  placeholder="Es. Riscaldamento vocale, appoggio diaframmatico, dizione sillabica"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              {/* Section: Compiti per casa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ListCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Compiti ed Esercizi per Casa
                </label>
                <input
                  type="text"
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="Es. 10 min respirazione con cannuccia + ripasso testo seconda strofa"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>
            </>
          )}

          {/* Delete options if editing existing event */}
          {lesson && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteSingleConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  {eventType === 'appuntamento' ? 'Elimina questo appuntamento' : 'Cancella solo questa lezione'}
                </button>

                {isRecurring && onDeleteSeries && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteSeriesConfirm(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Repeat className="w-3.5 h-3.5 text-rose-600" />
                    Elimina intera serie ricorrente {seriesCount > 1 ? `(${seriesCount} lezioni)` : ''}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer ${
                eventType === 'appuntamento' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {lesson 
                ? 'Salva Modifiche' 
                : (eventType === 'appuntamento' ? 'Crea Appuntamento' : 'Crea Lezione')}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal: Delete Entire Recurring Series */}
      {showDeleteSeriesConfirm && lesson && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Elimina intera serie ricorrente?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Stai per eliminare <strong className="text-rose-600">{seriesCount} {seriesCount === 1 ? 'lezione' : 'lezioni'}</strong> associate a questa serie ricorrente (inclusi tutti gli appuntamenti programmati e futuri).
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteSeriesConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteSeries) {
                    onDeleteSeries(effectiveSeriesId || lesson.id, lesson.id);
                  }
                  setShowDeleteSeriesConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sì, elimina tutte le {seriesCount} lezioni
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Event */}
      {showDeleteSingleConfirm && lesson && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {eventType === 'appuntamento' ? 'Elimina questo appuntamento?' : 'Cancella questa singola lezione?'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Verrà eliminato l evento del <strong>{formatDateLong(lesson.date)}</strong> ({lesson.startTime} - {lesson.endTime}): <em>{lesson.title}</em>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteSingleConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSingle(lesson.id);
                  setShowDeleteSingleConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sì, elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
