import React, { useState, useEffect } from 'react';
import { X, Music, Disc, Check, Sparkles, BookOpen } from 'lucide-react';
import { StudiedSong, SongStatus } from '../../types';

interface SongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: StudiedSong) => void;
  song?: StudiedSong | null;
  studentName: string;
}

const SONG_STATUSES: { value: SongStatus; label: string; desc: string; color: string }[] = [
  { 
    value: 'in_studio', 
    label: 'In Studio', 
    desc: 'Lavoro attivo su melodia e tecnica',
    color: 'border-blue-200 bg-blue-50/70 text-blue-800'
  },
  { 
    value: 'perfezionamento', 
    label: 'Perfezionamento', 
    desc: 'Rifinitura dinamiche ed espressività',
    color: 'border-amber-200 bg-amber-50/70 text-amber-800'
  },
  { 
    value: 'completato', 
    label: 'Completato', 
    desc: 'Acquisito nel repertorio attivo',
    color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
  },
  { 
    value: 'in_programma', 
    label: 'In Programma', 
    desc: 'Scelto per le prossime lezioni',
    color: 'border-slate-200 bg-slate-50 text-slate-700'
  },
];

const GENRES_SUGGESTIONS = [
  'Pop',
  'Cantautorato italiano',
  'Musical / Broadway',
  'Rock',
  'Jazz / Soul',
  'Disney / Colonne sonore',
  'Canto Corale',
  'Classica / Lirica',
];

export const SongModal: React.FC<SongModalProps> = ({
  isOpen,
  onClose,
  onSave,
  song,
  studentName,
}) => {
  const [title, setTitle] = useState('');
  const [artistOrComposer, setArtistOrComposer] = useState('');
  const [status, setStatus] = useState<SongStatus>('in_studio');
  const [keyOrTone, setKeyOrTone] = useState('');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');
  const [startedDate, setStartedDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtistOrComposer(song.artistOrComposer || '');
      setStatus(song.status);
      setKeyOrTone(song.keyOrTone || '');
      setGenre(song.genre || '');
      setNotes(song.notes || '');
      setStartedDate(song.startedDate || '');
      setCompletedDate(song.completedDate || '');
    } else {
      setTitle('');
      setArtistOrComposer('');
      setStatus('in_studio');
      setKeyOrTone('Tonalità originale');
      setGenre('Pop');
      setNotes('');
      setStartedDate(new Date().toISOString().slice(0, 10));
      setCompletedDate('');
    }
  }, [song, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const savedSong: StudiedSong = {
      id: song?.id || `song-${Date.now()}`,
      title: title.trim(),
      artistOrComposer: artistOrComposer.trim() || undefined,
      status,
      keyOrTone: keyOrTone.trim() || undefined,
      genre: genre.trim() || undefined,
      notes: notes.trim() || undefined,
      startedDate: startedDate || undefined,
      completedDate: status === 'completato' ? (completedDate || new Date().toISOString().slice(0, 10)) : undefined,
    };

    onSave(savedSong);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-linear-to-r from-rose-50 to-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {song ? 'Modifica Brano del Repertorio' : 'Aggiungi Brano al Repertorio'}
              </h3>
              <p className="text-xs text-slate-500">
                Allievo: <span className="font-semibold text-slate-700">{studentName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Title & Artist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titolo del Brano <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Music className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Hallelujah, La cura, Shallow, Sally..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Artista / Autore / Compositore
            </label>
            <div className="relative">
              <Disc className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={artistOrComposer}
                onChange={(e) => setArtistOrComposer(e.target.value)}
                placeholder="Es. Leonard Cohen, Franco Battiato, Lady Gaga..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Status selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Stato di Avanzamento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SONG_STATUSES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setStatus(st.value)}
                  className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                    status === st.value
                      ? `${st.color} border-current ring-2 ring-rose-500/20 font-bold`
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{st.label}</span>
                    {status === st.value && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Key / Tonality & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tonalità Adottata
              </label>
              <input
                type="text"
                value={keyOrTone}
                onChange={(e) => setKeyOrTone(e.target.value)}
                placeholder="Es. Do magg., -1 semitono, Tonalità originale"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Genere Musicale
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Es. Pop, Cantautorato, Musical"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500"
              />
            </div>
          </div>

          {/* Quick genre pills */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {GENRES_SUGGESTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenre(g)}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {g}
              </button>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Inizio Studio
              </label>
              <input
                type="date"
                value={startedDate}
                onChange={(e) => setStartedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Completamento
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Technical and pedagogical notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note Tecniche & Indicazioni Didattiche sul Brano
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Es. Attenzione all'intonazione sul ritornello alto; curare la dinamica da pianissimo a forte; respirare prima dell'inciso senza fretta..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-rose-500 resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Salva nel Repertorio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
