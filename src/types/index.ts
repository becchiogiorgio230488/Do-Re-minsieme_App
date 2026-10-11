export type AcademicYearId = string;

export interface AcademicYear {
  id: string; // e.g., '2026-2027'
  label: string; // e.g., '2026 / 2027'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
  notes?: string;
}

export type CourseType = 
  | 'canto_singolo'
  | 'canto_coppia'
  | 'coro'
  | 'musica_gioco'
  | 'laboratorio_scuola'
  | 'altro';

export interface Course {
  id: string;
  academicYearId: string;
  name: string;
  type: CourseType;
  description: string;
  targetAge?: string;
  defaultHourlyRate?: number;
  defaultMonthlyRate?: number;
  color: string;
  maxStudents?: number;
  room?: string;
  dayOfWeek?: number; // 0=Sun, 1=Mon, 2=Tue...
  defaultTimeSlot?: string;
  active: boolean;
}

export interface AttachmentFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 or Blob URL
  uploadDate: string;
}

export interface Student {
  id: string;
  academicYearId: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  fiscalCode?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  isMinor: boolean;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  parentFiscalCode?: string;
  medicalNotes?: string;
  notes?: string;
  courseIds: string[]; // List of enrolled course IDs
  registrationSheet?: AttachmentFile; // Uploaded enrollment PDF or image
  status: 'attivo' | 'sospeso' | 'ritirato';
  studiedSongs?: StudiedSong[]; // Elenco repertorio & brani in studio dell'allievo
  createdAt: string;
}

export type SongStatus = 'in_studio' | 'perfezionamento' | 'completato' | 'in_programma';

export interface StudiedSong {
  id: string;
  title: string;
  artistOrComposer?: string;
  status: SongStatus;
  startedDate?: string; // YYYY-MM-DD
  completedDate?: string; // YYYY-MM-DD
  keyOrTone?: string; // e.g. "Do magg.", "Tonalità orig.", "-1 semitono"
  genre?: string; // e.g. "Pop", "Cantautorato", "Musical", "Rock", "Classica"
  notes?: string; // Note tecniche, passaggi critici, consigli
}

export type LessonRating = 'eccellente' | 'ottimo' | 'buono' | 'sufficiente' | 'da_rivedere';

export type PaymentMethod = 'contanti' | 'satispay' | 'bonifico' | 'pos' | 'altro';

export interface Payment {
  id: string;
  academicYearId: string;
  receiptNumber: number; // Sequential integer (1, 2, 3...)
  receiptCode: string; // e.g. "001/2026-27"
  studentId: string;
  courseId?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  method: PaymentMethod;
  description: string; // e.g. "Quota mensile canto singolo - Ottobre 2026"
  payerName: string; // Name printed on receipt (Parent or Student)
  payerFiscalCode?: string;
  notes?: string;
  issuedBy: string; // e.g. "Do-Re-MInsieme"
  createdAt: string;
}

export type LessonStatus = 'programmata' | 'completata' | 'assente' | 'cancellata' | 'recuperata';

export type CalendarEventType = 'lezione' | 'appuntamento';
export type GenericEventCategory = 'riunione' | 'personale' | 'evento_scuola' | 'scadenza' | 'altro';

export interface Lesson {
  id: string;
  academicYearId: string;
  studentId?: string;
  studentIds?: string[];
  courseId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: LessonStatus;
  notes?: string; // Note didattiche libere (Cosa si è fatto durante la lezione)
  room?: string;
  isRecurringInstance?: boolean;
  recurringSeriesId?: string; // Links recurring instances
  
  // Appuntamento generico / evento fields
  eventType?: CalendarEventType; // 'lezione' | 'appuntamento'
  eventCategory?: GenericEventCategory; // 'riunione' | 'personale' | 'evento_scuola' | 'scadenza' | 'altro'
  eventColor?: string; // Colore personalizzato hex
  description?: string; // Dettagli appuntamento generico

  // Didactic diary & repertoire fields
  topicsCovered?: string; // Argomenti trattati (es. "Riscaldamento diaframmatico, passaggi di registro, dizione")
  songsStudied?: string[]; // Nomi o titoli dei brani studiati in questa lezione
  lessonRating?: LessonRating; // Valutazione o andamento della lezione
  homework?: string; // Compiti ed esercizi per la prossima volta
  nextGoals?: string; // Come procedere col percorso / Obiettivi per le prossime lezioni
}

export interface RecurringScheduleParams {
  studentId?: string;
  studentIds?: string[];
  courseId?: string;
  title: string;
  dayOfWeek: number; // 1 = Lunedì, 2 = Martedì, etc.
  startTime: string; // "14:00"
  endTime: string; // "15:00"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  room?: string;
  notes?: string;
}

export interface SchoolQuoteItem {
  id: string;
  ageGroup: string; // e.g. "Bambini 3 anni", "Bambini 4 anni", "Bambini 5 anni"
  numLessons: number; // e.g. 10
  pricePerLesson: number; // e.g. 25
  total: number; // numLessons * pricePerLesson
  notes?: string;
  // Configurazione lezione aperta per singola fascia d'età
  hasOpenLesson?: boolean; // Se questa fascia prevede lezione aperta
  openLessonDetails?: string; // Dettaglio/note per la lezione aperta della fascia
  includeOpenLessonCost?: boolean; // Se applicare un costo specifico o se inclusa
  openLessonCost?: number; // Importo costo lezione aperta per questa fascia
}

export interface SchoolQuote {
  id: string;
  academicYearId: string;
  quoteNumber: string; // e.g. "PREV-2026/01"
  date: string; // YYYY-MM-DD
  schoolName: string; // e.g. "Scuola dell'Infanzia San Francesco"
  schoolAddress?: string;
  contactPerson: string; // e.g. "Coordinatrice didattica Maria Bianchi"
  contactPhone?: string;
  contactEmail?: string;
  projectTitle: string; // e.g. "Laboratorio di Propedeutica 'Musica in Movimento'"
  description: string; // Scope, objectives, methodology
  items: SchoolQuoteItem[];
  // Ambito/modalità delle lezioni aperte
  openLessonsScope?: 'per_item' | 'global' | 'none'; // 'per_item' = ad ogni fascia d'età, 'global' = una che vale per tutti, 'none' = nessuna
  hasOpenLessons: boolean; // Flag riassuntivo se sono previste lezioni aperte
  openLessonsDetails?: string; // Dettaglio se unica per tutti (o riepilogo generale)
  includeOpenLessonCost?: boolean; // Decidi se applicare un costo alla lezione aperta globale
  openLessonsCost?: number; // Costo globale se unica per tutti
  materialsIncluded?: string; // e.g. "Strumentario Orff e impianto audio forniti dalla docente"
  totalAmount: number;
  validityDays?: number;
  status: 'bozza' | 'inviato' | 'approvato' | 'rifiutato';
  notes?: string;
  createdAt: string;
}
