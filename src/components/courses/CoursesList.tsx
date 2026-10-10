import React, { useState, useMemo } from 'react';
import { 
  Music, 
  Plus, 
  Users, 
  UserPlus, 
  Edit2, 
  DoorOpen, 
  Euro, 
  Calendar, 
  CheckCircle2, 
  Search,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Course, CourseType, Student } from '../../types';
import { ITALIAN_DAYS, formatCurrency } from '../../utils/dateHelpers';

interface CoursesListProps {
  courses: Course[];
  students: Student[];
  activeYearId: string;
  onNewCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onAssignStudents: (course: Course) => void;
  onSelectStudent: (student: Student) => void;
}

export const CoursesList: React.FC<CoursesListProps> = ({
  courses,
  students,
  activeYearId,
  onNewCourse,
  onEditCourse,
  onDeleteCourse,
  onAssignStudents,
  onSelectStudent,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const yearCourses = useMemo(() => {
    return courses.filter((c) => c.academicYearId === activeYearId);
  }, [courses, activeYearId]);

  const filteredCourses = useMemo(() => {
    return yearCourses.filter((course) => {
      const matchesType = selectedType === 'all' || course.type === selectedType;
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.room && course.room.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [yearCourses, selectedType, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Corsi & Gruppi Didattici
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {filteredCourses.length} attivi
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Crea in autonomia corsi di canto singolo, coppia, coro e musica-gioco. Assegna gli allievi con facilità.
          </p>
        </div>

        <button
          onClick={onNewCourse}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuovo Corso o Gruppo
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca corso per nome, aula, descrizione..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-rose-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tutti i Corsi' },
              { id: 'canto_singolo', label: 'Canto Singolo' },
              { id: 'canto_coppia', label: 'Canto Coppia' },
              { id: 'coro', label: 'Coro' },
              { id: 'musica_gioco', label: 'Musica-Gioco' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedType === tab.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Courses */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Music className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nessun corso trovato</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Non hai ancora creato corsi per l anno accademico {activeYearId} corrispondenti ai criteri selezionati.
          </p>
          <button
            onClick={onNewCourse}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crea il tuo Primo Corso
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            // Find assigned students for this course in the current academic year
            const assignedStudents = students.filter(
              (s) => s.academicYearId === activeYearId && s.courseIds?.includes(course.id)
            );

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top bar with color pill and actions */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-2xs"
                        style={{ backgroundColor: course.color }}
                      >
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {course.name}
                        </h3>
                        <span className="text-[10px] font-semibold uppercase text-slate-500">
                          {course.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditCourse(course)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Modifica Corso"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {onDeleteCourse && (
                        <button
                          onClick={() => setCourseToDelete(course)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Elimina Corso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Target Age & Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  {/* Details badges */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {course.targetAge && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fascia:</span>
                        <span className="font-semibold text-slate-800">{course.targetAge}</span>
                      </div>
                    )}
                    {course.room && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Aula:</span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                          {course.room}
                        </span>
                      </div>
                    )}
                    {course.dayOfWeek !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Giorno:</span>
                        <span className="font-semibold text-slate-800">
                          {ITALIAN_DAYS[course.dayOfWeek]} {course.defaultTimeSlot && `(${course.defaultTimeSlot})`}
                        </span>
                      </div>
                    )}
                    {(course.defaultMonthlyRate !== undefined || course.defaultHourlyRate !== undefined) && (
                      <div className="pt-2 border-t border-slate-200/60 space-y-1">
                        {course.defaultHourlyRate !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Prezzo all ora:</span>
                            <span className="font-bold text-rose-600 tabular-nums">
                              {formatCurrency(course.defaultHourlyRate)} / lezione
                            </span>
                          </div>
                        )}
                        {course.defaultMonthlyRate !== undefined && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Quota mensile:</span>
                            <span className="font-bold text-rose-600 tabular-nums">
                              {formatCurrency(course.defaultMonthlyRate)} / mese
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enrolled Students section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Allievi Assegnati ({assignedStudents.length}
                        {course.maxStudents ? ` / ${course.maxStudents}` : ''})
                      </span>
                    </div>

                    {assignedStudents.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic bg-white p-2 border border-dashed border-slate-200 rounded-lg text-center">
                        Nessun allievo assegnato ancora a questo gruppo.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {assignedStudents.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => onSelectStudent(s)}
                            className="text-[11px] font-medium text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 px-2 py-0.5 rounded-lg transition-colors truncate max-w-full"
                          >
                            {s.firstName} {s.lastName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    A.S. {activeYearId}
                  </span>
                  <button
                    onClick={() => onAssignStudents(course)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Assegna Allievi
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog Overlay for deleting a course */}
      {courseToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: courseToDelete.color }}
              >
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Elimina Corso o Gruppo
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {courseToDelete.name} ({courseToDelete.type.replace('_', ' ')})
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Confermi l eliminazione di questo corso?
              </p>
              {(() => {
                const enrolled = students.filter(
                  (s) => s.academicYearId === activeYearId && s.courseIds?.includes(courseToDelete.id)
                ).length;
                return enrolled > 0 ? (
                  <p className="text-[11px] leading-relaxed">
                    Attualmente ci sono <strong>{enrolled} allievi iscritti</strong> a questo corso.
                    Eliminando il corso, gli allievi verranno disassociati dal gruppo, ma le loro schede personali, i pagamenti e lo storico delle lezioni rimarranno conservati.
                  </p>
                ) : (
                  <p className="text-[11px] leading-relaxed">
                    Nessun allievo è attualmente iscritto a questo corso.
                  </p>
                );
              })()}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onDeleteCourse) {
                    onDeleteCourse(courseToDelete.id);
                  }
                  setCourseToDelete(null);
                }}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Elimina Definitivamente il Corso
              </button>

              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
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
