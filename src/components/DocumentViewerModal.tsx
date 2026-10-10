import React from 'react';
import { X, Download, Printer, FileText } from 'lucide-react';
import { AttachmentFile } from '../types';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: AttachmentFile;
  studentName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  studentName = 'Allievo',
}) => {
  if (!isOpen || !document) return null;

  const isPdf = document.type.includes('pdf') || document.name.toLowerCase().endsWith('.pdf');
  const isImage = document.type.includes('image') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(document.name);

  const handleDownload = () => {
    const a = window.document.createElement('a');
    a.href = document.dataUrl;
    a.download = document.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    if (isImage) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.name} - ${studentName}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; max-height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${document.dataUrl}" onload="window.print();window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      printWindow.document.write(`
        <html>
          <head><title>${document.name}</title></head>
          <body style="margin:0;">
            <iframe src="${document.dataUrl}" style="width:100%; height:100vh; border:none;"></iframe>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 truncate max-w-md">
                {document.name}
              </h3>
              <p className="text-xs text-slate-500">
                Foglio Iscrizione di {studentName} · Caricato il {document.uploadDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Stampa documento"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="Scarica documento"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100 flex items-center justify-center min-h-[420px]">
          {isImage ? (
            <img
              src={document.dataUrl}
              alt={document.name}
              className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
            />
          ) : isPdf ? (
            <iframe
              src={document.dataUrl}
              title={document.name}
              className="w-full h-[70vh] rounded-lg border border-slate-200 bg-white shadow-sm"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 max-w-md">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 mb-1">{document.name}</p>
              <p className="text-xs text-slate-500 mb-4">
                Formato ({document.type}) non visualizzabile direttamente inline.
              </p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Scarica File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span>Dimensione: {(document.size / 1024).toFixed(1)} KB</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
