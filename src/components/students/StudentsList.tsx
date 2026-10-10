import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  FileText, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  Music, 
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Student, Course, Payment, Lesson } from '../../types';
import { formatCurrency } from '../../utils/dateHelpers';

interface StudentsListProps {
  students: Student[];
  courses: Course[];
  payments: Payment[];
  lessons: Lesson[];
  activeYearId: string;
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string, deleteFutureLessons: boolean) => void;
  onStatusChange?: (student: Student, newStatus: 'attivo' | 'sospeso' | 'ritirato') => void;
  onNewStudent: () => void;
  onViewDocument: (student: Student) => void;
  onNewPayment: (student: Student) => void;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  students,
  courses,
  payments,
  lessons,
  activeYearId,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  onStatusChange,
  onNewStudent,
  onViewDocument,
  onNewPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteFutureLessons, setDeleteFutureLessons] = useState(true);

  // Filter students for active academic year
  const yearStudents = useMemo(() => {
    return students.filter((s) => s.academicYearId === activeYearId);
  }, [students, activeYearId]);

  const filteredStudents = useMemo(() => {
    return yearStudents.filter((student) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(query) ||
        (student.phone && student.phone.includes(query)) ||
        (student.email && student.email.toLowerCase().includes(query)) ||
        (student.fiscalCode && student.fiscalCode.toLowerCase().includes(query)) ||
        (student.parentName && student.parentName.toLowerCase().includes(query));

      const matchesCourse =
        selectedCourseId === 'all' || student.courseIds?.includes(selectedCourseId);

      const matchesStatus =
        statusFilter === 'all' || student.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [yearStudents, searchTerm, selectedCourseId, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Anagrafica Allievi
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {filteredStudents.length} iscritti
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestisci schede anagrafiche, moduli di iscrizione firmati, corsi assegnati e stato pagamenti per l A.S. {activeYearId}.
          </p>
        </div>

        <button
          onClick={onNewStudent}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuovo Allievo
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per nome, cognome, genitore, telefono, codice fiscale..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-rose-500 focus:border-rose-500 bg-slate-50/50"
            />
          </div>

          {/* Course & Status selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2 py-1 outline-none cursor-pointer"
              >
                <option value="all">Tutti i Corsi</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 px-2 py-1 outline-none cursor-pointer"
              >
                <option value="all">Tutti gli Stati</option>
                <option value="attivo">Attivo</option>
                <option value="sospeso">Sospeso</option>
                <option value="ritirato">Ritirato</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center border border-slate-200 rounded-xl overflow-hidden p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Griglia
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tabella
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nessun allievo trovato</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Non ci sono allievi registrati per l anno scolastico {activeYearId} corrispondenti ai filtri attuali.
          </p>
          <button
            onClick={onNewStudent}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crea Nuova Anagrafica
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const studentCourses = courses.filter((c) => student.courseIds?.includes(c.id));
            const studentPayments = payments.filter((p) => p.studentId === student.id);
            const totalPaid = studentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
            const upcomingLessons = lessons.filter(
              (l) => (l.studentId === student.id || (l.studentIds && l.studentIds.includes(student.id))) &&
                     l.date >= new Date().toISOString().slice(0, 10)
            );

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Card top */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold text-base shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        {student.firstName[0]}
                        {student.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-[11px] text-slate-500 truncate">
                          {student.isMinor && student.parentName
                            ? `Genitore: ${student.parentName}`
                            : student.phone || student.email || 'Nessun recapito'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        student.status === 'attivo'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  {/* Enrolled Courses Badges */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Music className="w-3 h-3 text-slate-400" />
                      Corsi Frequentati:
                    </p>
                    {studentCourses.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {studentCourses.map((c) => (
                          <span
                            key={c.id}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1"
                            style={{
                              backgroundColor: `${c.color}15`,
                              color: c.color,
                              borderColor: `${c.color}30`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            {c.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Nessun corso assegnato
                      </span>
                    )}
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Totale Pagato</span>
                      <span className="text-xs font-bold text-rose-600 tabular-nums">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prossime Lezioni</span>
                      <span className="text-xs font-bold text-slate-800 tabular-nums flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-cyan-600" />
                        {upcomingLessons.length} in programma
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card footer: Registration sheet badge & quick action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {student.registrationSheet ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDocument(student);
                      }}
                      className="text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Foglio Iscrizione
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Senza modulo
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewPayment(student);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Registra Pagamento"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>
                    {onDeleteStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete(student);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Elimina allievo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform ml-1">
                      Scheda <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Allievo</th>
                  <th className="py-3 px-4">Recapiti</th>
                  <th className="py-3 px-4">Corsi Assegnati</th>
                  <th className="py-3 px-4">Foglio Iscrizione</th>
                  <th className="py-3 px-4 text-right">Pagamenti</th>
                  <th className="py-3 px-4 text-center">Stato</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const studentCourses = courses.filter((c) => student.courseIds?.includes(c.id));
                  const studentPayments = payments.filter((p) => p.studentId === student.id);
                  const totalPaid = studentPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {student.firstName} {student.lastName}
                        {student.isMinor && (
                          <span className="ml-1.5 text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">
                            Minorenne
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{student.phone || student.parentPhone || '-'}</div>
                        <div className="text-[10px] text-slate-400">{student.email || student.parentEmail || ''}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {studentCourses.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${c.color}20`, color: c.color }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {student.registrationSheet ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDocument(student);
                            }}
                            className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200"
                          >
                            <FileText className="w-3 h-3" />
                            Presente
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Non allegato</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 tabular-nums">
                        {formatCurrency(totalPaid)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                            student.status === 'attivo'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(student);
                            }}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Apri Scheda Completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onDeleteStudent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setStudentToDelete(student);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Elimina allievo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Overlay for deleting a student */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
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
                  {studentToDelete.firstName} {studentToDelete.lastName}
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
            {(() => {
              const upcomingCount = studentToDelete ? lessons.filter(
                (l) => (l.studentId === studentToDelete.id || l.studentIds?.includes(studentToDelete.id)) &&
                       l.date >= new Date().toISOString().slice(0, 10)
              ).length : 0;

              return upcomingCount > 0 ? (
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
                        Cancella anche le {upcomingCount} lezioni future già programmate
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Rimuove automaticamente gli appuntamenti futuri di {studentToDelete.firstName} dal calendario per liberare l aula e gli orari.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 italic">
                  Nessuna lezione futura programmata a calendario per questo allievo.
                </p>
              );
            })()}

            <div className="space-y-2 pt-2">
              {onStatusChange && studentToDelete.status !== 'sospeso' && (
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(studentToDelete, 'sospeso');
                    setStudentToDelete(null);
                  }}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Imposta come "Sospeso" (Conserva lo Storico)
                </button>
              )}

              {onStatusChange && studentToDelete.status !== 'ritirato' && (
                <button
                  type="button"
                  onClick={() => {
                    onStatusChange(studentToDelete, 'ritirato');
                    setStudentToDelete(null);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Imposta come "Ritirato" (Conserva lo Storico)
                </button>
              )}

              {onDeleteStudent && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteStudent(studentToDelete.id, deleteFutureLessons);
                    setStudentToDelete(null);
                  }}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Definitivamente l Anagrafica
                </button>
              )}

              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
