import { getSupabaseClient, uploadRegistrationSheetToStorage } from './supabaseClient';
import { 
  AcademicYear, 
  Course, 
  Student, 
  Lesson, 
  Payment, 
  SchoolQuote,
  AttachmentFile 
} from '../types';
import { AppStateData } from '../utils/storage';

/**
 * Maps database snake_case columns to TypeScript frontend models
 */
function mapAcademicYearFromDb(row: any): AcademicYear {
  return {
    id: row.id,
    label: row.name || row.label || row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    isCurrent: Boolean(row.is_default),
    notes: row.notes || undefined,
  };
}

function mapAcademicYearToDb(year: AcademicYear): any {
  return {
    id: year.id,
    name: year.label,
    start_date: year.startDate,
    end_date: year.endDate,
    is_default: Boolean(year.isCurrent),
    notes: year.notes || null,
  };
}

function mapCourseFromDb(row: any): Course {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    name: row.name,
    type: row.type,
    description: row.description || '',
    targetAge: row.target_age || undefined,
    defaultHourlyRate: row.default_hourly_rate != null ? Number(row.default_hourly_rate) : undefined,
    defaultMonthlyRate: row.default_monthly_rate != null ? Number(row.default_monthly_rate) : undefined,
    color: row.color || '#ec4899',
    maxStudents: row.max_students != null ? Number(row.max_students) : undefined,
    room: row.room || undefined,
    dayOfWeek: row.day_of_week != null ? Number(row.day_of_week) : undefined,
    defaultTimeSlot: row.default_time_slot || undefined,
    active: row.active !== false,
  };
}

function mapCourseToDb(course: Course, activeYearId: string): any {
  return {
    id: course.id,
    academic_year_id: course.academicYearId || activeYearId,
    name: course.name,
    type: course.type,
    description: course.description || '',
    target_age: course.targetAge || null,
    default_hourly_rate: course.defaultHourlyRate != null ? course.defaultHourlyRate : null,
    default_monthly_rate: course.defaultMonthlyRate != null ? course.defaultMonthlyRate : null,
    color: course.color || '#ec4899',
    max_students: course.maxStudents != null ? course.maxStudents : null,
    room: course.room || null,
    day_of_week: course.dayOfWeek != null ? course.dayOfWeek : null,
    default_time_slot: course.defaultTimeSlot || null,
    active: course.active !== false,
  };
}

