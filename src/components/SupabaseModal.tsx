import React, { useState, useEffect } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  Copy, 
  Check, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink,
  Code2,
  KeyRound,
  ShieldCheck,
  Server
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection 
} from '../services/supabaseClient';
import { migrateLocalDataToSupabase } from '../services/supabaseDb';
import { SUPABASE_SQL_SCRIPT } from '../utils/supabaseSqlScript';
import { AppStateData } from '../utils/storage';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppStateData;
  onSyncFromCloud: () => Promise<void>;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  appData,
  onSyncFromCloud,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [source, setSource] = useState<'env' | 'localStorage' | 'none'>('none');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setSource(cfg.source);
      setTestResult(null);
      setMigrationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(url.trim(), anonKey.trim());
      setSource('localStorage');
      // Trigger cloud sync
      await onSyncFromCloud();
    }
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setSource('none');
    setTestResult(null);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationResult(null);
    try {
      const res = await migrateLocalDataToSupabase(appData);
      if (res.success) {
        setMigrationResult(`✓ Dati migrati con successo (${res.count} record sincronizzati su Supabase)!`);
        await onSyncFromCloud();
      } else {
        setMigrationResult(`Errore durante la migrazione: ${res.error}`);
      }
    } catch (err: any) {
      setMigrationResult(`Errore imprevisto: ${err.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      await onSyncFromCloud();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-emerald-50 via-teal-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Integrazione Database Cloud Supabase
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  source !== 'none'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {source !== 'none' ? 'Connessione Attiva' : 'Database Locale'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Archiviazione sicura, persistente e multi-dispositivo con database PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Connessione & Sincronizzazione
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Script SQL Supabase
          </button>
        </div>

        {/* Tab 1: Configuration & Migration */}
        {activeTab === 'config' && (
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* Status card */}
            <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              source !== 'none'
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-amber-50/60 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {source !== 'none' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {source !== 'none'
                      ? 'Gestionale collegato a Supabase Cloud'
                      : 'Attualmente in modalità Database Locale (localStorage)'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {source !== 'none'
                      ? 'I dati degli allievi, lezioni, pagamenti e preventivi vengono salvati in tempo reale sul database cloud PostgreSQL.'
                      : 'I dati sono salvati solo su questo browser. Inserisci URL e Anon Key del tuo progetto Supabase per sincronizzare tutti i dispositivi.'}
                  </p>
                </div>
              </div>

              {source !== 'none' && (
                <button
                  type="button"
                  onClick={handleSyncCloud}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
                  title="Ricarica i dati aggiornati da Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sincronizza
                </button>
              )}
            </div>

            {/* Credential Form */}
            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzabcdefg.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-emerald-500 bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Disponibile in: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon / Public Key <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-emerald-500 bg-white leading-relaxed"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Disponibile in: Supabase Dashboard &gt; Project Settings &gt; API &gt; Project API keys &gt; anon public
                </span>
              </div>

              {/* Feedback box */}
              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <span className="font-bold">{testResult.message}</span>
                    {testResult.error && (
                      <p className="text-[11px] opacity-80 mt-0.5">{testResult.error}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                {source === 'localStorage' && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    Rimuovi credenziali
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {isTesting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-3.5 h-3.5" />
                    )}
                    <span>{isTesting ? 'Verifica in corso...' : 'Testa & Salva Connessione'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Local to Cloud Migration Box */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Migrazione Iniziale dei Dati Locali
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Carica tutti gli allievi, lezioni, pagamenti e preventivi presenti attualmente in locale nel database Supabase.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMigrate}
                  disabled={isMigrating || source === 'none'}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    source === 'none'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                  }`}
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isMigrating ? 'animate-bounce' : ''}`} />
                  <span>{isMigrating ? 'Caricamento in corso...' : 'Carica Dati su Supabase'}</span>
                </button>
              </div>

              {migrationResult && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  migrationResult.startsWith('✓')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {migrationResult}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: SQL Script Guide */}
        {activeTab === 'sql' && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
            
            {/* Guide steps */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">
                Istruzioni Passo-Passo per Configurare Supabase:
              </span>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-700 leading-relaxed">
                <li>
                  Accedi alla tua dashboard Supabase su{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline font-bold inline-flex items-center gap-0.5"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  e apri il tuo progetto.
                </li>
                <li>
                  Nel menu laterale sinistro clicca sull'icona <strong>SQL Editor</strong> (oppure premi il pulsante <em>New Query</em>).
                </li>
                <li>
                  Clicca sul pulsante <strong>"Copia Script SQL Completo"</strong> qui sotto, incollalo nel SQL Editor di Supabase e clicca su <strong>Run</strong> (in verde in basso a destra).
                </li>
                <li>
                  Tutte le 6 tabelle relazionali, gli indici, i bucket di storage e le policy di sicurezza verranno creati automaticamente!
                </li>
              </ol>
            </div>

            {/* Copy Button */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-600">
                Script SQL per PostgreSQL / Supabase
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copiato negli Appunti!' : 'Copia Script SQL Completo'}</span>
              </button>
            </div>

            {/* Script viewer */}
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-72 border border-slate-800">
                {SUPABASE_SQL_SCRIPT}
              </pre>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {source !== 'none' ? 'Database connesso' : 'Database locale attivo'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
