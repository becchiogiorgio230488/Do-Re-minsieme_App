import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  Clock, 
  Music, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Target, 
  ListCheck, 
  AlertCircle,
  Check,
  Tag
} from 'lucide-react';
import { Lesson, Student, Course, LessonStatus, LessonRating, StudiedSong } from '../../types';
import { formatDateWithDay, formatDateLong } from '../../utils/dateHelpers';

interface LessonDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lesson: Lesson, newSongToAddToRepertoire?: string) => void;
  lesson?: Lesson | null;
  student: Student;
  courses: Course[];
  activeYearId: string;
}

const RATINGS: { value: LessonRating; label: string; desc: string; color: string }[] = [
  { 
    value: 'eccellente', 
    label: 'Eccellente', 
    desc: 'Grandi progressi e massima resa', 
    color: 'bg-emerald-500 text-white' 
  },
  { 
    value: 'ottimo', 
    label: 'Ottimo', 
    desc: 'Obiettivi raggiunti con cura', 
    color: 'bg-teal-600 text-white' 
  },
  { 
    value: 'buono', 
    label: 'Buono', 
    desc: 'Lavoro regolare e buona risposta', 
    color: 'bg-blue-600 text-white' 
  },
  { 
    value: 'sufficiente', 
    label: 'Sufficiente', 
    desc: 'Da stimolare su costanza e ascolto', 
    color: 'bg-amber-500 text-white' 
  },
  { 
    value: 'da_rivedere', 
    label: 'Da Consolidare', 
    desc: 'Necessario riprendere le basi tecniche', 
    color: 'bg-rose-500 text-white' 
  },
];

const SUGGESTED_TOPICS = [
  'Riscaldamento vocale',
  'Respirazione diaframmatica',
  'Postura e rilassamento',
  'Vocalizzi per estensione',
  'Passaggio di registro',
  'Intonazione e orecchio',
  'Dizione e articolazione',
  'Dinamiche piano/forte',
  'Interpretazione ed espressività',
  'Uso del microfono',
  'Ritmo e solfeggio',
];