function mapStudentFromDb(row: any): Student {
  return {
    id: row.id,
    academicYearId: row.academic_year_id || '',
    firstName: row.first_name,
    lastName: row.last_name,
    birthDate: row.birth_date || undefined,
    fiscalCode: row.fiscal_code || undefined,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || undefined,
    city: row.city || undefined,
    isMinor: row.is_minor !== false,
    parentName: row.parent_name || undefined,
    parentPhone: row.parent_phone || undefined,
    parentEmail: row.parent_email || undefined,
    parentFiscalCode: row.parent_fiscal_code || undefined,
    medicalNotes: row.medical_notes || undefined,
    notes: row.notes || undefined,
    courseIds: Array.isArray(row.course_ids) ? row.course_ids : [],
    registrationSheet: row.registration_sheet || undefined,
    status: row.status || 'attivo',
    studiedSongs: Array.isArray(row.studied_songs) ? row.studied_songs : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapStudentToDb(student: Student): any {
  return {
    id: student.id,
    academic_year_id: student.academicYearId || null,
    first_name: student.firstName,
    last_name: student.lastName,
    birth_date: student.birthDate || null,
    fiscal_code: student.fiscalCode || null,
    phone: student.phone || '',
    email: student.email || '',
    address: student.address || null,
    city: student.city || null,
    is_minor: student.isMinor !== false,
    parent_name: student.parentName || null,
    parent_phone: student.parentPhone || null,
    parent_email: student.parentEmail || null,
    parent_fiscal_code: student.parentFiscalCode || null,
    medical_notes: student.medicalNotes || null,
    notes: student.notes || null,
    course_ids: student.courseIds || [],
    status: student.status || 'attivo',
    registration_sheet: student.registrationSheet || null,
    studied_songs: student.studiedSongs || [],
  };
}

function mapLessonFromDb(row: any): Lesson {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    courseId: row.course_id || undefined,
    studentId: row.student_id || undefined,
    studentIds: Array.isArray(row.student_ids) ? row.student_ids : undefined,
    title: row.title,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    room: row.room || undefined,
    status: row.status || 'programmata',
    isRecurringInstance: Boolean(row.is_recurring_instance),
    recurringSeriesId: row.recurring_series_id || undefined,
    topicsCovered: row.topics_covered || undefined,
    songsStudied: Array.isArray(row.songs_studied) ? row.songs_studied : undefined,
    lessonRating: row.lesson_rating || undefined,
    homework: row.homework || undefined,
    nextGoals: row.next_goals || undefined,
    notes: row.notes || undefined,
  };
}

function mapLessonToDb(lesson: Lesson): any {
  return {
    id: lesson.id,
    academic_year_id: lesson.academicYearId,
    course_id: lesson.courseId || null,
    student_id: lesson.studentId || null,
    student_ids: lesson.studentIds || [],
    title: lesson.title,
    date: lesson.date,
    start_time: lesson.startTime,
    end_time: lesson.endTime,
    room: lesson.room || null,
    status: lesson.status,
    is_recurring_instance: Boolean(lesson.isRecurringInstance),
    recurring_series_id: lesson.recurringSeriesId || null,
    topics_covered: lesson.topicsCovered || null,
    songs_studied: lesson.songsStudied || [],
    lesson_rating: lesson.lessonRating || null,
    homework: lesson.homework || null,
    next_goals: lesson.nextGoals || null,
    notes: lesson.notes || null,
  };
}

function mapPaymentFromDb(row: any): Payment {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    receiptNumber: Number(row.receipt_number),
    receiptCode: row.receipt_code,
    studentId: row.student_id,
    courseId: row.course_id || undefined,
    amount: Number(row.amount),
    date: row.date,
    method: row.method,
    description: row.description || '',
    payerName: row.payer_name || '',
    payerFiscalCode: row.payer_fiscal_code || undefined,
    notes: row.notes || undefined,
    issuedBy: row.issued_by || 'Do-Re-MInsieme',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapPaymentToDb(payment: Payment): any {
  return {
    id: payment.id,
    academic_year_id: payment.academicYearId,
    receipt_number: payment.receiptNumber,
    receipt_code: payment.receiptCode,
    student_id: payment.studentId,
    course_id: payment.courseId || null,
    amount: payment.amount,
    date: payment.date,
    method: payment.method,
    description: payment.description,
    payer_name: payment.payerName,
    payer_fiscal_code: payment.payerFiscalCode || null,
    notes: payment.notes || null,
    issued_by: payment.issuedBy || 'Do-Re-MInsieme',
  };
}

function mapSchoolQuoteFromDb(row: any): SchoolQuote {
  return {
    id: row.id,
    academicYearId: row.academic_year_id,
    quoteNumber: row.quote_number,
    date: row.date,
    schoolName: row.school_name,
    schoolAddress: row.school_address || undefined,
    contactPerson: row.contact_person,
    contactPhone: row.contact_phone || undefined,
    contactEmail: row.contact_email || undefined,
    projectTitle: row.project_title,
    description: row.description,
    items: Array.isArray(row.items) ? row.items : [],
    openLessonsScope: row.open_lessons_scope || 'per_item',
    hasOpenLessons: Boolean(row.has_open_lessons),
    openLessonsDetails: row.open_lessons_details || undefined,
    includeOpenLessonCost: Boolean(row.include_open_lesson_cost),
    openLessonsCost: row.open_lessons_cost != null ? Number(row.open_lessons_cost) : undefined,
    materialsIncluded: row.materials_included || undefined,
    totalAmount: Number(row.total_amount) || 0,
    validityDays: row.validity_days != null ? Number(row.validity_days) : undefined,
    status: row.status || 'bozza',
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapSchoolQuoteToDb(quote: SchoolQuote): any {
  return {
    id: quote.id,
    academic_year_id: quote.academicYearId,
    quote_number: quote.quoteNumber,
    date: quote.date,
    school_name: quote.schoolName,
    school_address: quote.schoolAddress || null,
    contact_person: quote.contactPerson,
    contact_phone: quote.contactPhone || null,
    contact_email: quote.contactEmail || null,
    project_title: quote.projectTitle,
    description: quote.description,
    items: quote.items || [],
    open_lessons_scope: quote.openLessonsScope || 'per_item',
    has_open_lessons: Boolean(quote.hasOpenLessons),
    open_lessons_details: quote.openLessonsDetails || null,
    include_open_lesson_cost: Boolean(quote.includeOpenLessonCost),
    open_lessons_cost: quote.openLessonsCost != null ? quote.openLessonsCost : 0,
    materials_included: quote.materialsIncluded || null,
    total_amount: quote.totalAmount,
    validity_days: quote.validityDays != null ? quote.validityDays : 60,
    status: quote.status || 'bozza',
    notes: quote.notes || null,
  };
}

// ==============================================================================
// COMPLETE APP STATE FETCH
// ==============================================================================

export async function fetchCompleteAppStateFromSupabase(): Promise<AppStateData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [yearsRes, coursesRes, studentsRes, lessonsRes, paymentsRes, quotesRes] = await Promise.all([
      client.from('academic_years').select('*').order('start_date', { ascending: false }),
      client.from('courses').select('*').order('name'),
      client.from('students').select('*').order('last_name'),
      client.from('lessons').select('*').order('date', { ascending: false }),
      client.from('payments').select('*').order('receipt_number', { ascending: false }),
      client.from('school_quotes').select('*').order('date', { ascending: false }),
    ]);

    // Check if critical tables had errors (e.g., table does not exist)
    if (yearsRes.error) {
      console.warn('Supabase fetch error for academic_years:', yearsRes.error.message);
      return null;
    }

    const years = (yearsRes.data || []).map(mapAcademicYearFromDb);
    const courses = (coursesRes.data || []).map(mapCourseFromDb);
    const students = (studentsRes.data || []).map(mapStudentFromDb);
    const lessons = (lessonsRes.data || []).map(mapLessonFromDb);
    const payments = (paymentsRes.data || []).map(mapPaymentFromDb);
    const quotes = (quotesRes.data || []).map(mapSchoolQuoteFromDb);

    // Active year is default one or first available
    const activeYear = years.find((y) => y.isCurrent) || years[0];
    const activeYearId = activeYear ? activeYear.id : '2026-2027';

    return {
      years,
      activeYearId,
      courses,
      students,
      payments,
      lessons,
      quotes,
    };
  } catch (err) {
    console.error('Error fetching complete state from Supabase:', err);
    return null;
  }
}

// ==============================================================================
// ENTITY SYNC OPERATIONS
// ==============================================================================

export async function syncAcademicYearToSupabase(year: AcademicYear): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = mapAcademicYearToDb(year);
  const { error } = await client.from('academic_years').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting academic_year:', error.message);
}

export async function syncCourseToSupabase(course: Course, activeYearId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = mapCourseToDb(course, activeYearId);
  const { error } = await client.from('courses').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting course:', error.message);
}

export async function deleteCourseFromSupabase(courseId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('courses').delete().eq('id', courseId);
  if (error) console.error('Supabase error deleting course:', error.message);
}

export async function syncStudentToSupabase(student: Student): Promise<Student> {
  const client = getSupabaseClient();
  if (!client) return student;

  let studentToSave: Student = { ...student };

  // If there's a registration sheet with inline dataUrl, upload to Supabase Storage bucket
  if (
    student.registrationSheet &&
    student.registrationSheet.dataUrl &&
    student.registrationSheet.dataUrl.startsWith('data:')
  ) {
    const publicUrl = await uploadRegistrationSheetToStorage(student.id, student.registrationSheet);
    if (publicUrl) {
      studentToSave = {
        ...student,
        registrationSheet: {
          ...student.registrationSheet,
          dataUrl: publicUrl,
        },
      };
    }
  }

  const payload = mapStudentToDb(studentToSave);
  const { error } = await client.from('students').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting student:', error.message);

  return studentToSave;
}

export async function deleteStudentFromSupabase(studentId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('students').delete().eq('id', studentId);
  if (error) console.error('Supabase error deleting student:', error.message);
}

export async function syncLessonToSupabase(lesson: Lesson): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = mapLessonToDb(lesson);
  const { error } = await client.from('lessons').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting lesson:', error.message);
}

