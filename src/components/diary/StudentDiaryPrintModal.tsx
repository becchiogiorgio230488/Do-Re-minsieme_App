import React from 'react';
import { X, Printer, BookOpen, Music, CheckCircle2, Calendar, User } from 'lucide-react';
import { Student, Lesson, Course } from '../../types';
import { formatDateLong, formatDateShort } from '../../utils/dateHelpers';

interface StudentDiaryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  lessons: Lesson[];
  courses: Course[];
}

export const StudentDiaryPrintModal: React.FC<StudentDiaryPrintModalProps> = ({
  isOpen,
  onClose,
  student,
  lessons,
  courses,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentLessons = lessons
    .filter((l) => l.studentId === student.id || (l.studentIds && l.studentIds.includes(student.id)))
    .sort((a, b) => b.date.localeCompare(a.date)); // Latest first for print log

  const completedCount = studentLessons.filter((l) => l.status === 'completata').length;
  const repertoire = student.studiedSongs || [];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Controls - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stampa Scheda Diario Didattico & Repertorio
              </h3>
              <p className="text-xs text-slate-500">
                Allievo: {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Stampa / Salva in PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 printable-area space-y-6">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-rose-600 tracking-tight">DO-RE-MINSIEME</span>
                <span className="text-xs text-slate-500 font-medium">· Associazione Musicale & Culturale</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-2">
                Diario Storico Didattico & Repertorio Musicale
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                Allievo: <span className="text-base font-black text-slate-900">{student.firstName} {student.lastName}</span>
                {student.birthDate && <span className="text-xs text-slate-500 ml-2">(Nato il {formatDateShort(student.birthDate)})</span>}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Anno Accademico: {student.academicYearId}</p>
              <p className="mt-0.5">Lezioni Registrate: {studentLessons.length} (Svolte: {completedCount})</p>
              <p className="mt-0.5">Data stampa: {formatDateLong(new Date().toISOString().slice(0, 10))}</p>
            </div>
          </div>

          {/* Repertoire section */}
          {repertoire.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Music className="w-4 h-4 text-rose-600" />
                Repertorio & Brani di Studio ({repertoire.length})
              </h2>
              <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2">Titolo Brano</th>
                    <th className="p-2">Artista / Autore</th>
                    <th className="p-2">Tonalità</th>
                    <th className="p-2">Stato</th>
                    <th className="p-2">Note Tecniche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repertoire.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="p-2 font-bold text-slate-900">{s.title}</td>
                      <td className="p-2 text-slate-600">{s.artistOrComposer || '-'}</td>
                      <td className="p-2 text-slate-600">{s.keyOrTone || '-'}</td>
                      <td className="p-2">
                        <span className="font-semibold capitalize text-slate-700">
                          {s.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600 text-[11px]">{s.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Lessons Diary Entries */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <BookOpen className="w-4 h-4 text-rose-600" />
              Diario Storico delle Lezioni ({studentLessons.length})
            </h2>

            {studentLessons.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nessuna lezione registrata per questo allievo.</p>
            ) : (
              <div className="space-y-3">
                {studentLessons.map((les) => (
                  <div key={les.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatDateLong(les.date)}</span>
                        <span className="text-slate-500">ore {les.startTime} - {les.endTime}</span>
                        <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          {les.status}
                        </span>
                      </div>
                      {les.lessonRating && (
                        <span className="font-bold text-xs text-slate-700 capitalize">
                          Andamento: {les.lessonRating.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {les.songsStudied && les.songsStudied.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-rose-700">Brani studiati: </span>
                        <span className="font-semibold text-slate-800">{les.songsStudied.join(', ')}</span>
                      </div>
                    )}

                    {les.topicsCovered && (
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Argomenti trattati: </span>
                        <span>{les.topicsCovered}</span>
                      </div>
                    )}

                    {les.notes && (
                      <div className="text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/60">
                        <span className="font-bold text-slate-900 block mb-0.5">Note lezione:</span>
                        <p className="whitespace-pre-wrap leading-relaxed">{les.notes}</p>
                      </div>
                    )}

                    {les.nextGoals && (
                      <div className="text-xs text-teal-900 bg-teal-50/70 p-2 rounded-lg border border-teal-200">
                        <span className="font-bold block mb-0.5">Come procedere / Prossimi passi:</span>
                        <p className="whitespace-pre-wrap">{les.nextGoals}</p>
                      </div>
                    )}

                    {les.homework && (
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Compiti / Esercizi: </span>
                        <span>{les.homework}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature footer */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p>Insegnante: Docente di Canto & Musica</p>
              <p>Do-Re-MInsieme APS</p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-300 mb-1"></div>
              <p>Firma del Docente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
