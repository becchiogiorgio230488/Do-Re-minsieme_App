import React, { useState, useEffect } from 'react';
import { X, Search, Check, Users, UserPlus } from 'lucide-react';
import { Course, Student } from '../../types';

interface AssignStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  students: Student[];
  onUpdateAssignments: (courseId: string, assignedStudentIds: string[]) => void;
}

export const AssignStudentsModal: React.FC<AssignStudentsModalProps> = ({
  isOpen,
  onClose,
  course,
  students,
  onUpdateAssignments,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (course && isOpen) {
      const yearStudents = students.filter((s) => s.academicYearId === course.academicYearId);
      const currentlyAssignedIds = yearStudents
        .filter((s) => s.courseIds?.includes(course.id))
        .map((s) => s.id);
      setSelectedIds(currentlyAssignedIds);
    }
  }, [course, students, isOpen]);

  if (!isOpen || !course) return null;

  // Filter students by active academic year
  const yearStudents = students.filter((s) => s.academicYearId === course.academicYearId);

  const toggleStudent = (sId: string) => {
    setSelectedIds((prev) =>
      prev.includes(sId) ? prev.filter((id) => id !== sId) : [...prev, sId]
    );
  };

  const handleSave = () => {
    onUpdateAssignments(course.id, selectedIds);
    onClose();
  };

  const filtered = yearStudents.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      (s.parentName && s.parentName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: course.color }}
            >
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Assegna Allievi al Gruppo
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {course.name} · <span className="font-bold text-rose-600">{selectedIds.length} iscritti</span>
                {course.maxStudents && ` (max ${course.maxStudents})`}
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

        {/* Search */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca allievo da assegnare..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Student list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-1.5 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Nessun allievo trovato per la ricerca.
            </p>
          ) : (
            filtered.map((s) => {
              const isChecked = selectedIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => toggleStudent(s.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors pt-2 ${
                    isChecked
                      ? 'bg-rose-50/80 text-rose-950 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isChecked
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-3" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {s.isMinor ? `Minorenne · ${s.parentName || 'Genitore'}` : s.phone || s.email || 'Adulto'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {s.status}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Selezionati: <strong>{selectedIds.length} allievi</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
            >
              Conferma Assegnazioni
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