export async function syncLessonsBulkToSupabase(lessons: Lesson[]): Promise<void> {
  const client = getSupabaseClient();
  if (!client || lessons.length === 0) return;
  const payloads = lessons.map(mapLessonToDb);
  const { error } = await client.from('lessons').upsert(payloads, { onConflict: 'id' });
  if (error) console.error('Supabase error bulk upserting lessons:', error.message);
}

export async function deleteLessonFromSupabase(lessonId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('lessons').delete().eq('id', lessonId);
  if (error) console.error('Supabase error deleting lesson:', error.message);
}

// Safe Receipt Number calculation: MAX(receipt_number) + 1 per academic year
export async function getNextReceiptNumberFromSupabase(academicYearId: string): Promise<{ receiptNumber: number; receiptCode: string }> {
  const client = getSupabaseClient();
  const shortYear = academicYearId.length >= 9
    ? `${academicYearId.slice(2, 4)}-${academicYearId.slice(7, 9)}`
    : academicYearId;

  if (!client) {
    return { receiptNumber: 1, receiptCode: `001/${shortYear}` };
  }

  try {
    // Attempt to invoke SQL function get_next_receipt_number
    const { data: rpcNum, error: rpcError } = await client.rpc('get_next_receipt_number', {
      p_academic_year_id: academicYearId,
    });

    let nextNumber = 1;
    if (!rpcError && typeof rpcNum === 'number') {
      nextNumber = rpcNum;
    } else {
      // Fallback: Query MAX directly
      const { data, error } = await client
        .from('payments')
        .select('receipt_number')
        .eq('academic_year_id', academicYearId)
        .order('receipt_number', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0 && typeof data[0].receipt_number === 'number') {
        nextNumber = data[0].receipt_number + 1;
      }
    }

    const paddedNum = String(nextNumber).padStart(3, '0');
    const receiptCode = `${paddedNum}/${shortYear}`;

    return { receiptNumber: nextNumber, receiptCode };
  } catch (err) {
    console.error('Error calculating next receipt number from Supabase:', err);
    return { receiptNumber: 1, receiptCode: `001/${shortYear}` };
  }
}

