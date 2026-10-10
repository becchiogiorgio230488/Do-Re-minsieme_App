import React, { useState, useMemo } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Music, 
  FileText, 
  Printer, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ExternalLink, 
  Edit2, 
  Trash2,
  BookOpen,
  Disc,
  Sparkles,
  Target,
  ListCheck,
  Search,
  Check,
  ArrowRight
} from 'lucide-react';
import { Student, Course, Payment, Lesson, StudiedSong, SongStatus } from '../../types';
import { formatDateShort, formatCurrency, formatDateLong, formatDateWithDay } from '../../utils/dateHelpers';
import { LessonDiaryModal } from '../diary/LessonDiaryModal';
import { SongModal } from '../diary/SongModal';
import { StudentDiaryPrintModal } from '../diary/StudentDiaryPrintModal';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  courses: Course[];
  payments: Payment[];
  lessons: Lesson[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string, deleteFutureLessons: boolean) => void;
  onStatusChange?: (student: Student, newStatus: 'attivo' | 'sospeso' | 'ritirato') => void;
  onViewDocument: (student: Student) => void;
  onNewPaymentForStudent: (student: Student) => void;
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment?: (paymentId: string) => void;
  onPrintReceipt: (payment: Payment) => void;
  onNewLessonForStudent: (student: Student) => void;
  onEditLesson: (lesson: Lesson) => void;
  onSaveStudent?: (student: Student) => void;
  onSaveLesson?: (lesson: Lesson) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  student,
  courses,
  payments,
  lessons,
  onEditStudent,
  onDeleteStudent,
  onStatusChange,
  onViewDocument,
  onNewPaymentForStudent,
  onEditPayment,
  onDeletePayment,
  onPrintReceipt,
  onNewLessonForStudent,
  onEditLesson,
  onSaveStudent,
  onSaveLesson,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'diary' | 'lessons' | 'courses' | 'payments'>('diary');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteFutureLessons, setDeleteFutureLessons] = useState(true);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  // Diary & Song modals state
  const [isLessonDiaryOpen, setIsLessonDiaryOpen] = useState(false);
  const [diaryLessonToEdit, setDiaryLessonToEdit] = useState<Lesson | null>(null);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState<StudiedSong | null>(null);
  const [isDiaryPrintOpen, setIsDiaryPrintOpen] = useState(false);
  const [songFilter, setSongFilter] = useState<'tutti' | SongStatus>('tutti');
  const [diarySearchQuery, setDiarySearchQuery] = useState('');
  const [songToDelete, setSongToDelete] = useState<StudiedSong | null>(null);

  // Filter student data and memoized values - ALL hooks must run before early return
  const enrolledCourses = student ? courses.filter((c) => student.courseIds?.includes(c.id)) : [];
  const studentPayments = student ? payments.filter((p) => p.studentId === student.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const totalPaid = studentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  
  const studentLessons = useMemo(() => {
    if (!student) return [];
    return lessons
      .filter((l) => l.studentId === student.id || (l.studentIds && l.studentIds.includes(student.id)))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [lessons, student]);

  const upcomingLessons = studentLessons.filter((l) => l.date >= new Date().toISOString().slice(0, 10));
  const pastLessons = studentLessons.filter((l) => l.date < new Date().toISOString().slice(0, 10));

  const studiedSongs = student?.studiedSongs || [];
  const completedLessons = studentLessons.filter((l) => l.status === 'completata');

  // Filtered songs
  const filteredSongs = useMemo(() => {
    if (!student) return [];
    if (songFilter === 'tutti') return studiedSongs;
    return studiedSongs.filter((s) => s.status === songFilter);
  }, [studiedSongs, songFilter, student]);

  // Lessons sorted reverse chronological (latest first)
  const sortedLessonsForDiary = useMemo(() => {
    return [...studentLessons].sort((a, b) => b.date.localeCompare(a.date));
  }, [studentLessons]);

  // Filtered lessons for diary by search query
  const filteredDiaryLessons = useMemo(() => {
    if (!diarySearchQuery.trim()) return sortedLessonsForDiary;
    const q = diarySearchQuery.toLowerCase();
    return sortedLessonsForDiary.filter((l) => {
      const matchNotes = l.notes?.toLowerCase().includes(q);
      const matchTopics = l.topicsCovered?.toLowerCase().includes(q);
      const matchGoals = l.nextGoals?.toLowerCase().includes(q);
      const matchHomework = l.homework?.toLowerCase().includes(q);
      const matchSongs = l.songsStudied?.some((s) => s.toLowerCase().includes(q));
      const matchDate = l.date.includes(q);
      return matchNotes || matchTopics || matchGoals || matchHomework || matchSongs || matchDate;
    });
  }, [sortedLessonsForDiary, diarySearchQuery]);

  if (!isOpen || !student) return null;

  // Song handlers
  const handleSaveSong = (savedSong: StudiedSong) => {
    const existing = student.studiedSongs || [];
    const isExisting = existing.some((s) => s.id === savedSong.id);
    const updatedSongs = isExisting
      ? existing.map((s) => (s.id === savedSong.id ? savedSong : s))
      : [...existing, savedSong];
    const updatedStudent: Student = { ...student, studiedSongs: updatedSongs };
    if (onSaveStudent) {
      onSaveStudent(updatedStudent);
    }
  };

  const handleDeleteSong = (songId: string) => {
    const existing = student.studiedSongs || [];
    const updatedSongs = existing.filter((s) => s.id !== songId);
    const updatedStudent: Student = { ...student, studiedSongs: updatedSongs };
    if (onSaveStudent) {
      onSaveStudent(updatedStudent);
    }
    setSongToDelete(null);
  };

  const handleAdvanceSongStatus = (song: StudiedSong) => {
    const nextStatusMap: Record<SongStatus, SongStatus> = {
      in_programma: 'in_studio',
      in_studio: 'perfezionamento',
      perfezionamento: 'completato',
      completato: 'in_studio',
    };
    const nextStatus = nextStatusMap[song.status];
    handleSaveSong({
      ...song,
      status: nextStatus,
      completedDate: nextStatus === 'completato' ? new Date().toISOString().slice(0, 10) : song.completedDate,
    });
  };

  // Lesson diary save handler
  const handleSaveLessonFromDiary = (savedLesson: Lesson, newSongToAddToRepertoire?: string) => {
    if (onSaveLesson) {
      onSaveLesson(savedLesson);
    }
    if (newSongToAddToRepertoire && onSaveStudent) {
      const existing = student.studiedSongs || [];
      const trimmed = newSongToAddToRepertoire.trim();
      if (!existing.some((s) => s.title.toLowerCase() === trimmed.toLowerCase())) {
        const newSong: StudiedSong = {
          id: `song-${Date.now()}`,
          title: trimmed,
          status: 'in_studio',
          startedDate: savedLesson.date,
        };
        onSaveStudent({ ...student, studiedSongs: [...existing, newSong] });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header Profile Banner */}
        <div className="p-6 bg-linear-to-r from-rose-50 via-amber-50/50 to-teal-50 border-b border-slate-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                {student.firstName[0]}
                {student.lastName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900">
                    {student.firstName} {student.lastName}
                  </h2>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      student.status === 'attivo'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {student.status.toUpperCase()}
                  </span>
                  {student.isMinor && (
                    <span className="text-[11px] font-medium bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Minorenne
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                  {student.phone && (
                    <a href={`tel:${student.phone}`} className="hover:text-rose-600 flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5" />
                      {student.phone}
                    </a>
                  )}
                  {student.email && (
                    <a href={`mailto:${student.email}`} className="hover:text-rose-600 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {student.email}
                    </a>
                  )}
                  {student.city && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {student.city}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
              <button
                onClick={() => onEditStudent(student)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                Modifica Anagrafica
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
                title="Elimina definitivamente l'anagrafica allievo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                Elimina Allievo
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/60">
            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Corsi Frequenta</span>
              <span className="text-base font-bold text-slate-900">
                {enrolledCourses.length} {enrolledCourses.length === 1 ? 'corso' : 'corsi'}
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Brani in Repertorio</span>
              <span className="text-base font-bold text-rose-600 tabular-nums">
                {(student.studiedSongs || []).length} brani
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Lezioni Svolte</span>
              <span className="text-base font-bold text-teal-700 tabular-nums">
                {studentLessons.filter((l) => l.status === 'completata').length} <span className="text-xs font-normal text-slate-500">/ {studentLessons.length}</span>
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Totale Versato</span>
              <span className="text-base font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('diary')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'diary'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Diario Didattico & Brani ({(student.studiedSongs || []).length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendario Lezioni ({studentLessons.length})
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Panoramica & Documenti
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'courses'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Corsi ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pagamenti ({studentPayments.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">

          {/* TAB: DIARIO DIDATTICO & REPERTORIO */}
          {activeTab === 'diary' && (
            <div className="space-y-6">
              {/* Header Actions bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-rose-600" />
                    Diario Didattico & Repertorio di {student.firstName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Traccia i brani di studio, registra ogni singola lezione e annota liberamente progressi e note pedagogiche.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSongToEdit(null);
                      setIsSongModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                    Aggiungi Brano
                  </button>
                  <button
                    onClick={() => {
                      setDiaryLessonToEdit(null);
                      setIsLessonDiaryOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Registra Lezione
                  </button>
                  <button
                    onClick={() => setIsDiaryPrintOpen(true)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="Stampa Scheda Diario & Repertorio"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SEZIONE 1: REPERTORIO & BRANI DI STUDIO */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Music className="w-4 h-4 text-rose-600" />
                      Brani in Studio & Repertorio ({studiedSongs.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Repertorio musicale dell allievo, tonalità, indicazioni tecniche e stato di avanzamento
                    </p>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-xl">
                    {(['tutti', 'in_studio', 'perfezionamento', 'completato', 'in_programma'] as const).map((filterVal) => {
                      const count = filterVal === 'tutti' 
                        ? studiedSongs.length 
                        : studiedSongs.filter((s) => s.status === filterVal).length;
                      const labels: Record<string, string> = {
                        tutti: 'Tutti',
                        in_studio: 'In Studio',
                        perfezionamento: 'Rifinitura',
                        completato: 'Completati',
                        in_programma: 'In Programma',
                      };
                      return (
                        <button
                          key={filterVal}
                          onClick={() => setSongFilter(filterVal)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors whitespace-nowrap ${
                            songFilter === filterVal
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {labels[filterVal]} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {filteredSongs.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    <Music className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      {studiedSongs.length === 0 ? 'Nessun brano nel repertorio' : 'Nessun brano corrisponde al filtro selezionato'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                      Aggiungi i brani su cui lavora l allievo per averne traccia nello storico e richiamarli nelle lezioni.
                    </p>
                    <button
                      onClick={() => {
                        setSongToEdit(null);
                        setIsSongModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Aggiungi Primo Brano
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSongs.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{s.title}</span>
                              </h5>
                              {s.artistOrComposer && (
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {s.artistOrComposer}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => handleAdvanceSongStatus(s)}
                              title="Clicca per avanzare lo stato del brano"
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-transform hover:scale-105 shrink-0 ${
                                s.status === 'in_studio'
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : s.status === 'perfezionamento'
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : s.status === 'completato'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {s.status === 'in_studio' && 'In Studio'}
                              {s.status === 'perfezionamento' && 'In Rifinitura'}
                              {s.status === 'completato' && 'Completato'}
                              {s.status === 'in_programma' && 'In Programma'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 flex-wrap">
                            {s.keyOrTone && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                                🎵 {s.keyOrTone}
                              </span>
                            )}
                            {s.genre && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                {s.genre}
                              </span>
                            )}
                            {s.startedDate && (
                              <span>Dal {formatDateShort(s.startedDate)}</span>
                            )}
                          </div>

                          {s.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2 italic">
                              "{s.notes}"
                            </p>
                          )}
                        </div>

                        {/* Song card actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <button
                            onClick={() => {
                              const today = new Date().toISOString().slice(0, 10);
                              const existingToday = studentLessons.find((l) => l.date === today);
                              if (existingToday) {
                                setDiaryLessonToEdit({
                                  ...existingToday,
                                  songsStudied: existingToday.songsStudied ? [...existingToday.songsStudied, s.title] : [s.title],
                                });
                              } else {
                                setDiaryLessonToEdit(null);
                              }
                              setIsLessonDiaryOpen(true);
                            }}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                          >
                            <BookOpen className="w-3 h-3" />
                            Registra Lezione su questo brano
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSongToEdit(s);
                                setIsSongModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Modifica brano"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setSongToDelete(s)}
                              className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                              title="Elimina brano dal repertorio"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEZIONE 2: DIARIO STORICO DELLE LEZIONI */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      Diario Storico Lezione per Lezione ({sortedLessonsForDiary.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Cronologia didattica dettagliata con note libere, brani lavorati e obiettivi futuri
                    </p>
                  </div>

                  {/* Search query input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={diarySearchQuery}
                      onChange={(e) => setDiarySearchQuery(e.target.value)}
                      placeholder="Cerca in note, brani o argomenti..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                {filteredDiaryLessons.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      {diarySearchQuery ? 'Nessuna voce trovata per la ricerca' : 'Nessuna lezione registrata in calendario'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
                      Compila la prima voce nel diario per iniziare lo storico didattico di {student.firstName}.
                    </p>
                    <button
                      onClick={() => {
                        setDiaryLessonToEdit(null);
                        setIsLessonDiaryOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Registra Prima Lezione nel Diario
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDiaryLessons.map((l) => {
                      const hasDiaryData = Boolean(l.notes || l.songsStudied?.length || l.topicsCovered || l.nextGoals || l.homework);
                      return (
                        <div
                          key={l.id}
                          className={`p-4 rounded-xl border transition-all ${
                            hasDiaryData
                              ? 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                              : 'bg-slate-50/60 border-dashed border-slate-200'
                          }`}
                        >
                          {/* Lesson Entry Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200 shrink-0">
                                <Calendar className="w-4 h-4 text-teal-700" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">
                                    {formatDateWithDay(l.date)}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-500">
                                    ore {l.startTime} - {l.endTime}
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      l.status === 'completata'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : l.status === 'programmata'
                                        ? 'bg-blue-100 text-blue-800'
                                        : l.status === 'assente'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {l.status}
                                  </span>
                                  {l.room && (
                                    <span className="text-[10px] text-slate-400">· {l.room}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              {l.lessonRating && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border capitalize ${
                                    l.lessonRating === 'eccellente'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : l.lessonRating === 'ottimo'
                                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                                      : l.lessonRating === 'buono'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : l.lessonRating === 'sufficiente'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  ★ {l.lessonRating.replace('_', ' ')}
                                </span>
                              )}
                              <button
                                onClick={() => {
                                  setDiaryLessonToEdit(l);
                                  setIsLessonDiaryOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Edit2 className="w-3 h-3 text-slate-500" />
                                <span>{hasDiaryData ? 'Modifica Diario' : 'Compila Diario'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Studied songs chips */}
                          {l.songsStudied && l.songsStudied.length > 0 && (
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                                <Music className="w-3 h-3" />
                                Brani studiati:
                              </span>
                              {l.songsStudied.map((sTitle) => (
                                <span
                                  key={sTitle}
                                  className="text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 px-2 py-0.5 rounded-md"
                                >
                                  {sTitle}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Topics Covered */}
                          {l.topicsCovered && (
                            <div className="mt-2 text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">Argomenti & Tecnica: </span>
                              <span>{l.topicsCovered}</span>
                            </div>
                          )}

                          {/* Free Notes */}
                          {l.notes && (
                            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800">
                              <span className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                                Cosa si è fatto durante la lezione
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed">{l.notes}</p>
                            </div>
                          )}

                          {/* Next goals & pedagogical trajectory */}
                          {l.nextGoals && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-950">
                              <span className="text-[11px] font-bold text-teal-800 block mb-0.5 flex items-center gap-1">
                                <Target className="w-3 h-3 text-teal-600" />
                                Come procedere col percorso · Prossimi passi
                              </span>
                              <p className="whitespace-pre-wrap leading-relaxed">{l.nextGoals}</p>
                            </div>
                          )}

                          {/* Homework */}
                          {l.homework && (
                            <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
                              <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <ListCheck className="w-3.5 h-3.5 text-indigo-500" />
                                Compiti assegnati:
                              </span>
                              <span className="italic">{l.homework}</span>
                            </div>
                          )}

                          {/* Empty state for uncompiled lesson */}
                          {!hasDiaryData && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                              <span>Nessuna nota registrata nel diario per questa lezione.</span>
                              <button
                                onClick={() => {
                                  setDiaryLessonToEdit(l);
                                  setIsLessonDiaryOpen(true);
                                }}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                              >
                                + Scrivi note adesso
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Registration Sheet Document Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    Foglio di Iscrizione all Anno Accademico
                  </h4>
                  {student.registrationSheet ? (
                    <button
                      onClick={() => onViewDocument(student)}
                      className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Visualizza Documento
                    </button>
                  ) : null}
                </div>

                {student.registrationSheet ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {student.registrationSheet.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Caricato il {student.registrationSheet.uploadDate} · {(student.registrationSheet.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      Allegato Presente
                    </span>
                  </div>
                ) : (
                  <div className="text-center py-5 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-xs text-slate-500 mb-2">
                      Nessun modulo di iscrizione firmato ancora allegato per questo allievo.
                    </p>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
                    >
                      Carica ora il foglio di iscrizione (PDF o Immagine)
                    </button>
                  </div>
                )}
              </div>

              {/* Personal & Parent info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Dati Anagrafici
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Data di nascita:</span>
                      <span className="font-semibold text-slate-900">{formatDateLong(student.birthDate || '') || 'Non specificata'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Codice Fiscale:</span>
                      <span className="font-mono font-semibold text-slate-900">{student.fiscalCode || 'Non inserito'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Indirizzo:</span>
                      <span className="font-medium text-slate-800">{student.address ? `${student.address}, ${student.city || ''}` : 'Non inserito'}</span>
                    </div>
                  </div>
                </div>

                {student.isMinor && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Genitore / Tutore Legale
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Nome Genitore:</span>
                        <span className="font-bold text-slate-900">{student.parentName || 'Non specificato'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Telefono:</span>
                        <span className="font-semibold text-slate-900">{student.parentPhone || 'Non specificato'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-medium text-slate-800">{student.parentEmail || 'Non specificata'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">C.F. per Ricevuta:</span>
                        <span className="font-mono font-semibold text-slate-900">{student.parentFiscalCode || 'Non inserito'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {student.notes && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Note Didattiche & Organizzative
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    {student.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CORSI FREQUENTA */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Corsi Attivi per {student.firstName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gruppi e lezioni a cui è attualmente iscritto nell anno accademico.
                  </p>
                </div>
                <button
                  onClick={() => onEditStudent(student)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  Modifica Iscrizioni Corsi
                </button>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Music className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">Nessun corso assegnato</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Assegna questo allievo a una lezione di canto, coro o musica-gioco.
                  </p>
                  <button
                    onClick={() => onEditStudent(student)}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                  >
                    Assegna Corso
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {enrolledCourses.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-4 h-12 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {c.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 font-medium">
                            {c.room && <span>Aula: {c.room}</span>}
                            {c.defaultTimeSlot && <span>Orario consueto: {c.defaultTimeSlot}</span>}
                            {c.defaultMonthlyRate && (
                              <span className="text-rose-600 font-bold">
                                Quota: € {c.defaultMonthlyRate}/mese
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STATO PAGAMENTI & RICEVUTE */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Riepilogo Pagamenti e Ricevute Progressive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tutte le ricevute emesse per {student.firstName} con n° progressivo.
                  </p>
                </div>
                <button
                  onClick={() => onNewPaymentForStudent(student)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Registra Pagamento
                </button>
              </div>

              {/* Total Card */}
              <div className="p-4 bg-linear-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-rose-900">Incassato Anno Corrente</span>
                  <p className="text-2xl font-black text-rose-600 tabular-nums">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <p className="font-semibold">{studentPayments.length} Ricevute Emesse</p>
                  <p className="text-[11px] text-slate-500">Progressivo numerato e certificato</p>
                </div>
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">Nessun pagamento registrato</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Registra la prima quota o iscrizione per rilasciare la ricevuta numerata al genitore.
                  </p>
                  <button
                    onClick={() => onNewPaymentForStudent(student)}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                  >
                    Registra Primo Pagamento
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold uppercase leading-none">N°</span>
                          <span className="text-xs font-black">{p.receiptNumber}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              Ricevuta {p.receiptCode}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              · {formatDateShort(p.date)}
                            </span>
                            {p.method === 'satispay' ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                Satispay
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Contanti
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                            {p.description}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Intestata a: {p.payerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black text-rose-600 tabular-nums mr-1">
                          {formatCurrency(p.amount)}
                        </span>
                        {onEditPayment && (
                          <button
                            onClick={() => onEditPayment(p)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Modifica questo pagamento"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Modifica</span>
                          </button>
                        )}
                        <button
                          onClick={() => onPrintReceipt(p)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Stampa ricevuta da lasciare al genitore"
                        >
                          <Printer className="w-3.5 h-3.5 text-rose-600" />
                          <span className="hidden sm:inline">Stampa</span>
                        </button>
                        {onDeletePayment && (
                          <button
                            onClick={() => setPaymentToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Elimina ricevuta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LEZIONI PROGRAMMATE */}
          {activeTab === 'lessons' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Calendario Lezioni per {student.firstName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualizza, sposta o modifica i singoli appuntamenti programmati.
                  </p>
                </div>
                <button
                  onClick={() => onNewLessonForStudent(student)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Pianifica Lezione
                </button>
              </div>

              {studentLessons.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                  <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-800">Nessuna lezione in calendario</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Pianifica una lezione singola o una ricorrenza settimanale (es. tutti i martedì dalle 14:00 alle 15:00).
                  </p>
                  <button
                    onClick={() => onNewLessonForStudent(student)}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
                  >
                    Programma Ora
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Upcoming section */}
                  {upcomingLessons.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Prossime Lezioni ({upcomingLessons.length})
                      </h4>
                      <div className="space-y-2">
                        {upcomingLessons.map((l) => (
                          <div
                            key={l.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex flex-col items-center justify-center font-bold shrink-0 border border-teal-200">
                                <span className="text-[10px] uppercase font-semibold leading-none">
                                  {formatDateShort(l.date).slice(3, 5)}/{formatDateShort(l.date).slice(0, 2)}
                                </span>
                                <span className="text-xs mt-0.5">{l.startTime}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-slate-900">{l.title}</h5>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      l.status === 'programmata'
                                        ? 'bg-blue-100 text-blue-800'
                                        : l.status === 'completata'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {l.status}
                                  </span>
                                  {l.isRecurringInstance && (
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      Ricorrente
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{formatDateLong(l.date)}</span>
                                  <span>·</span>
                                  <span>{l.startTime} - {l.endTime}</span>
                                  {l.room && (
                                    <>
                                      <span>·</span>
                                      <span>{l.room}</span>
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setDiaryLessonToEdit(l);
                                  setIsLessonDiaryOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                                title="Apri o compila il diario didattico di questa lezione"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                                <span className="hidden sm:inline">Diario</span>
                              </button>
                              <button
                                onClick={() => onEditLesson(l)}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                                title="Sposta, modifica orario o cancella solo questa lezione"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Modifica / Sposta</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past lessons */}
                  {pastLessons.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Lezioni Passate ({pastLessons.length})
                      </h4>
                      <div className="space-y-2 opacity-90">
                        {pastLessons.map((l) => (
                          <div
                            key={l.id}
                            className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-bold text-slate-800">{l.title}</p>
                                  {l.lessonRating && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                                      {l.lessonRating}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  {formatDateLong(l.date)} ore {l.startTime} - {l.endTime}
                                  {l.songsStudied && l.songsStudied.length > 0 && (
                                    <span className="text-rose-600 font-medium ml-2">
                                      · 🎵 {l.songsStudied.join(', ')}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setDiaryLessonToEdit(l);
                                  setIsLessonDiaryOpen(true);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1"
                                title="Visualizza o modifica il diario didattico"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Diario</span>
                              </button>
                              <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                                {l.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Elimina questa anagrafica
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>

      {/* Confirmation Dialog Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Elimina Anagrafica Allievo
                </h3>
                <p className="text-xs text-slate-500">
                  {student.firstName} {student.lastName}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Vuoi cancellare definitivamente o impostare come ritirato?
              </div>
              <p className="text-[11px] leading-relaxed">
                Se l allievo ha interrotto il corso o si è trasferito, puoi impostare il suo stato su <strong>"Sospeso"</strong> o <strong>"Ritirato"</strong> per preservare lo storico dei pagamenti e delle lezioni passate.
              </p>
            </div>

            {/* Ask whether to delete future scheduled lessons */}
            {upcomingLessons.length > 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteFutureLessons}
                    onChange={(e) => setDeleteFutureLessons(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-rose-600 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Cancella anche le {upcomingLessons.length} lezioni future già programmate
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rimuove automaticamente gli appuntamenti futuri di {student.firstName} dal calendario per liberare l aula e gli orari.
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Nessuna lezione futura programmata a calendario per questo allievo.
              </p>
            )}

            <div className="space-y-2 pt-2">
              {onStatusChange && student.status !== 'sospeso' && (
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(student, 'sospeso');
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Imposta come "Sospeso" (Conserva lo Storico)
                </button>
              )}

              {onStatusChange && student.status !== 'ritirato' && (
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(student, 'ritirato');
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Imposta come "Ritirato" (Conserva lo Storico)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(student.id, deleteFutureLessons);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-4 h-4" />
                Elimina Definitivamente l Anagrafica
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

      {/* Delete Payment Confirmation Modal (In-App) */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-rose-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Elimina Ricevuta {paymentToDelete.receiptCode}?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Confermi di voler rimuovere questa ricevuta dall&apos;elenco pagamenti di {student.firstName}?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Ricevuta:</span>
                <span className="font-mono font-bold text-slate-800">{paymentToDelete.receiptCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Data:</span>
                <span className="font-medium text-slate-800">{formatDateShort(paymentToDelete.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Importo:</span>
                <span className="font-black text-rose-600">{formatCurrency(paymentToDelete.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Causale:</span>
                <span className="font-medium text-slate-700 truncate max-w-[180px]">{paymentToDelete.description}</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200/60 font-medium text-center">
              L&apos;importo verrà ricalcolato dal totale versato. L&apos;operazione non può essere annullata.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPaymentToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePayment) {
                    onDeletePayment(paymentToDelete.id);
                  }
                  setPaymentToDelete(null);
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sì, Elimina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Song Confirm Dialog */}
      {songToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Rimuovere &ldquo;{songToDelete.title}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Il brano verrà rimosso dal repertorio attivo di {student.firstName}. Le note passate nelle lezioni rimarranno conservate nello storico.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSongToDelete(null)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSong(songToDelete.id)}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Elimina Brano
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Diary Modal */}
      <LessonDiaryModal
        isOpen={isLessonDiaryOpen}
        onClose={() => {
          setIsLessonDiaryOpen(false);
          setDiaryLessonToEdit(null);
        }}
        onSave={handleSaveLessonFromDiary}
        lesson={diaryLessonToEdit}
        student={student}
        courses={courses}
        activeYearId={student.academicYearId}
      />

      {/* Song Modal */}
      <SongModal
        isOpen={isSongModalOpen}
        onClose={() => {
          setIsSongModalOpen(false);
          setSongToEdit(null);
        }}
        onSave={handleSaveSong}
        song={songToEdit}
        studentName={`${student.firstName} ${student.lastName}`}
      />

      {/* Diary Print Modal */}
      <StudentDiaryPrintModal
        isOpen={isDiaryPrintOpen}
        onClose={() => setIsDiaryPrintOpen(false)}
        student={student}
        lessons={studentLessons}
        courses={courses}
      />
    </div>
  );
};
