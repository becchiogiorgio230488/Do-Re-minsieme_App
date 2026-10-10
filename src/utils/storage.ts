import { 
  AcademicYear, 
  Course, 
  Student, 
  Payment, 
  Lesson, 
  SchoolQuote 
} from '../types';
import { 
  SEED_YEARS, 
  SEED_COURSES, 
  SEED_STUDENTS, 
  SEED_PAYMENTS, 
  SEED_LESSONS, 
  SEED_QUOTES 
} from './seedData';

const STORAGE_KEYS = {
  YEARS: 'doreminsieme_academic_years',
  ACTIVE_YEAR: 'doreminsieme_active_year_id',
  COURSES: 'doreminsieme_courses',
  STUDENTS: 'doreminsieme_students',
  PAYMENTS: 'doreminsieme_payments',
  LESSONS: 'doreminsieme_lessons',
  QUOTES: 'doreminsieme_school_quotes',
  INITIALIZED: 'doreminsieme_initialized_v2',
};

export interface AppStateData {
  years: AcademicYear[];
  activeYearId: string;
  courses: Course[];
  students: Student[];
  payments: Payment[];
  lessons: Lesson[];
  quotes: SchoolQuote[];
}

export function loadInitialData(): AppStateData {
  try {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      // First boot: initialize with rich default data
      saveAllData({
        years: SEED_YEARS,
        activeYearId: '2026-2027',
        courses: SEED_COURSES,
        students: SEED_STUDENTS,
        payments: SEED_PAYMENTS,
        lessons: SEED_LESSONS,
        quotes: SEED_QUOTES,
      });
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return {
        years: SEED_YEARS,
        activeYearId: '2026-2027',
        courses: SEED_COURSES,
        students: SEED_STUDENTS,
        payments: SEED_PAYMENTS,
        lessons: SEED_LESSONS,
        quotes: SEED_QUOTES,
      };
    }

    const years = JSON.parse(localStorage.getItem(STORAGE_KEYS.YEARS) || '[]') as AcademicYear[];
    const activeYearId = localStorage.getItem(STORAGE_KEYS.ACTIVE_YEAR) || '2026-2027';
    const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || '[]') as Course[];
    const students = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]') as Student[];
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS) || '[]') as Payment[];
    const lessons = JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSONS) || '[]') as Lesson[];
    const rawQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    const quotes = rawQuotes !== null ? (JSON.parse(rawQuotes) as SchoolQuote[]) : SEED_QUOTES;

    // Ensure students have studiedSongs array (merge with seeds if empty)
    const normalizedStudents = (students.length ? students : SEED_STUDENTS).map((st) => {
      if (!st.studiedSongs || st.studiedSongs.length === 0) {
        const seedSt = SEED_STUDENTS.find((s) => s.id === st.id);
        if (seedSt?.studiedSongs) {
          return { ...st, studiedSongs: seedSt.studiedSongs };
        }
      }
      return { ...st, studiedSongs: st.studiedSongs || [] };
    });

    // Ensure lessons have diary fields if missing
    const normalizedLessons = (lessons.length ? lessons : SEED_LESSONS).map((les) => {
      if (!les.topicsCovered && !les.songsStudied) {
        const seedLes = SEED_LESSONS.find((l) => l.id === les.id);
        if (seedLes?.topicsCovered || seedLes?.songsStudied) {
          return {
            ...les,
            topicsCovered: seedLes.topicsCovered,
            songsStudied: seedLes.songsStudied,
            lessonRating: seedLes.lessonRating,
            homework: seedLes.homework,
            nextGoals: seedLes.nextGoals,
            notes: les.notes || seedLes.notes,
          };
        }
      }
      return les;
    });

    // Ensure payments use contanti or satispay (migrate legacy bonifico to contanti, pos to satispay)
    const normalizedPayments = (payments.length ? payments : SEED_PAYMENTS).map((pay) => {
      let method = pay.method;
      if (method === 'bonifico') {
        method = 'contanti';
      } else if (method === 'pos') {
        method = 'satispay';
      } else if (method !== 'contanti' && method !== 'satispay') {
        method = 'contanti';
      }
      return { ...pay, method };
    });

    return {
      years: years.length ? years : SEED_YEARS,
      activeYearId,
      courses: courses.length ? courses : SEED_COURSES,
      students: normalizedStudents,
      payments: normalizedPayments,
      lessons: normalizedLessons,
      quotes,
    };
  } catch (err) {
    console.error('Failed to load local storage data, using fallback seeds', err);
    return {
      years: SEED_YEARS,
      activeYearId: '2026-2027',
      courses: SEED_COURSES,
      students: SEED_STUDENTS,
      payments: SEED_PAYMENTS,
      lessons: SEED_LESSONS,
      quotes: SEED_QUOTES,
    };
  }
}

export function saveAllData(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(data.years));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_YEAR, data.activeYearId);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(data.courses));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(data.lessons));
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(data.quotes));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function getNextReceiptNumber(payments: Payment[], academicYearId: string): number {
  const yearPayments = payments.filter((p) => p.academicYearId === academicYearId);
  if (yearPayments.length === 0) return 1;
  const max = Math.max(...yearPayments.map((p) => p.receiptNumber || 0), 0);
  return max + 1;
}

export function formatReceiptCode(receiptNumber: number, academicYearId: string): string {
  const padded = String(receiptNumber).padStart(3, '0');
  // Format "2026-2027" to "2026-27"
  const shortYear = academicYearId.replace(/-20(\d{2})$/, '-$1');
  return `${padded}/${shortYear}`;
}

export function exportBackupJson(data: AppStateData): void {
  const exportPayload = {
    app: 'Do-Re-MInsieme',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Do-Re-MInsieme_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetToDemoData(): AppStateData {
  const demoData: AppStateData = {
    years: SEED_YEARS,
    activeYearId: '2026-2027',
    courses: SEED_COURSES,
    students: SEED_STUDENTS,
    payments: SEED_PAYMENTS,
    lessons: SEED_LESSONS,
    quotes: SEED_QUOTES,
  };
  saveAllData(demoData);
  return demoData;
}
