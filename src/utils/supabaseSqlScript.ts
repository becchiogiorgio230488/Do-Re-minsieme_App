/**
 * Complete SQL Script ready to copy-paste into the Supabase SQL Editor.
 * Sets up all tables, relationships, foreign keys, indexes, storage buckets, and functions
 * for the DO-RE-MINSIEME management platform.
 */
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- DO-RE-MINSIEME - SCRIPT DI INIZIALIZZAZIONE DATABASE SUPABASE
-- Esegui questo script nel SQL Editor di Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. TABELLA: ANNI ACCADEMICI (academic_years)
CREATE TABLE IF NOT EXISTS public.academic_years (
    id TEXT PRIMARY KEY,                       -- es. '2026-2027'
    name TEXT NOT NULL,                        -- es. '2026 / 2027'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELLA: CORSI (courses)
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,                       -- es. 'course-1'
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                        -- es. 'Canto Singolo'
    type TEXT NOT NULL,                        -- 'canto_singolo', 'canto_coppia', 'coro', etc.
    description TEXT,
    target_age TEXT,
    default_hourly_rate NUMERIC(10,2),
    default_monthly_rate NUMERIC(10,2),
    color TEXT DEFAULT '#ec4899',
    max_students INTEGER,
    room TEXT,
    day_of_week INTEGER,
    default_time_slot TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELLA: ALLIEVI (students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,                       -- es. 'stud-1'
    academic_year_id TEXT REFERENCES public.academic_years(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    fiscal_code TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    is_minor BOOLEAN DEFAULT TRUE,
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    parent_fiscal_code TEXT,
    medical_notes TEXT,
    notes TEXT,
    course_ids JSONB DEFAULT '[]'::jsonb,      -- Array di ID corsi a cui è iscritto
    status TEXT NOT NULL DEFAULT 'attivo',     -- 'attivo', 'sospeso', 'ritirato'
    registration_sheet JSONB,                  -- File foglio iscrizione (URL Storage, nome, data)
    studied_songs JSONB DEFAULT '[]'::jsonb,   -- Elenco brani studiati / repertorio
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELLA: LEZIONI & DIARIO (lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY,                       -- es. 'les-1'
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    student_id TEXT REFERENCES public.students(id) ON DELETE SET NULL,
    student_ids JSONB DEFAULT '[]'::jsonb,     -- Per lezioni di gruppo o coppia
    title TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,                  -- '14:30'
    end_time TEXT NOT NULL,                    -- '15:30'
    room TEXT,
    status TEXT NOT NULL DEFAULT 'programmata', -- 'programmata', 'completata', 'assente', etc.
    is_recurring_instance BOOLEAN DEFAULT FALSE,
    recurring_series_id TEXT,
    -- Campi per appuntamenti ed eventi generici del calendario
    event_type TEXT DEFAULT 'lezione',          -- 'lezione' | 'appuntamento'
    event_category TEXT,                       -- 'riunione', 'personale', 'evento_scuola', 'scadenza', 'altro'
    event_color TEXT,                          -- Colore esadecimale badge
    description TEXT,                          -- Descrizione estesa dell'evento
    topics_covered TEXT,                       -- Argomenti trattati a lezione
    songs_studied JSONB DEFAULT '[]'::jsonb,   -- Titoli brani affrontati nella lezione
    lesson_rating TEXT,                        -- 'eccellente', 'ottimo', 'buono', etc.
    homework TEXT,                             -- Compiti / esercizi assegnati
    next_goals TEXT,                           -- Obiettivi per la prossima volta
    notes TEXT,                                -- Note libere del docente
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Colonne aggiuntive per retrocompatibilità su tabelle lessons preesistenti
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'lezione';
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS event_category TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS event_color TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. TABELLA: PAGAMENTI E RICEVUTE (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,                       -- es. 'pay-1'
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    receipt_number INTEGER NOT NULL,           -- Progressivo annuale (1, 2, 3...)
    receipt_code TEXT NOT NULL,                -- es. '001/26-27'
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id TEXT REFERENCES public.courses(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,             -- Quota versata (€)
    date DATE NOT NULL,
    method TEXT NOT NULL,                      -- 'contanti', 'satispay', etc.
    description TEXT NOT NULL,                 -- Quota mensile o causale
    payer_name TEXT NOT NULL,                  -- Intestatario della ricevuta
    payer_fiscal_code TEXT,
    notes TEXT,
    issued_by TEXT DEFAULT 'Do-Re-MInsieme',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_receipt_per_academic_year UNIQUE (academic_year_id, receipt_number)
);

-- 6. TABELLA: PREVENTIVI LABORATORI SCUOLE (school_quotes)
CREATE TABLE IF NOT EXISTS public.school_quotes (
    id TEXT PRIMARY KEY,                       -- es. 'quote-1'
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,                -- es. 'PREV-2026/01'
    date DATE NOT NULL,
    school_name TEXT NOT NULL,
    school_address TEXT,
    contact_person TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    project_title TEXT NOT NULL,
    description TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,           -- Fasce d'età con ore, tariffe e lezioni aperte
    open_lessons_scope TEXT DEFAULT 'per_item', -- 'per_item', 'global', 'none'
    has_open_lessons BOOLEAN DEFAULT FALSE,
    open_lessons_details TEXT,
    include_open_lesson_cost BOOLEAN DEFAULT FALSE,
    open_lessons_cost NUMERIC(10,2) DEFAULT 0,
    materials_included TEXT,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    validity_days INTEGER DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'bozza',      -- 'bozza', 'inviato', 'approvato', 'rifiutato'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDICI PER PERFORMANCE OTTIMALI
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_year ON public.courses(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_students_year ON public.students(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_lessons_year_date ON public.lessons(academic_year_id, date);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_year_date ON public.payments(academic_year_id, date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(academic_year_id, receipt_number);
CREATE INDEX IF NOT EXISTS idx_school_quotes_year ON public.school_quotes(academic_year_id, date);

-- ==============================================================================
-- FUNZIONE SICURA PER PROGRESSIVO RICEVUTA (MAX(receipt_number) + 1)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_next_receipt_number(p_academic_year_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(receipt_number), 0) + 1
    INTO next_num
    FROM public.payments
    WHERE academic_year_id = p_academic_year_id;
    
    RETURN next_num;
END;
$$;

-- ==============================================================================
-- CONFIGURAZIONE ROW LEVEL SECURITY (RLS)
-- Abilita RLS con accesso consentito per utenti autorizzati/chiave anon
-- ==============================================================================
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_quotes ENABLE ROW LEVEL SECURITY;

-- Policy di accesso completo per la chiave anon del gestionale
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anon full access academic_years" ON public.academic_years;
    CREATE POLICY "Anon full access academic_years" ON public.academic_years FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Anon full access courses" ON public.courses;
    CREATE POLICY "Anon full access courses" ON public.courses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Anon full access students" ON public.students;
    CREATE POLICY "Anon full access students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Anon full access lessons" ON public.lessons;
    CREATE POLICY "Anon full access lessons" ON public.lessons FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Anon full access payments" ON public.payments;
    CREATE POLICY "Anon full access payments" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Anon full access school_quotes" ON public.school_quotes;
    CREATE POLICY "Anon full access school_quotes" ON public.school_quotes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- CREAZIONE STORAGE BUCKET PER ALLEGATI E FOGLI DI ISCRIZIONE
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('registration-sheets', 'registration-sheets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy pubblica di lettura/scrittura per il bucket registration-sheets
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access registration-sheets" ON storage.objects;
    CREATE POLICY "Public access registration-sheets" ON storage.objects FOR ALL TO anon, authenticated
    USING (bucket_id = 'registration-sheets')
    WITH CHECK (bucket_id = 'registration-sheets');
END $$;
`;
