/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  loadInitialData, 
  saveAllData, 
  AppStateData 
} from './utils/storage';
import { 
  Student, 
  Course, 
  Payment, 
  Lesson, 
  SchoolQuote, 
  AcademicYear, 
  AttachmentFile,
  CalendarEventType 
} from './types';

// Components
import { Navbar, NavTab } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { StudentsList } from './components/students/StudentsList';
import { StudentModal } from './components/students/StudentModal';
import { StudentDetailModal } from './components/students/StudentDetailModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { CoursesList } from './components/courses/CoursesList';
import { CourseModal } from './components/courses/CourseModal';
import { AssignStudentsModal } from './components/courses/AssignStudentsModal';
import { CalendarView } from './components/calendar/CalendarView';
import { RecurringLessonModal } from './components/calendar/RecurringLessonModal';
import { LessonModal } from './components/calendar/LessonModal';
import { PaymentsList } from './components/payments/PaymentsList';
import { PaymentModal } from './components/payments/PaymentModal';
import { ReceiptPrintModal } from './components/payments/ReceiptPrintModal';
import { QuotesList } from './components/quotes/QuotesList';
import { QuoteModal } from './components/quotes/QuoteModal';
import { QuotePrintModal } from './components/quotes/QuotePrintModal';
import { YearManagerModal } from './components/years/YearManagerModal';
import { BackupModal } from './components/BackupModal';
import { QuickNewModal } from './components/QuickNewModal';
import { SupabaseModal } from './components/SupabaseModal';
import { isSupabaseConfigured, subscribeToRealtimeChanges } from './services/supabaseClient';
import {
  fetchCompleteAppStateFromSupabase,
  syncAcademicYearToSupabase,
  deleteAcademicYearFromSupabase,
  syncCourseToSupabase,
  deleteCourseFromSupabase,
  syncStudentToSupabase,
  deleteStudentFromSupabase,
  syncLessonToSupabase,
  syncLessonsBulkToSupabase,
  deleteLessonFromSupabase,
  getNextReceiptNumberFromSupabase,
  syncPaymentToSupabase,
  deletePaymentFromSupabase,
  syncSchoolQuoteToSupabase,
  deleteSchoolQuoteFromSupabase
} from './services/supabaseDb';

