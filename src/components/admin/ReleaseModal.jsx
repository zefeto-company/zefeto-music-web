import { useState, useEffect } from 'react';
import { X, Hexagon, Save, AlertCircle, Music, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function ReleaseModal({ isOpen, onClose, onSave, initialData, artists = [] }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'Single',
    release_date: new Date().toISOString().split('T')[0],
    cover_url: '',
    description: '',
    artist_id: '',
    spotify: 'https://spotify.com/',
    youtube: 'https://youtube.com/'
  });
  const [tracklist, setTracklist] = useState([
    { title: '', duration: '3:20' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      // Find attached artist
      const currentArtistId = initialData.release_artists?.[0]?.artist_id || initialData.artists?.[0]?.id || (artists[0]?.id || '');
      setFormData({
        id: initialData.id || '',
        title: initialData.title || '',
        type: initialData.type || 'Single',
        release_date: initialData.release_date || initialData.releaseDate || new Date().toISOString().split('T')[0],
        cover_url: initialData.cover_url || initialData.cover || '',
        description: initialData.description || '',
        artist_id: currentArtistId,
        spotify: initialData.links?.spotify || 'https://spotify.com/',
        youtube: initialData.links?.youtube || 'https://youtube.com/'
      });

      const existingTracks = initialData.tracklist || initialData.links?.tracklist || [];
      if (Array.isArray(existingTracks) && existingTracks.length > 0) {
        setTracklist(existingTracks);
      } else if (initialData.title) {
        setTracklist([
          { title: initialData.title, duration: '3:20' }
        ]);
      } else {
        setTracklist([{ title: '', duration: '3:20' }]);
      }
    } else {
      setFormData({
        id: '',
        title: '',
        type: 'Single',
        release_date: new Date().toISOString().split('T')[0],
        cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80',
        description: '',
        artist_id: artists[0]?.id || '',
        spotify: 'https://spotify.com/',
        youtube: 'https://youtube.com/'
      });
      setTracklist([{ title: '', duration: '3:20' }]);
    }
    setError('');
  }, [initialData, isOpen, artists]);

  const handleTrackChange = (index, field, value) => {
    setTracklist(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value, title_manually_edited: true };
      return next;
    });
  };

  const handleAddTrack = () => {
    setTracklist(prev => [...prev, { title: '', duration: '3:20' }]);
  };

  const handleRemoveTrack = (index) => {
    setTracklist(prev => {
      if (prev.length <= 1) return [{ title: '', duration: '3:20' }];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleMoveTrack = (index, direction) => {
    setTracklist(prev => {
      const next = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (!isEditing && name === 'title') {
        updated.id = 'rel-' + value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setTracklist(prev => {
          if (prev.length === 1 && !prev[0].title_manually_edited) {
            return [{ title: value, duration: prev[0].duration || '3:20' }];
          }
          return prev;
        });
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resolvedId = (formData.id.trim() || ('rel-' + formData.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))).toLowerCase();

    if (!resolvedId || !formData.title.trim() || !formData.artist_id) {
      setError('ID, Judul Rilis, dan Artis pengisi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanedTracklist = tracklist
        .map(t => ({ title: t.title.trim(), duration: (t.duration || '3:20').trim() }))
        .filter(t => t.title.length > 0);

      const finalTracklist = cleanedTracklist.length > 0 
        ? cleanedTracklist 
        : [{ title: formData.title.trim(), duration: '3:20' }];

      const payload = {
        id: resolvedId,
        title: formData.title.trim(),
        type: formData.type,
        release_date: formData.release_date,
        cover_url: formData.cover_url.trim() || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80',
        description: formData.description.trim(),
        links: {
          ...(formData.spotify && { spotify: formData.spotify }),
          ...(formData.youtube && { youtube: formData.youtube }),
          tracklist: finalTracklist
        },
        artist_id: formData.artist_id
      };

      await onSave(payload, isEditing);
      onClose();
    } catch (err) {
      console.error('Save release error:', err);
      if (err.message?.includes('releases_type_check')) {
        setError(`Tipe "${formData.type}" belum diizinkan oleh database constraint (releases_type_check). Silakan jalankan perintah SQL berikut di Supabase SQL Editor: ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_type_check; atau pilih tipe Single / Mini Album / Full Album.`);
      } else {
        setError(err.message || 'Gagal menyimpan data rilis musik.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-white/20 w-full max-w-2xl my-8 overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Hexagon className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white uppercase tracking-widest">
              {isEditing ? `Edit Release: ${initialData?.title}` : 'Add New Discography Release'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-950/40 border border-red-500/50 flex items-center gap-3 text-red-400 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Release Title *
              </label>
              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Digital Monochrome"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Release Slug / ID *
              </label>
              <input
                required
                type="text"
                name="id"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                placeholder="e.g. rel-01, rel-digital-mono"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Performing Artist *
              </label>
              <select
                required
                name="artist_id"
                value={formData.artist_id}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none"
              >
                <option value="">-- Select Artist --</option>
                {artists.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.category || a.type})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Release Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none"
              >
                <option value="Single">Single</option>
                <option value="Digital Single">Digital Single</option>
                <option value="Single Album">Single Album</option>
                <option value="Mini Album">Mini Album</option>
                <option value="Full Album">Full Album</option>
                <option value="Special Release">Special Release</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Release Date *
            </label>
            <input
              required
              type="date"
              name="release_date"
              value={formData.release_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
            />
          </div>

          <ImageUploader
            label="Cover Artwork Album / Rilis (File Lokal)"
            value={formData.cover_url}
            onChange={(val) => setFormData(prev => ({ ...prev, cover_url: val }))}
            aspectRatio="1/1"
            required
            helperText="Rasio 1:1 (Persegi)"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Release Description / Concept Notes
            </label>
            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Song concept, production lore, composer credits..."
              className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none resize-none"
            ></textarea>
          </div>

          {/* Tracklist Management Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-white" />
                  Tracklist Catalog ({tracklist.length} Tracks)
                </label>
                <p className="text-[11px] text-slate-500">
                  Kelola daftar lagu, susunan track, dan durasi audio rilis ini.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTrack}
                className="self-start sm:self-auto px-3 py-1.5 border border-white/20 hover:border-white text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Lagu
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tracklist.map((track, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 bg-black border border-white/10 hover:border-white/30 transition-colors">
                  <span className="w-7 text-center text-xs font-mono text-slate-500 shrink-0 font-bold">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) => handleTrackChange(idx, 'title', e.target.value)}
                    placeholder={`Track ${idx + 1} Title`}
                    className="flex-grow px-3 py-2 bg-white/5 border border-white/10 focus:border-white text-white text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={track.duration}
                    onChange={(e) => handleTrackChange(idx, 'duration', e.target.value)}
                    placeholder="3:20"
                    className="w-20 px-2.5 py-2 bg-white/5 border border-white/10 focus:border-white text-white text-xs outline-none font-mono text-center shrink-0"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveTrack(idx, -1)}
                      className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === tracklist.length - 1}
                      onClick={() => handleMoveTrack(idx, 1)}
                      className="p-1.5 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(idx)}
                      className="p-1.5 text-red-500 hover:text-red-300 transition-colors ml-1"
                      title="Delete Track"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-white/10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Spotify Streaming URL
              </label>
              <input
                type="url"
                name="spotify"
                value={formData.spotify}
                onChange={handleChange}
                placeholder="https://open.spotify.com/track/..."
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-xs outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                YouTube MV URL
              </label>
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-white/20 text-slate-400 hover:text-white hover:border-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Save Changes' : 'Create Release'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
