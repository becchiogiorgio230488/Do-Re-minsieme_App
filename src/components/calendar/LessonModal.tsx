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
  ArrowRight, 
  Repeat,
  Sparkles,
  BookOpen,
  Target,
  ListCheck,
  Check,
  Plus
} from 'lucide-react';
import { Lesson, Student, Course, LessonStatus, LessonRating } from '../../types';
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
}

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
}) => {
  const [title, setTitle] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [status, setStatus] = useState<LessonStatus>('programmata');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  
  // Didactic diary & repertoire states
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
    // Fallback if seriesId wasn't stored but isRecurringInstance is true
    return lessons.filter(
      (l) => l.isRecurringInstance && l.studentId === lesson.studentId && l.courseId === lesson.courseId
    );
  }, [lesson, isRecurring, effectiveSeriesId, lessons]);

  const seriesCount = seriesLessons.length > 0 ? seriesLessons.length : 1;

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setStudentId(lesson.studentId || '');
      setCourseId(lesson.courseId || '');
      setDate(lesson.date);
      setStartTime(lesson.startTime);
      setEndTime(lesson.endTime);
      setStatus(lesson.status);
      setRoom(lesson.room || '');
      setNotes(lesson.notes || '');
      setLessonRating(lesson.lessonRating || 'ottimo');
      setSongsStudied(lesson.songsStudied || []);
      setTopicsCovered(lesson.topicsCovered || '');
      setNextGoals(lesson.nextGoals || '');
      setHomework(lesson.homework || '');
    } else {
      setTitle('Lezione di Canto');
      setStudentId('');
      setCourseId('');
      setDate(new Date().toISOString().slice(0, 10));
      setStartTime('14:00');
      setEndTime('15:00');
      setStatus('programmata');
      setRoom('Aula Canto 1');
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
  }, [lesson, isOpen]);

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

    const lessonToSave: Lesson = {
      id: lesson?.id || `les-${Date.now()}`,
      academicYearId: lesson?.academicYearId || activeYearId,
      studentId: studentId || undefined,
      courseId: courseId || undefined,
      title: title.trim(),
      date,
      startTime,
      endTime,
      status,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      isRecurringInstance: lesson?.isRecurringInstance,
      recurringSeriesId: lesson?.recurringSeriesId,
      lessonRating,
      songsStudied: songsStudied.length > 0 ? songsStudied : undefined,
      topicsCovered: topicsCovered.trim() || undefined,
      nextGoals: nextGoals.trim() || undefined,
      homework: homework.trim() || undefined,
    };

    onSave(lessonToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lesson ? 'Modifica / Sposta Lezione' : 'Nuova Lezione'}
              </h3>
              <p className="text-xs text-slate-500">
                {lesson?.isRecurringInstance
                  ? 'Questa lezione fa parte di una ricorrenza settimanale. Modifiche o cancellazioni valgono per questo singolo appuntamento.'
                  : 'Dettagli appuntamento'}
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
          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Stato della Lezione
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(['programmata', 'completata', 'assente', 'recuperata'] as LessonStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 text-center rounded-xl text-xs font-semibold capitalize transition-colors ${
                    status === st
                      ? 'bg-rose-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titolo / Descrizione Lezione <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Lezione Canto Singolo - Leonardo Ferri"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Student & Course */}
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

          {/* Date & Time (Allows moving this single instance!) */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <span className="text-xs font-bold text-amber-900 block">
              Giorno e Orario dell Appuntamento (Spostabile liberamente)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Data Lezione
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-rose-500 bg-white"
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
                Data scelta: <strong>{formatDateWithDay(date)}</strong> dalle {startTime} alle {endTime}
              </p>
            )}
          </div>

          {/* Room */}
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
                placeholder="Es. Aula Canto 1 (Pianoforte)"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
            </div>
          </div>

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
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg text-center transition-all border ${
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
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

            {/* Current chosen songs tags */}
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
                      className="text-rose-500 hover:text-rose-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick add custom song */}
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
                placeholder="Aggiungi titolo di un altro brano..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSong}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi
              </button>
            </div>
          </div>

          {/* Section: Argomenti Trattati */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Argomenti Trattati & Tecnica
            </label>
            <input
              type="text"
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="Es. Riscaldamento vocale, appoggio diaframmatico, passaggi di registro, dizione"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
            />
          </div>

          {/* Section: Note didattiche libere (Cosa si è fatto) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Libere della Lezione (Cosa si è fatto durante la lezione)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scrivi liberamente cosa è stato svolto, progressi riscontrati, correzioni vocali o musicali..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 resize-none leading-relaxed"
            />
          </div>

          {/* Section: Come procedere col percorso / Prossimi passi */}
          <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1">
            <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-teal-700" />
              Come Procedere col Percorso del Corso · Prossimi Passi
            </label>
            <textarea
              rows={2}
              value={nextGoals}
              onChange={(e) => setNextGoals(e.target.value)}
              placeholder="Indicazioni pedagogiche: su cosa concentrarsi nella prossima lezione per proseguire al meglio..."
              className="w-full p-2.5 rounded-lg border border-teal-200 text-xs text-slate-900 focus:outline-teal-600 bg-white resize-none"
            />
          </div>

          {/* Section: Compiti per la prossima volta */}
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

          {/* Delete options if editing */}
          {lesson && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteSingleConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Cancella solo questa lezione
                </button>

                {isRecurring && onDeleteSeries && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteSeriesConfirm(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
            >
              {lesson ? 'Salva Modifiche / Spostamento' : 'Crea Lezione'}
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
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">{lesson.title}</p>
                  <p className="text-slate-500 text-[11px]">
                    Orario: {lesson.startTime} - {lesson.endTime}
                    {lesson.room ? ` · ${lesson.room}` : ''}
                  </p>
                  {effectiveSeriesId && (
                    <p className="text-[10px] text-slate-400 font-mono">
                      ID Serie: {effectiveSeriesId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteSeriesConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
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
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sì, elimina tutte le {seriesCount} lezioni
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Lesson */}
      {showDeleteSingleConfirm && lesson && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Cancella questa singola lezione?
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Verrà eliminata solo la lezione del <strong>{formatDateLong(lesson.date)}</strong> ({lesson.startTime} - {lesson.endTime}).
                </p>
                {isRecurring && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                    Le altre lezioni della serie ricorrente rimarranno invariate.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteSingleConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
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
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Sì, cancella lezione
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
