import { useState, useEffect, useMemo } from 'react';
import { X, Hexagon, Save, AlertCircle, Music, Plus, Trash2, ArrowUp, ArrowDown, Users, Sparkles } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function ReleaseModal({ isOpen, onClose, onSave, initialData, artists = [], members = [] }) {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    type: 'Single',
    release_date: new Date().toISOString().split('T')[0],
    cover_url: '',
    description: '',
    spotify: 'https://spotify.com/',
    youtube: 'https://youtube.com/'
  });
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [artistSelectValue, setArtistSelectValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [tracklist, setTracklist] = useState([
    { title: '', duration: '3:20' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData && initialData.id);

  // Derive all individual member options grouped by unit
  const allMemberOptions = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. From artists with nested members
    artists.forEach(a => {
      (a.members || []).forEach(m => {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          list.push({
            id: m.id,
            name: m.name,
            groupId: a.id,
            groupName: a.name,
            role: m.role || 'Member'
          });
        }
      });
    });

    // 2. From extra members list if supplied
    members.forEach(m => {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        const parentArtist = artists.find(a => a.id === m.artist_id);
        list.push({
          id: m.id,
          name: m.name,
          groupId: m.artist_id || parentArtist?.id || '',
          groupName: m.artist_name || parentArtist?.name || 'Unit',
          role: m.role || 'Member'
        });
      }
    });

    return list;
  }, [artists, members]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        title: initialData.title || '',
        type: initialData.type || 'Single',
        release_date: initialData.release_date || initialData.releaseDate || new Date().toISOString().split('T')[0],
        cover_url: initialData.cover_url || initialData.cover || '',
        description: initialData.description || '',
        spotify: initialData.links?.spotify || 'https://spotify.com/',
        youtube: initialData.links?.youtube || 'https://youtube.com/'
      });

      // Extract existing artists / collaborators
      let currentArtists = [];
      if (initialData.links?.artists && Array.isArray(initialData.links.artists) && initialData.links.artists.length > 0) {
        currentArtists = initialData.links.artists;
      } else if (initialData.artists && Array.isArray(initialData.artists) && initialData.artists.length > 0) {
        currentArtists = initialData.artists.map(a => ({
          id: a.id || a.name,
          name: a.name,
          type: a.type || 'artist',
          parent_artist_id: a.id || a.parent_artist_id
        }));
      } else if (initialData.release_artists && Array.isArray(initialData.release_artists) && initialData.release_artists.length > 0) {
        currentArtists = initialData.release_artists
          .map(ra => ra.artists)
          .filter(Boolean)
          .map(a => ({
            id: a.id,
            name: a.name,
            type: a.type || 'artist',
            parent_artist_id: a.id
          }));
      } else if (initialData.artist_id) {
        const found = artists.find(a => a.id === initialData.artist_id);
        currentArtists = [
          found 
            ? { id: found.id, name: found.name, type: 'artist', parent_artist_id: found.id } 
            : { id: initialData.artist_id, name: initialData.artist_id, type: 'artist', parent_artist_id: initialData.artist_id }
        ];
      }
      setSelectedArtists(currentArtists);

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
        spotify: 'https://spotify.com/',
        youtube: 'https://youtube.com/'
      });
      // Default to first artist if available
      const defaultArtist = artists[0] 
        ? [{ id: artists[0].id, name: artists[0].name, type: 'artist', parent_artist_id: artists[0].id }] 
        : [];
      setSelectedArtists(defaultArtist);
      setTracklist([{ title: '', duration: '3:20' }]);
    }
    setArtistSelectValue('');
    setShowCustomInput(false);
    setCustomName('');
    setError('');
  }, [initialData, isOpen, artists]);

  const handleAddArtistFromSelect = (value) => {
    if (!value) return;

    if (value.startsWith('artist:')) {
      const aId = value.replace('artist:', '');
      const a = artists.find(item => item.id === aId);
      if (a) {
        const exists = selectedArtists.some(item => item.id === a.id);
        if (!exists) {
          setSelectedArtists(prev => [
            ...prev,
            { id: a.id, name: a.name, type: 'artist', parent_artist_id: a.id }
          ]);
        }
      }
    } else if (value.startsWith('member:')) {
      const mId = value.replace('member:', '');
      const m = allMemberOptions.find(item => item.id === mId);
      if (m) {
        const itemKey = `member-${m.id}`;
        const formattedName = `${m.name} of ${m.groupName}`;
        const exists = selectedArtists.some(item => item.id === itemKey || item.name.toLowerCase() === formattedName.toLowerCase());
        if (!exists) {
          setSelectedArtists(prev => [
            ...prev,
            {
              id: itemKey,
              name: formattedName,
              type: 'member',
              member_id: m.id,
              parent_artist_id: m.groupId
            }
          ]);
        }
      }
    }
    setArtistSelectValue('');
  };

  const handleAddCustomArtist = () => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    const exists = selectedArtists.some(item => item.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      setSelectedArtists(prev => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          name: trimmed,
          type: 'custom',
          parent_artist_id: artists[0]?.id || null
        }
      ]);
    }
    setCustomName('');
    setShowCustomInput(false);
  };

  const handleRemoveArtist = (index) => {
    setSelectedArtists(prev => prev.filter((_, i) => i !== index));
  };

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

    if (!resolvedId || !formData.title.trim()) {
      setError('ID dan Judul Rilis wajib diisi.');
      return;
    }

    if (selectedArtists.length === 0) {
      setError('Pilih minimal 1 artis atau member pengisi rilis kolaborasi.');
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

      // Determine parent artist IDs that actually exist in the `artists` table
      const parentArtistIds = Array.from(new Set(
        selectedArtists
          .map(a => a.parent_artist_id || a.id)
          .filter(id => id && artists.some(art => art.id.toLowerCase() === id.toLowerCase()))
      ));

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
          tracklist: finalTracklist,
          artists: selectedArtists
        },
        artist_id: parentArtistIds[0] || (artists[0]?.id || ''),
        parent_artist_ids: parentArtistIds
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

          {/* Performing Artists & Collaborators */}
          <div className="space-y-3 p-4 bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  Performing Artists & Collaborators *
                </label>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {selectedArtists.length} {selectedArtists.length === 1 ? 'Artist' : 'Artists'} Selected
              </span>
            </div>

            {/* Selected Artist Badges */}
            <div className="flex flex-wrap gap-2 min-h-[46px] p-2.5 bg-black border border-white/20 items-center">
              {selectedArtists.length === 0 ? (
                <span className="text-xs text-slate-500 italic px-1">
                  Belum ada artis yang dipilih. Pilih artis atau member di bawah.
                </span>
              ) : (
                selectedArtists.map((art, idx) => (
                  <div 
                    key={art.id || idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 hover:border-white/50 text-white text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <span className="text-[11px] opacity-70">
                      {art.type === 'member' ? '👤' : art.type === 'custom' ? '✨' : '👥'}
                    </span>
                    <span>{art.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArtist(idx)}
                      className="text-slate-400 hover:text-red-400 ml-1 p-0.5 transition-colors"
                      title="Hapus artis ini"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Selection Dropdown & Custom Collab Button */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <select
                value={artistSelectValue}
                onChange={(e) => handleAddArtistFromSelect(e.target.value)}
                className="flex-grow px-4 py-2.5 bg-black border border-white/20 hover:border-white/50 focus:border-white text-white text-xs font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="">+ Tambah Artis / Member Kolaborasi...</option>
                
                <optgroup label="── 👥 GRUP & SOLOIST ──">
                  {artists.map(a => (
                    <option key={a.id} value={`artist:${a.id}`}>
                      {a.name} ({a.category || a.type || 'Artist'})
                    </option>
                  ))}
                </optgroup>

                <optgroup label="── 👤 MEMBER SATUAN (UNIT) ──">
                  {allMemberOptions.map(m => (
                    <option key={`m-${m.id}`} value={`member:${m.id}`}>
                      {m.name} of {m.groupName}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => setShowCustomInput(prev => !prev)}
                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-white border border-white/20 hover:border-white transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                <span>{showCustomInput ? 'Batal Eksternal' : '+ Artis Luar'}</span>
              </button>
            </div>

            {/* Custom External Artist Input */}
            {showCustomInput && (
              <div className="flex gap-2 p-3 bg-neutral-900 border border-white/20 mt-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Virtual Guest Star, DJ Metaverse"
                  className="flex-grow px-3 py-2 bg-black border border-white/20 text-white text-xs outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomArtist();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomArtist}
                  className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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