export async function syncPaymentToSupabase(payment: Payment): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = mapPaymentToDb(payment);
  const { error } = await client.from('payments').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting payment:', error.message);
}

export async function deletePaymentFromSupabase(paymentId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('payments').delete().eq('id', paymentId);
  if (error) console.error('Supabase error deleting payment:', error.message);
}

export async function syncSchoolQuoteToSupabase(quote: SchoolQuote): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const payload = mapSchoolQuoteToDb(quote);
  const { error } = await client.from('school_quotes').upsert(payload, { onConflict: 'id' });
  if (error) console.error('Supabase error upserting school quote:', error.message);
}

export async function deleteSchoolQuoteFromSupabase(quoteId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('school_quotes').delete().eq('id', quoteId);
  if (error) console.error('Supabase error deleting school quote:', error.message);
}

// ==============================================================================
// MIGRATE LOCAL DATA TO SUPABASE
// ==============================================================================

export async function migrateLocalDataToSupabase(data: AppStateData): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Client Supabase non configurato.' };
  }

  try {
    let totalSynced = 0;

    // 1. Academic Years
    if (data.years.length > 0) {
      const yearPayloads = data.years.map(mapAcademicYearToDb);
      const { error } = await client.from('academic_years').upsert(yearPayloads, { onConflict: 'id' });
      if (error) throw new Error(`Anni accademici: ${error.message}`);
      totalSynced += yearPayloads.length;
    }

    // 2. Courses
    if (data.courses.length > 0) {
      const coursePayloads = data.courses.map((c) => mapCourseToDb(c, data.activeYearId));
      const { error } = await client.from('courses').upsert(coursePayloads, { onConflict: 'id' });
      if (error) throw new Error(`Corsi: ${error.message}`);
      totalSynced += coursePayloads.length;
    }

    // 3. Students (with registration sheets uploaded to storage if needed)
    if (data.students.length > 0) {
      const studentsToSync: Student[] = [];
      for (const s of data.students) {
        if (s.registrationSheet && s.registrationSheet.dataUrl && s.registrationSheet.dataUrl.startsWith('data:')) {
          const publicUrl = await uploadRegistrationSheetToStorage(s.id, s.registrationSheet);
          if (publicUrl) {
            studentsToSync.push({
              ...s,
              registrationSheet: {
                ...s.registrationSheet,
                dataUrl: publicUrl,
              },
            });
            continue;
          }
        }
        studentsToSync.push(s);
      }

      const studentPayloads = studentsToSync.map(mapStudentToDb);
      const { error } = await client.from('students').upsert(studentPayloads, { onConflict: 'id' });
      if (error) throw new Error(`Allievi: ${error.message}`);
      totalSynced += studentPayloads.length;
    }

    // 4. Lessons
    if (data.lessons.length > 0) {
      const lessonPayloads = data.lessons.map(mapLessonToDb);
      const { error } = await client.from('lessons').upsert(lessonPayloads, { onConflict: 'id' });
      if (error) throw new Error(`Lezioni: ${error.message}`);
      totalSynced += lessonPayloads.length;
    }

    // 5. Payments
    if (data.payments.length > 0) {
      const paymentPayloads = data.payments.map(mapPaymentToDb);
      const { error } = await client.from('payments').upsert(paymentPayloads, { onConflict: 'id' });
      if (error) throw new Error(`Pagamenti: ${error.message}`);
      totalSynced += paymentPayloads.length;
    }

    // 6. School Quotes
    if (data.quotes.length > 0) {
      const quotePayloads = data.quotes.map(mapSchoolQuoteToDb);
      const { error } = await client.from('school_quotes').upsert(quotePayloads, { onConflict: 'id' });
      if (error) throw new Error(`Preventivi: ${error.message}`);
      totalSynced += quotePayloads.length;
    }

    return { success: true, count: totalSynced };
  } catch (err: any) {
    console.error('Migration failed:', err);
    return { success: false, count: 0, error: err?.message || String(err) };
  }
}
