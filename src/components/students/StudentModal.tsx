import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2, User, Phone, Mail, MapPin, Calendar, Heart } from 'lucide-react';
import { Student, Course, Lesson, AttachmentFile } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  onDelete?: (studentId: string, deleteFutureLessons: boolean) => void;
  initialStudent?: Student | null;
  courses: Course[];
  lessons?: Lesson[];
  activeYearId: string;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialStudent,
  courses,
  lessons,
  activeYearId,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteFutureLessons, setDeleteFutureLessons] = useState(true);
  const [birthDate, setBirthDate] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentFiscalCode, setParentFiscalCode] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [registrationSheet, setRegistrationSheet] = useState<AttachmentFile | undefined>(undefined);
  const [status, setStatus] = useState<'attivo' | 'sospeso' | 'ritirato'>('attivo');
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudent) {
      setFirstName(initialStudent.firstName);
      setLastName(initialStudent.lastName);
      setBirthDate(initialStudent.birthDate || '');
      setFiscalCode(initialStudent.fiscalCode || '');
      setPhone(initialStudent.phone || '');
      setEmail(initialStudent.email || '');
      setAddress(initialStudent.address || '');
      setCity(initialStudent.city || '');
      setIsMinor(initialStudent.isMinor);
      setParentName(initialStudent.parentName || '');
      setParentPhone(initialStudent.parentPhone || '');
      setParentEmail(initialStudent.parentEmail || '');
      setParentFiscalCode(initialStudent.parentFiscalCode || '');
      setMedicalNotes(initialStudent.medicalNotes || '');
      setNotes(initialStudent.notes || '');
      setCourseIds(initialStudent.courseIds || []);
      setRegistrationSheet(initialStudent.registrationSheet);
      setStatus(initialStudent.status);
    } else {
      setFirstName('');
      setLastName('');
      setBirthDate('');
      setFiscalCode('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('');
      setIsMinor(false);
      setParentName('');
      setParentPhone('');
      setParentEmail('');
      setParentFiscalCode('');
      setMedicalNotes('');
      setNotes('');
      setCourseIds([]);
      setRegistrationSheet(undefined);
      setStatus('attivo');
    }
    setUploadError(null);
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 6MB
    if (file.size > 6 * 1024 * 1024) {
      setUploadError('Il file supera la dimensione massima consentita di 6 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setRegistrationSheet({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl,
        uploadDate: new Date().toISOString().slice(0, 10),
      });
    };
    reader.onerror = () => {
      setUploadError('Errore durante il caricamento del file.');
    };
    reader.readAsDataURL(file);
  };

  const toggleCourse = (cId: string) => {
    setCourseIds((prev) =>
      prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const studentToSave: Student = {
      id: initialStudent?.id || `stud-${Date.now()}`,
      academicYearId: initialStudent?.academicYearId || activeYearId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || undefined,
      fiscalCode: fiscalCode.trim().toUpperCase() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      isMinor,
      parentName: isMinor ? parentName.trim() : undefined,
      parentPhone: isMinor ? parentPhone.trim() : undefined,
      parentEmail: isMinor ? parentEmail.trim() : undefined,
      parentFiscalCode: isMinor ? parentFiscalCode.trim().toUpperCase() : undefined,
      medicalNotes: medicalNotes.trim() || undefined,
      notes: notes.trim() || undefined,
      courseIds,
      registrationSheet,
      status,
      createdAt: initialStudent?.createdAt || new Date().toISOString(),
    };

    onSave(studentToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-rose-50 to-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {initialStudent ? 'Modifica Scheda Allievo' : 'Nuova Anagrafica Allievo'}
              </h3>
              <p className="text-xs text-slate-500">
                Anno Accademico: <span className="font-semibold text-rose-600">{activeYearId}</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Es. Leonardo"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cognome <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Es. Ferri"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data di Nascita
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Codice Fiscale Allievo
              </label>
              <input
                type="text"
                value={fiscalCode}
                onChange={(e) => setFiscalCode(e.target.value)}
                placeholder="Es. FRRLND10E14L219W"
                maxLength={16}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono text-slate-900 uppercase focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Telefono Allievo / Cellulare
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="338 1234567"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Allievo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="allievo@email.it"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Indirizzo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Via Roma 42"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Città</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Pinerolo (TO)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Minor toggle */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-900">
                  L allievo è minorenne?
                </span>
                <p className="text-xs text-slate-500">
                  Attiva per registrare i recapiti e il codice fiscale del genitore per ricevute e consensi.
                </p>
              </div>
              <input
                type="checkbox"
                id="isMinorCheckbox"
                checked={isMinor}
                onChange={(e) => setIsMinor(e.target.checked)}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            {isMinor && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome e Cognome Genitore
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Es. Carla Ferri (Mamma)"
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefono Genitore
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Es. 340 9876543"
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Genitore
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="genitore@famiglia.it"
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 focus:outline-rose-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    C.F. Genitore (per Ricevute)
                  </label>
                  <input
                    type="text"
                    value={parentFiscalCode}
                    onChange={(e) => setParentFiscalCode(e.target.value)}
                    placeholder="Es. VRNCRL75C45L219P"
                    maxLength={16}
                    className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 text-sm font-mono uppercase text-slate-900 focus:outline-rose-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Enrolled Courses */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Corsi e Gruppi Assegnati ({courseIds.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courses.map((course) => {
                const isSelected = courseIds.includes(course.id);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => toggleCourse(course.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-colors ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <div className="truncate flex-1">
                      <p className="truncate font-medium">{course.name}</p>
                      <span className="text-[10px] text-slate-500">{course.targetAge || 'Tutti'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attachment: Foglio di iscrizione all'anno accademico (PDF o Immagine) */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                Allegato Foglio di Iscrizione all Anno Accademico
              </label>
              {registrationSheet && (
                <button
                  type="button"
                  onClick={() => setRegistrationSheet(undefined)}
                  className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Rimuovi
                </button>
              )}
            </div>

            {registrationSheet ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {registrationSheet.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(registrationSheet.size / 1024).toFixed(1)} KB · Caricato il {registrationSheet.uploadDate}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 cursor-pointer transition-colors">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    Clicca o trascina qui il modulo di iscrizione firmato
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Formato PDF o Immagine (JPG, PNG) · Max 6 MB
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <p className="text-xs text-rose-600 mt-1">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Didattiche, Preferenze Orario e Vocali
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Lezione preferita il martedì pomeriggio; registro vocale contralto; timido all'inizio."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-700">Stato Iscrizione:</span>
            {(['attivo', 'sospeso', 'ritirato'] as const).map((st) => (
              <label key={st} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="studentStatus"
                  value={st}
                  checked={status === st}
                  onChange={() => setStatus(st)}
                  className="accent-rose-600"
                />
                <span className="capitalize">{st}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {initialStudent && onDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Elimina Allievo
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
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
                {initialStudent ? 'Salva Modifiche' : 'Crea Scheda Allievo'}
              </button>
            </div>
          </div>
        </form>

        {/* Confirmation Dialog Overlay */}
        {showDeleteConfirm && initialStudent && onDelete && (
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
                    {initialStudent.firstName} {initialStudent.lastName}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                <p className="font-bold text-amber-950">
                  Vuoi cancellare definitivamente o impostare come ritirato?
                </p>
                <p className="text-[11px] leading-relaxed">
                  Puoi impostare lo stato su <strong>"Sospeso"</strong> o <strong>"Ritirato"</strong> se desideri mantenere lo storico delle iscrizioni, pagamenti e lezioni.
                </p>
              </div>

              {/* Ask whether to delete future scheduled lessons */}
              {initialStudent && lessons && (
                (() => {
                  const upcomingCount = lessons.filter(
                    (l) => (l.studentId === initialStudent.id || l.studentIds?.includes(initialStudent.id)) &&
                           l.date >= new Date().toISOString().slice(0, 10)
                  ).length;

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
                            Rimuove dal calendario gli appuntamenti futuri di {initialStudent.firstName} per liberare l aula e gli orari.
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : null;
                })()
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('sospeso');
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Imposta come "Sospeso" nel Form
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('ritirato');
                    setShowDeleteConfirm(false);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Imposta come "Ritirato" nel Form
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDelete(initialStudent.id, deleteFutureLessons);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Elimina Definitivamente
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
      </div>
    </div>
  );
};