export default function App() {
  // Initialize state from storage / rich seeds
  const [appData, setAppData] = useState<AppStateData>(() => loadInitialData());
  const [currentTab, setCurrentTab] = useState<NavTab>('students');

  // Destructure for easy access
  const { years, activeYearId, courses, students, payments, lessons, quotes } = appData;
  const activeYear = years.find((y) => y.id === activeYearId) || years[0];
  const currentYear = years.find((y) => y.isCurrent) || years[0];

  // Auto-sync state to localStorage whenever appData changes
  useEffect(() => {
    saveAllData(appData);
  }, [appData]);

  // Modal visibility states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);

  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [docToView, setDocToView] = useState<{ doc?: AttachmentFile; studentName: string } | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [courseForAssignment, setCourseForAssignment] = useState<Course | null>(null);

  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [preselectedStudentForLesson, setPreselectedStudentForLesson] = useState<Student | null>(null);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<Lesson | null>(null);
  const [lessonModalDefaultType, setLessonModalDefaultType] = useState<CalendarEventType>('lezione');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedStudentForPayment, setPreselectedStudentForPayment] = useState<Student | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);

  const [isReceiptPrintOpen, setIsReceiptPrintOpen] = useState(false);
  const [paymentForReceipt, setPaymentForReceipt] = useState<Payment | null>(null);

  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<SchoolQuote | null>(null);

  const [isQuotePrintOpen, setIsQuotePrintOpen] = useState(false);
  const [quoteForPrint, setQuoteForPrint] = useState<SchoolQuote | null>(null);

  const [isYearManagerOpen, setIsYearManagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isQuickNewOpen, setIsQuickNewOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(() => isSupabaseConfigured());
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);

  // Manual sync callback
  const handleSyncFromCloud = async () => {
    setIsCloudConnected(isSupabaseConfigured());
    if (isSupabaseConfigured()) {
      const cloudData = await fetchCompleteAppStateFromSupabase();
      if (cloudData) {
        setAppData(cloudData);
        setIsCloudConnected(true);
      }
    }
  };

  // Realtime subscription & background auto-sync (on startup, tab focus, window visible)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // 1. Initial background fetch
    setIsInitialSyncing(true);
    fetchCompleteAppStateFromSupabase()
      .then((cloudData) => {
        if (cloudData && (cloudData.years.length > 0 || cloudData.students.length > 0)) {
          setAppData(cloudData);
          setIsCloudConnected(true);
        }
      })
      .catch((err) => {
        console.warn('Initial Supabase sync error, using local storage cache:', err);
      })
      .finally(() => {
        setIsInitialSyncing(false);
      });

    // 2. Real-time postgres changes subscription
    let unsubscribeRealtime: (() => void) | null = null;
    try {
      unsubscribeRealtime = subscribeToRealtimeChanges((table) => {
        console.log(`[Supabase Realtime] Change detected in table: ${table || 'all'}. Syncing in background...`);
        fetchCompleteAppStateFromSupabase()
          .then((freshData) => {
            if (freshData) {
              setAppData(freshData);
              setIsCloudConnected(true);
            }
          })
          .catch((err) => {
            console.warn('Error during realtime update pull:', err);
          });
      });
    } catch (e) {
      console.warn('Could not setup realtime subscription:', e);
    }

    // 3. Auto-sync on window focus / visibility change (when user returns to the tab or app)
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible' && isSupabaseConfigured()) {
        fetchCompleteAppStateFromSupabase()
          .then((freshData) => {
            if (freshData && (freshData.years.length > 0 || freshData.students.length > 0)) {
              setAppData(freshData);
              setIsCloudConnected(true);
            }
          })
          .catch((err) => console.warn('Background focus sync error:', err));
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, []);

  // ======================
  // STATE HANDLERS (ASYNC + SUPABASE SYNC)
  // ======================

  // Save Student (create or update) + upload enrollment sheet to Supabase Storage
  const handleSaveStudent = async (savedStudent: Student) => {
    setAppData((prev) => {
      const exists = prev.students.some((s) => s.id === savedStudent.id);
      const updatedStudents = exists
        ? prev.students.map((s) => (s.id === savedStudent.id ? savedStudent : s))
        : [savedStudent, ...prev.students];
      return { ...prev, students: updatedStudents };
    });

    if (selectedStudentDetail && selectedStudentDetail.id === savedStudent.id) {
      setSelectedStudentDetail(savedStudent);
    }

    if (isSupabaseConfigured()) {
      try {
        const persisted = await syncStudentToSupabase(savedStudent);
        if (persisted.registrationSheet?.dataUrl !== savedStudent.registrationSheet?.dataUrl) {
          setAppData((prev) => ({
            ...prev,
            students: prev.students.map((s) => (s.id === persisted.id ? persisted : s)),
          }));
          if (selectedStudentDetail && selectedStudentDetail.id === persisted.id) {
            setSelectedStudentDetail(persisted);
          }
        }
      } catch (err) {
        console.error('Error syncing student to Supabase:', err);
      }
    }
  };

  // Delete student
  const handleDeleteStudent = async (studentId: string, deleteFutureLessons: boolean = true) => {
    const today = new Date().toISOString().slice(0, 10);
    const currentLessons = appData.lessons;
    const lessonsToDelete: string[] = [];
    const lessonsToUpdate: Lesson[] = [];

    if (deleteFutureLessons) {
      currentLessons.forEach((l) => {
        const isThisSingleStudent = l.studentId === studentId;
        const isFuture = l.date >= today;
        if (isThisSingleStudent && isFuture) {
          lessonsToDelete.push(l.id);
        } else if (l.studentIds && l.studentIds.includes(studentId) && l.date >= today) {
          lessonsToUpdate.push({
            ...l,
            studentIds: l.studentIds.filter((id) => id !== studentId),
          });
        }
      });
    }

    setAppData((prev) => {
      const updatedStudents = prev.students.filter((s) => s.id !== studentId);
      let updatedLessons = prev.lessons;
      if (deleteFutureLessons) {
        updatedLessons = prev.lessons
          .filter((l) => !lessonsToDelete.includes(l.id))
          .map((l) => {
            const upd = lessonsToUpdate.find((u) => u.id === l.id);
            return upd || l;
          });
      }

      return {
        ...prev,
        students: updatedStudents,
        lessons: updatedLessons,
      };
    });

    if (selectedStudentDetail && selectedStudentDetail.id === studentId) {
      setIsStudentDetailOpen(false);
      setSelectedStudentDetail(null);
    }
    if (studentToEdit && studentToEdit.id === studentId) {
      setIsStudentModalOpen(false);
      setStudentToEdit(null);
    }

    if (isSupabaseConfigured()) {
      try {
        await deleteStudentFromSupabase(studentId);
        for (const id of lessonsToDelete) {
          await deleteLessonFromSupabase(id);
        }
        for (const les of lessonsToUpdate) {
          await syncLessonToSupabase(les);
        }
      } catch (err) {
        console.error('Error deleting student from Supabase:', err);
      }
    }
  };

  // Change student status (attivo, sospeso, ritirato)
  const handleStatusChange = (student: Student, newStatus: 'attivo' | 'sospeso' | 'ritirato') => {
    const updated = { ...student, status: newStatus };
    handleSaveStudent(updated);
  };

  // View enrollment document
  const handleViewDocument = (student: Student) => {
    if (student.registrationSheet) {
      setDocToView({
        doc: student.registrationSheet,
        studentName: `${student.firstName} ${student.lastName}`,
      });
      setIsDocViewerOpen(true);
    }
  };

  // Save Course (create or update)
  const handleSaveCourse = async (savedCourse: Course) => {
    setAppData((prev) => {
      const exists = prev.courses.some((c) => c.id === savedCourse.id);
      const updatedCourses = exists
        ? prev.courses.map((c) => (c.id === savedCourse.id ? savedCourse : c))
        : [...prev.courses, savedCourse];
      return { ...prev, courses: updatedCourses };
    });

    if (isSupabaseConfigured()) {
      try {
        await syncCourseToSupabase(savedCourse, activeYearId);
      } catch (err) {
        console.error('Error syncing course to Supabase:', err);
      }
    }
  };

  // Update group assignments for a course
  const handleUpdateCourseAssignments = async (courseId: string, assignedStudentIds: string[]) => {
    const studentsToSync: Student[] = [];

    setAppData((prev) => {
      const updatedStudents = prev.students.map((st) => {
        if (st.academicYearId !== activeYearId) return st;
        const shouldBeInCourse = assignedStudentIds.includes(st.id);
        const currentCourses = st.courseIds || [];
        const isInCourse = currentCourses.includes(courseId);

        if (shouldBeInCourse && !isInCourse) {
          const updated = { ...st, courseIds: [...currentCourses, courseId] };
          studentsToSync.push(updated);
          return updated;
        } else if (!shouldBeInCourse && isInCourse) {
          const updated = { ...st, courseIds: currentCourses.filter((id) => id !== courseId) };
          studentsToSync.push(updated);
          return updated;
        }
        return st;
      });
      return { ...prev, students: updatedStudents };
    });

    if (isSupabaseConfigured() && studentsToSync.length > 0) {
      try {
        for (const st of studentsToSync) {
          await syncStudentToSupabase(st);
        }
      } catch (err) {
        console.error('Error syncing student course assignments to Supabase:', err);
      }
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId: string) => {
    setAppData((prev) => {
      // 1. Remove course
      const updatedCourses = prev.courses.filter((c) => c.id !== courseId);

      // 2. Remove courseId from all students
      const updatedStudents = prev.students.map((st) => {
        if (st.courseIds?.includes(courseId)) {
          return {
            ...st,
            courseIds: st.courseIds.filter((id) => id !== courseId),
          };
        }
        return st;
      });

      // 3. Disassociate courseId from lessons
      const updatedLessons = prev.lessons.map((l) => {
        if (l.courseId === courseId) {
          return { ...l, courseId: undefined };
        }
        return l;
      });

      return {
        ...prev,
        courses: updatedCourses,
        students: updatedStudents,
        lessons: updatedLessons,
      };
    });

    if (courseToEdit && courseToEdit.id === courseId) {
      setIsCourseModalOpen(false);
      setCourseToEdit(null);
    }

    if (isSupabaseConfigured()) {
      try {
        await deleteCourseFromSupabase(courseId);
      } catch (err) {
        console.error('Error deleting course from Supabase:', err);
      }
    }
  };

  // Save Single Lesson
  const handleSaveSingleLesson = async (savedLesson: Lesson) => {
    setAppData((prev) => {
      const exists = prev.lessons.some((l) => l.id === savedLesson.id);
      const updatedLessons = exists
        ? prev.lessons.map((l) => (l.id === savedLesson.id ? savedLesson : l))
        : [...prev.lessons, savedLesson];
      return { ...prev, lessons: updatedLessons };
    });

    if (isSupabaseConfigured()) {
      try {
        await syncLessonToSupabase(savedLesson);
      } catch (err) {
        console.error('Error syncing lesson to Supabase:', err);
      }
    }
  };

  // Save Recurring Lessons
  const handleSaveRecurringLessons = async (newLessons: Lesson[]) => {
    setAppData((prev) => ({
      ...prev,
      lessons: [...prev.lessons, ...newLessons],
    }));

    if (isSupabaseConfigured()) {
      try {
        await syncLessonsBulkToSupabase(newLessons);
      } catch (err) {
        console.error('Error bulk syncing lessons to Supabase:', err);
      }
    }
  };

  // Delete single lesson
  const handleDeleteSingleLesson = async (lessonId: string) => {
    setAppData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((l) => l.id !== lessonId),
    }));

    if (isSupabaseConfigured()) {
      try {
        await deleteLessonFromSupabase(lessonId);
      } catch (err) {
        console.error('Error deleting lesson from Supabase:', err);
      }
    }
  };

  // Delete recurring series
  const handleDeleteSeries = async (recurringSeriesId: string, currentLessonId?: string) => {
    const currentLesson = currentLessonId ? appData.lessons.find((l) => l.id === currentLessonId) : undefined;
    const targetSeriesId = recurringSeriesId || currentLesson?.recurringSeriesId;

    const toDelete = appData.lessons.filter((l) => {
      if (targetSeriesId && l.recurringSeriesId === targetSeriesId) {
        return true;
      }
      if (currentLessonId && l.id === currentLessonId) {
        return true;
      }
      if (
        !targetSeriesId &&
        currentLesson?.isRecurringInstance &&
        l.isRecurringInstance &&
        l.studentId === currentLesson.studentId &&
        l.courseId === currentLesson.courseId
      ) {
        return true;
      }
      return false;
    });

    setAppData((prev) => ({
      ...prev,
      lessons: prev.lessons.filter((l) => !toDelete.some((d) => d.id === l.id)),
    }));

    if (isSupabaseConfigured()) {
      try {
        for (const l of toDelete) {
          await deleteLessonFromSupabase(l.id);
        }
      } catch (err) {
        console.error('Error deleting lesson series from Supabase:', err);
      }
    }
  };

  // Save Payment with safe progressive receipt numbering
  const handleSavePayment = async (savedPayment: Payment, printImmediately = false) => {
    let paymentToStore = { ...savedPayment };

    // If Supabase is configured and this is a new payment, safely re-verify MAX(receipt_number) + 1
    if (isSupabaseConfigured()) {
      const isNew = !appData.payments.some((p) => p.id === savedPayment.id);
      if (isNew) {
        try {
          const nextReceipt = await getNextReceiptNumberFromSupabase(savedPayment.academicYearId || activeYearId);
          paymentToStore.receiptNumber = nextReceipt.receiptNumber;
          paymentToStore.receiptCode = nextReceipt.receiptCode;
        } catch (err) {
          console.warn('Could not re-verify receipt number on Supabase:', err);
        }
      }
    }

    setAppData((prev) => {
      const exists = prev.payments.some((p) => p.id === paymentToStore.id);
      const updatedPayments = exists
        ? prev.payments.map((p) => (p.id === paymentToStore.id ? paymentToStore : p))
        : [paymentToStore, ...prev.payments];
      return { ...prev, payments: updatedPayments };
    });

    if (printImmediately) {
      setPaymentForReceipt(paymentToStore);
      setIsReceiptPrintOpen(true);
    }

    if (isSupabaseConfigured()) {
      try {
        await syncPaymentToSupabase(paymentToStore);
      } catch (err) {
        console.error('Error syncing payment to Supabase:', err);
      }
    }
  };

  // Edit Payment handler
  const handleEditPayment = (payment: Payment) => {
    setPaymentToEdit(payment);
    const student = students.find((s) => s.id === payment.studentId) || null;
    setPreselectedStudentForPayment(student);
    setIsPaymentModalOpen(true);
  };

  // Delete Payment handler
  const handleDeletePayment = async (paymentId: string) => {
    setAppData((prev) => ({
      ...prev,
      payments: prev.payments.filter((p) => p.id !== paymentId),
    }));

    if (isSupabaseConfigured()) {
      try {
        await deletePaymentFromSupabase(paymentId);
      } catch (err) {
        console.error('Error deleting payment from Supabase:', err);
      }
    }
  };

  // Save School Quote
  const handleSaveQuote = async (savedQuote: SchoolQuote) => {
    setAppData((prev) => {
      const exists = prev.quotes.some((q) => q.id === savedQuote.id);
      const updatedQuotes = exists
        ? prev.quotes.map((q) => (q.id === savedQuote.id ? savedQuote : q))
        : [savedQuote, ...prev.quotes];
      return { ...prev, quotes: updatedQuotes };
    });

    if (isSupabaseConfigured()) {
      try {
        await syncSchoolQuoteToSupabase(savedQuote);
      } catch (err) {
        console.error('Error syncing school quote to Supabase:', err);
      }
    }
  };

  // Delete School Quote
  const handleDeleteQuote = async (quoteId: string) => {
    setAppData((prev) => ({
      ...prev,
      quotes: prev.quotes.filter((q) => q.id !== quoteId),
    }));

    if (isSupabaseConfigured()) {
      try {
        await deleteSchoolQuoteFromSupabase(quoteId);
      } catch (err) {
        console.error('Error deleting school quote from Supabase:', err);
      }
    }
  };

  // Select / change active academic year
  const handleSelectActiveYear = (yearId: string) => {
    setAppData((prev) => ({
      ...prev,
      activeYearId: yearId,
    }));
  };

  // Add new academic year
  const handleAddYear = async (newYear: AcademicYear) => {
    setAppData((prev) => ({
      ...prev,
      years: [...prev.years, newYear],
      activeYearId: newYear.id,
    }));

    if (isSupabaseConfigured()) {
      try {
        await syncAcademicYearToSupabase(newYear);
      } catch (err) {
        console.error('Error syncing academic year to Supabase:', err);
      }
    }
  };

  // Delete academic year handler (with cascade cleanup on Supabase)
  const handleDeleteYear = async (yearId: string) => {
    if (years.length <= 1) return;

    // Remaining years
    const remainingYears = years.filter((y) => y.id !== yearId);
    let nextActiveId = activeYearId;
    if (activeYearId === yearId) {
      const fallback = remainingYears.find((y) => y.isCurrent) || remainingYears[0];
      nextActiveId = fallback ? fallback.id : '';
    }

    setAppData((prev) => ({
      ...prev,
      years: remainingYears,
      activeYearId: nextActiveId,
      // Filter out courses, lessons, payments, quotes tied to the deleted year
      courses: prev.courses.filter((c) => c.academicYearId !== yearId),
      lessons: prev.lessons.filter((l) => l.academicYearId !== yearId),
      payments: prev.payments.filter((p) => p.academicYearId !== yearId),
      quotes: prev.quotes.filter((q) => q.academicYearId !== yearId),
    }));

    if (isSupabaseConfigured()) {
      try {
        await deleteAcademicYearFromSupabase(yearId);
      } catch (err) {
        console.error('Error deleting academic year from Supabase:', err);
      }
    }
  };

  // Set academic year as current
  const handleSetCurrentYear = async (yearId: string) => {
    const updatedYears = years.map((y) => ({
      ...y,
      isCurrent: y.id === yearId,
    }));

    setAppData((prev) => ({
      ...prev,
      years: updatedYears,
    }));

    if (isSupabaseConfigured()) {
      try {
        for (const y of updatedYears) {
          await syncAcademicYearToSupabase(y);
        }
      } catch (err) {
        console.error('Error setting current academic year on Supabase:', err);
      }
    }
  };

  // Handle Quick New Action launcher
  const handleQuickNewAction = (
    action: 'student' | 'payment' | 'recurring' | 'singleLesson' | 'genericEvent' | 'course' | 'quote'
  ) => {
    if (action === 'student') {
      setStudentToEdit(null);
      setIsStudentModalOpen(true);
    } else if (action === 'payment') {
      setPaymentToEdit(null);
      setPreselectedStudentForPayment(null);
      setIsPaymentModalOpen(true);
    } else if (action === 'recurring') {
      setPreselectedStudentForLesson(null);
      setIsRecurringModalOpen(true);
    } else if (action === 'singleLesson') {
      setLessonToEdit(null);
      setLessonModalDefaultType('lezione');
      setIsLessonModalOpen(true);
    } else if (action === 'genericEvent') {
      setLessonToEdit(null);
      setLessonModalDefaultType('appuntamento');
      setIsLessonModalOpen(true);
    } else if (action === 'course') {
      setCourseToEdit(null);
      setIsCourseModalOpen(true);
    } else if (action === 'quote') {
      setQuoteToEdit(null);
      setIsQuoteModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-900 pb-16 md:pb-6">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeYear={activeYear}
        onOpenYearManager={() => setIsYearManagerOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
        isCloudConnected={isCloudConnected}
        onQuickNew={() => setIsQuickNewOpen(true)}
      />

      {/* Cloud Sync Status Banner */}
      {isInitialSyncing && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 text-center font-semibold flex items-center justify-center gap-2 no-print shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
          Sincronizzazione dati da Supabase Cloud in corso...
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Historical Archive Banner: shows ONLY if activeYear is strictly different from currentYear */}
        {currentYear && activeYear && activeYear.id !== currentYear.id && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-950 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>
                <strong>Archivio Storico Attivo:</strong> Stai visualizzando i dati dell Anno Scolastico <strong>{activeYear.label || activeYear.id}</strong>.
              </span>
            </div>
            <button
              onClick={() => handleSelectActiveYear(currentYear.id)}
              className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 rounded-lg font-bold text-amber-950 transition-colors cursor-pointer shrink-0 ml-3"
            >
              Torna all Anno Corrente ({currentYear.label || currentYear.id})
            </button>
          </div>
        )}

        {/* TAB 1: ALLIEVI */}
        {currentTab === 'students' && (
          <StudentsList
            students={students}
            courses={courses}
            payments={payments}
            lessons={lessons}
            activeYearId={activeYearId}
            onSelectStudent={(student) => {
              setSelectedStudentDetail(student);
              setIsStudentDetailOpen(true);
            }}
            onEditStudent={(student) => {
              setStudentToEdit(student);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onStatusChange={handleStatusChange}
            onNewStudent={() => {
              setStudentToEdit(null);
              setIsStudentModalOpen(true);
            }}
            onViewDocument={handleViewDocument}
            onNewPayment={(student) => {
              setPreselectedStudentForPayment(student);
              setPaymentToEdit(null);
              setIsPaymentModalOpen(true);
            }}
          />
        )}

        {/* TAB 2: CORSI & GRUPPI */}
        {currentTab === 'courses' && (
          <CoursesList
            courses={courses}
            students={students}
            activeYearId={activeYearId}
            onNewCourse={() => {
              setCourseToEdit(null);
              setIsCourseModalOpen(true);
            }}
            onEditCourse={(course) => {
              setCourseToEdit(course);
              setIsCourseModalOpen(true);
            }}
            onDeleteCourse={handleDeleteCourse}
            onAssignStudents={(course) => {
              setCourseForAssignment(course);
              setIsAssignStudentsOpen(true);
            }}
            onSelectStudent={(student) => {
              setSelectedStudentDetail(student);
              setIsStudentDetailOpen(true);
            }}
          />
        )}

        {/* TAB 3: CALENDARIO & RICORRENZE */}
        {currentTab === 'calendar' && (
          <CalendarView
            lessons={lessons}
            students={students}
            courses={courses}
            activeYearId={activeYearId}
            onNewSingleLesson={(date, type) => {
              setLessonToEdit(date ? ({ date } as any) : null);
              setLessonModalDefaultType(type || 'lezione');
              setIsLessonModalOpen(true);
            }}
            onPlanRecurring={() => {
              setPreselectedStudentForLesson(null);
              setIsRecurringModalOpen(true);
            }}
            onSelectLesson={(lesson) => {
              setLessonToEdit(lesson);
              setLessonModalDefaultType(lesson.eventType || 'lezione');
              setIsLessonModalOpen(true);
            }}
          />
        )}

        {/* TAB 4: PAGAMENTI & RICEVUTE */}
        {currentTab === 'payments' && (
          <PaymentsList
            payments={payments}
            students={students}
            courses={courses}
            activeYearId={activeYearId}
            onNewPayment={() => {
              setPaymentToEdit(null);
              setPreselectedStudentForPayment(null);
              setIsPaymentModalOpen(true);
            }}
            onEditPayment={handleEditPayment}
            onDeletePayment={handleDeletePayment}
            onPrintReceipt={(payment) => {
              setPaymentForReceipt(payment);
              setIsReceiptPrintOpen(true);
            }}
            onSelectStudent={(student) => {
              setSelectedStudentDetail(student);
              setIsStudentDetailOpen(true);
            }}
          />
        )}

        {/* TAB 5: PREVENTIVI SCUOLE */}
        {currentTab === 'quotes' && (
          <QuotesList
            quotes={quotes}
            activeYearId={activeYearId}
            onNewQuote={() => {
              setQuoteToEdit(null);
              setIsQuoteModalOpen(true);
            }}
            onEditQuote={(quote) => {
              setQuoteToEdit(quote);
              setIsQuoteModalOpen(true);
            }}
            onPrintQuote={(quote) => {
              setQuoteForPrint(quote);
              setIsQuotePrintOpen(true);
            }}
            onDeleteQuote={handleDeleteQuote}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation (Responsive for smartphones) */}
      <MobileNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Student Create/Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        onDelete={handleDeleteStudent}
        initialStudent={studentToEdit}
        courses={courses.filter((c) => c.academicYearId === activeYearId)}
        lessons={lessons}
        activeYearId={activeYearId}
      />

      {/* 2. Student Detail Overview Modal */}
      <StudentDetailModal
        isOpen={isStudentDetailOpen}
        onClose={() => setIsStudentDetailOpen(false)}
        student={selectedStudentDetail}
        courses={courses}
        payments={payments}
        lessons={lessons}
        onEditStudent={(st) => {
          setStudentToEdit(st);
          setIsStudentModalOpen(true);
        }}
        onDeleteStudent={handleDeleteStudent}
        onStatusChange={handleStatusChange}
        onViewDocument={handleViewDocument}
        onNewPaymentForStudent={(st) => {
          setPreselectedStudentForPayment(st);
          setPaymentToEdit(null);
          setIsPaymentModalOpen(true);
        }}
        onEditPayment={handleEditPayment}
        onDeletePayment={handleDeletePayment}
        onPrintReceipt={(p) => {
          setPaymentForReceipt(p);
          setIsReceiptPrintOpen(true);
        }}
        onNewLessonForStudent={(st) => {
          setPreselectedStudentForLesson(st);
          setIsRecurringModalOpen(true);
        }}
        onEditLesson={(l) => {
          setLessonToEdit(l);
          setIsLessonModalOpen(true);
        }}
        onSaveStudent={handleSaveStudent}
        onSaveLesson={handleSaveSingleLesson}
      />

      {/* 3. Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isDocViewerOpen}
        onClose={() => setIsDocViewerOpen(false)}
        document={docToView?.doc}
        studentName={docToView?.studentName}
      />

      {/* 4. Course Create/Edit Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
        initialCourse={courseToEdit}
        students={students}
        activeYearId={activeYearId}
      />

      {/* 5. Course Assign Students Modal */}
      <AssignStudentsModal
        isOpen={isAssignStudentsOpen}
        onClose={() => setIsAssignStudentsOpen(false)}
        course={courseForAssignment}
        students={students}
        onUpdateAssignments={handleUpdateCourseAssignments}
      />

      {/* 6. Recurring Lesson Scheduler Modal */}
      <RecurringLessonModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSaveRecurring={handleSaveRecurringLessons}
        students={students}
        courses={courses}
        activeYearId={activeYearId}
        preselectedStudent={preselectedStudentForLesson}
      />

      {/* 7. Single Lesson Modal (Move / Reschedule / Cancel single instance / Generic Appointment) */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSave={handleSaveSingleLesson}
        onDeleteSingle={handleDeleteSingleLesson}
        onDeleteSeries={handleDeleteSeries}
        lesson={lessonToEdit}
        lessons={lessons}
        students={students}
        courses={courses}
        activeYearId={activeYearId}
        defaultEventType={lessonModalDefaultType}
      />

      {/* 8. Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        onDelete={handleDeletePayment}
        payments={payments}
        students={students}
        courses={courses}
        activeYearId={activeYearId}
        preselectedStudent={preselectedStudentForPayment}
        initialPayment={paymentToEdit}
      />

      {/* 9. Official Receipt Print Modal */}
      <ReceiptPrintModal
        isOpen={isReceiptPrintOpen}
        onClose={() => setIsReceiptPrintOpen(false)}
        payment={paymentForReceipt}
        student={students.find((s) => s.id === paymentForReceipt?.studentId)}
        course={courses.find((c) => c.id === paymentForReceipt?.courseId)}
      />

      {/* 10. School Workshop Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onSave={handleSaveQuote}
        onDelete={handleDeleteQuote}
        initialQuote={quoteToEdit}
        activeYearId={activeYearId}
        quotesCount={quotes.filter((q) => q.academicYearId === activeYearId).length}
      />

      {/* 11. School Workshop Quote Print Modal */}
      <QuotePrintModal
        isOpen={isQuotePrintOpen}
        onClose={() => setIsQuotePrintOpen(false)}
        quote={quoteForPrint}
      />

      {/* 12. Academic Year Manager Modal */}
      <YearManagerModal
        isOpen={isYearManagerOpen}
        onClose={() => setIsYearManagerOpen(false)}
        years={years}
        activeYearId={activeYearId}
        onSelectActiveYear={handleSelectActiveYear}
        onAddYear={handleAddYear}
        onDeleteYear={handleDeleteYear}
        onSetCurrentYear={handleSetCurrentYear}
      />

      {/* 13. Backup & Device Sync Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        appData={appData}
        onRestoreData={(newData) => setAppData(newData)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* 14. Quick New launcher Modal */}
      <QuickNewModal
        isOpen={isQuickNewOpen}
        onClose={() => setIsQuickNewOpen(false)}
        onSelectAction={handleQuickNewAction}
      />

      {/* 15. Supabase Cloud Configuration & Sync Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => {
          setIsSupabaseModalOpen(false);
          setIsCloudConnected(isSupabaseConfigured());
        }}
        appData={appData}
        onSyncFromCloud={handleSyncFromCloud}
      />

    </div>
  );
}
