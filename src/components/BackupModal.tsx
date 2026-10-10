import React, { useRef, useState } from 'react';
import { X, Download, Upload, RefreshCw, Smartphone, Monitor, CheckCircle, Database, AlertTriangle, Cloud } from 'lucide-react';
import { AppStateData, exportBackupJson, resetToDemoData } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appData: AppStateData;
  onRestoreData: (data: AppStateData) => void;
  onOpenSupabase?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  appData,
  onRestoreData,
  onOpenSupabase,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJson(appData);
    setSuccessMessage('Backup esportato con successo in formato JSON!');
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.data && parsed.data.students && parsed.data.courses) {
          onRestoreData(parsed.data);
          setSuccessMessage('Backup ripristinato con successo! Tutti i dati sono stati aggiornati.');
          setErrorMessage(null);
          setTimeout(() => setSuccessMessage(null), 4000);
        } else if (parsed.students && parsed.courses) {
          onRestoreData(parsed);
          setSuccessMessage('Backup ripristinato con successo!');
          setErrorMessage(null);
          setTimeout(() => setSuccessMessage(null), 4000);
        } else {
          setErrorMessage('Il file selezionato non sembra essere un backup valido di Do-Re-MInsieme.');
        }
      } catch (err) {
        setErrorMessage('Errore nella lettura del file JSON di backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteResetDemo = () => {
    const demo = resetToDemoData();
    onRestoreData(demo);
    setShowResetConfirm(false);
    setSuccessMessage('Dati demo iniziali ripristinati con successo!');
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Backup & Gestione Dati
              </h3>
              <p className="text-xs text-slate-500">
                Usa l app sia da computer che da cellulare in totale sicurezza.
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Supabase Cloud Sync Card */}
          {onOpenSupabase && (
            <div className="p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Cloud className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Database Cloud Supabase</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sincronizzazione in tempo reale automatica su tutti i tuoi dispositivi senza dover esportare file manuali.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupabase();
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs shrink-0 cursor-pointer"
              >
                Configura Cloud
              </button>
            </div>
          )}

          {/* Sync across PC & Phone tip */}
          <div className="p-4 rounded-xl bg-linear-to-r from-amber-50 to-rose-50 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
              <Smartphone className="w-4 h-4 text-rose-600" />
              <Monitor className="w-4 h-4 text-cyan-600" />
              Accesso da Browser PC e Smartphone
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Puoi aprire questo gestionale sul tuo browser preferito (Chrome, Safari, Edge) sia su PC che su cellulare. Per non perdere nulla e sincronizzare i dati quando vuoi, puoi esportare il backup e ripristinarlo su qualsiasi dispositivo con un clic!
            </p>
          </div>

          {/* Export & Import actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex flex-col justify-between group shadow-2xs cursor-pointer"
            >
              <Download className="w-5 h-5 text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-slate-900">Esporta Backup Completo</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Scarica file JSON con allievi, moduli allegati, ricevute e preventivi.
                </p>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors flex flex-col justify-between group shadow-2xs cursor-pointer"
            >
              <Upload className="w-5 h-5 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold text-slate-900">Ripristina da Backup</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Carica un file JSON precedentemente salvato.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </button>
          </div>

          {/* Reset Demo button */}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ripristina Dati Iniziali Dimostrativi
            </button>
          </div>
        </div>

        {/* Reset Confirmation Overlay */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ripristinare i dati demo?</h4>
              <p className="text-xs text-slate-600 mt-1">
                Tutti i dati attuali verranno sostituiti con i dati demo iniziali della scuola. Questa operazione non può essere annullata.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleExecuteResetDemo}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
                >
                  Sì, ripristina demo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">Do-Re-MInsieme v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