export const LessonDiaryModal: React.FC<LessonDiaryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  lesson,
  student,
  courses,
  activeYearId,
}) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [status, setStatus] = useState<LessonStatus>('completata');
  const [courseId, setCourseId] = useState('');
  const [lessonRating, setLessonRating] = useState<LessonRating | undefined>('ottimo');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [customSongInput, setCustomSongInput] = useState('');
  const [saveCustomToRepertoire, setSaveCustomToRepertoire] = useState(true);
  const [topicsCovered, setTopicsCovered] = useState('');
  const [notes, setNotes] = useState('');
  const [nextGoals, setNextGoals] = useState('');
  const [homework, setHomework] = useState('');

  // Load lesson or initialize defaults
  useEffect(() => {
    if (lesson) {
      setDate(lesson.date);
      setStartTime(lesson.startTime);
      setEndTime(lesson.endTime);
      setStatus(lesson.status || 'completata');
      setCourseId(lesson.courseId || student.courseIds?.[0] || '');
      setLessonRating(lesson.lessonRating || 'ottimo');
      setSelectedSongs(lesson.songsStudied || []);
      setTopicsCovered(lesson.topicsCovered || '');
      setNotes(lesson.notes || '');
      setNextGoals(lesson.nextGoals || '');
      setHomework(lesson.homework || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setDate(today);
      setStartTime('14:00');
      setEndTime('15:00');
      setStatus('completata');
      setCourseId(student.courseIds?.[0] || '');
      setLessonRating('ottimo');
      setSelectedSongs([]);
      setTopicsCovered('');
      setNotes('');
      setNextGoals('');
      setHomework('');
    }
    setCustomSongInput('');
  }, [lesson, student, isOpen]);

  if (!isOpen) return null;

  const studentRepertoire = student.studiedSongs || [];

  const handleToggleSong = (songTitle: string) => {
    if (selectedSongs.includes(songTitle)) {
      setSelectedSongs(selectedSongs.filter((s) => s !== songTitle));
    } else {
      setSelectedSongs([...selectedSongs, songTitle]);
    }
  };

  const handleAddCustomSong = () => {
    const trimmed = customSongInput.trim();
    if (!trimmed) return;
    if (!selectedSongs.includes(trimmed)) {
      setSelectedSongs([...selectedSongs, trimmed]);
    }
    setCustomSongInput('');
  };

  const handleAddTopicChip = (topic: string) => {
    if (!topicsCovered) {
      setTopicsCovered(topic);
    } else if (!topicsCovered.toLowerCase().includes(topic.toLowerCase())) {
      setTopicsCovered(`${topicsCovered}, ${topic}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    const courseObj = courses.find((c) => c.id === courseId);
    const title = lesson?.title || `Lezione ${courseObj?.name || 'Canto'} - ${student.firstName} ${student.lastName}`;

    const updatedLesson: Lesson = {
      id: lesson?.id || `les-${Date.now()}`,
      academicYearId: lesson?.academicYearId || activeYearId,
      studentId: student.id,
      courseId: courseId || undefined,
      title,
      date,
      startTime,
      endTime,
      status,
      room: lesson?.room || 'Aula Canto 1',
      isRecurringInstance: lesson?.isRecurringInstance,
      recurringSeriesId: lesson?.recurringSeriesId,
      lessonRating,
      songsStudied: selectedSongs.length > 0 ? selectedSongs : undefined,
      topicsCovered: topicsCovered.trim() || undefined,
      notes: notes.trim() || undefined,
      nextGoals: nextGoals.trim() || undefined,
      homework: homework.trim() || undefined,
    };

    onSave(updatedLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-rose-50 via-amber-50/40 to-teal-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Diario Lezione · {student.firstName} {student.lastName}
              </h3>
              <p className="text-xs text-slate-500">
                {lesson ? 'Modifica o compila il report della lezione' : 'Nuova registrazione lezione e note storiche'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/30">
          
          {/* Section 1: Date, Time, Course & Status */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Data Lezione
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Orario
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-rose-500 bg-white"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-rose-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Corso Associato
                </label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
                >
                  <option value="">Seleziona corso...</option>
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

            {/* Attendance Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                Stato di Svolgimento / Presenza
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'completata', label: 'Completata / Presente', activeClass: 'bg-emerald-600 text-white' },
                  { value: 'programmata', label: 'Programmata', activeClass: 'bg-blue-600 text-white' },
                  { value: 'assente', label: 'Assente', activeClass: 'bg-rose-600 text-white' },
                  { value: 'recuperata', label: 'Recuperata', activeClass: 'bg-amber-600 text-white' },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setStatus(st.value as LessonStatus)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors border ${
                      status === st.value
                        ? `${st.activeClass} border-transparent shadow-2xs`
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Lesson Rating / Andamento */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Andamento & Valutazione della Lezione
              </label>
              <span className="text-[11px] text-slate-500">
                Come è andata questa singola lezione?
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setLessonRating(r.value)}
                  className={`p-2 rounded-xl text-center border text-xs transition-all flex flex-col justify-center items-center ${
                    lessonRating === r.value
                      ? `${r.color} border-current shadow-2xs font-bold ring-2 ring-slate-400/30`
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-xs">{r.label}</span>
                  <span className="text-[10px] opacity-80 mt-0.5 leading-tight line-clamp-1">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Studied Songs (Repertoire Selection & Quick Add) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-600" />
                Brani Studiati in Questa Lezione
              </label>
              <span className="text-[11px] text-slate-500">
                Seleziona i brani affrontati oggi
              </span>
            </div>

            {/* Repertoire selection pills */}
            {studentRepertoire.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {studentRepertoire.map((song) => {
                  const isSelected = selectedSongs.includes(song.title);
                  return (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => handleToggleSong(song.title)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50 text-rose-800 font-bold shadow-2xs ring-1 ring-rose-300'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <Music className={`w-3 h-3 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                      <span>{song.title}</span>
                      {song.artistOrComposer && (
                        <span className="text-[10px] opacity-70">({song.artistOrComposer})</span>
                      )}
                      {isSelected && <Check className="w-3 h-3 text-rose-600 shrink-0 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Nessun brano nel repertorio dell allievo. Aggiungine uno qui sotto:
              </p>
            )}

            {/* Selected songs list display */}
            {selectedSongs.length > 0 && (
              <div className="pt-1 flex items-center gap-1.5 flex-wrap text-xs text-slate-600">
                <span className="font-semibold text-slate-700 text-[11px]">Brani attivi per questa lezione:</span>
                {selectedSongs.map((songTitle) => (
                  <span
                    key={songTitle}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-100/70 text-rose-900 text-xs font-semibold"
                  >
                    {songTitle}
                    <button
                      type="button"
                      onClick={() => handleToggleSong(songTitle)}
                      className="text-rose-500 hover:text-rose-800 ml-0.5"
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
                placeholder="Digita il titolo di un altro brano..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSong}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Aggiungi
              </button>
            </div>
          </div>

          {/* Section 4: Topics Covered (Argomenti Trattati) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-600" />
              Argomenti Trattati & Tecniche
            </label>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleAddTopicChip(topic)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  + {topic}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={topicsCovered}
              onChange={(e) => setTopicsCovered(e.target.value)}
              placeholder="Es. Riscaldamento vocale, appoggio diaframmatico, passaggi di registro, dizione"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
            />
          </div>

          {/* Section 5: Free Lesson Notes (Cosa si è fatto) */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                Note Libere della Lezione (Cosa si è fatto)
              </label>
              <span className="text-[11px] text-slate-500">
                Diario personale del docente
              </span>
            </div>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scrivi liberamente tutto ciò che si è svolto durante la lezione: sensazioni dell'allievo, punti di forza emersi, difficoltà su note o passaggi specifici, correzioni posturali..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 resize-none leading-relaxed"
            />
          </div>

          {/* Section 6: Next Goals & Path Guidance (Come procedere col percorso del corso) */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-teal-700" />
                Come Procedere col Percorso del Corso · Prossimi Passi
              </label>
              <span className="text-[11px] text-teal-700">
                Continuità didattica
              </span>
            </div>
            <textarea
              rows={2}
              value={nextGoals}
              onChange={(e) => setNextGoals(e.target.value)}
              placeholder="Es. Nella prossima lezione riprendere il secondo ritornello; lavorare su dizione meno stretta; passare al secondo brano dopo aver fissato l'intonazione..."
              className="w-full p-2.5 rounded-xl border border-teal-200 text-xs text-slate-900 focus:outline-teal-600 bg-white resize-none"
            />
          </div>

          {/* Section 7: Homework / Compiti per la prossima volta */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ListCheck className="w-3.5 h-3.5 text-indigo-600" />
              Compiti & Esercizi Assegnati per Casa
            </label>
            <input
              type="text"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="Es. 10 min al giorno di respirazione con cannuccia + ripasso testo seconda strofa a memoria"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
            />
          </div>

          {/* Footer Save & Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Salva nel Diario Didattico
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
