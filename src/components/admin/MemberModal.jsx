import { useState, useEffect } from 'react';
import { X, Hexagon, Save, AlertCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function MemberModal({ isOpen, onClose, onSave, initialData, artists = [] }) {
  const [formData, setFormData] = useState({
    id: '',
    artist_id: '',
    name: '',
    role: '',
    avatar_url: '',
    zepeto_id: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Only consider editing if initialData actually contains a member id
  const isEditing = Boolean(initialData && initialData.id);

  // Filter groups/trios/duos for member assignment, or fallback to all artists
  const groupArtists = artists.filter(a => a.type !== 'solo');
  const availableArtists = groupArtists.length > 0 ? groupArtists : artists;

  useEffect(() => {
    if (initialData && initialData.id) {
      setFormData({
        id: initialData.id || '',
        artist_id: initialData.artist_id || (availableArtists[0]?.id || ''),
        name: initialData.name || '',
        role: initialData.role || '',
        avatar_url: initialData.avatar_url || initialData.avatar || '',
        zepeto_id: initialData.zepeto_id || initialData.zepetoId || '',
        bio: initialData.bio || '',
        id_manually_edited: true
      });
    } else {
      setFormData({
        id: '',
        artist_id: initialData?.artist_id || availableArtists[0]?.id || '',
        name: '',
        role: 'Main Vocalist',
        avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80',
        zepeto_id: '',
        bio: '',
        id_manually_edited: false
      });
    }
    setError('');
  }, [initialData, isOpen, artists]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from name if not manually edited or if id is empty
      if (name === 'name' && (!prev.id_manually_edited || !prev.id)) {
        updated.id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resolvedId = (formData.id.trim() || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();

    if (!resolvedId || !formData.name.trim() || !formData.artist_id) {
      setError('ID, Nama Member, dan Group Artis wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: resolvedId,
        artist_id: formData.artist_id,
        name: formData.name.trim(),
        role: formData.role.trim() || 'Member',
        avatar_url: formData.avatar_url.trim() || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80',
        zepeto_id: formData.zepeto_id.trim() || `@${resolvedId}_zft`,
        bio: formData.bio.trim()
      };

      await onSave(payload, isEditing);
      onClose();
    } catch (err) {
      console.error('Save member error:', err);
      setError(err.message || 'Gagal menyimpan data member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-white/20 w-full max-w-xl my-8 overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Hexagon className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white uppercase tracking-widest">
              {isEditing ? `Edit Member: ${initialData?.name}` : 'Add Group Member'}
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

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Assign to Group / Unit *
            </label>
            <select
              required
              name="artist_id"
              value={formData.artist_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none"
            >
              <option value="">-- Select Group --</option>
              {availableArtists.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.category || a.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Member Name *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vera, Lyna, Tania"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Member Slug / ID *
              </label>
              <input
                required
                type="text"
                name="id"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value, id_manually_edited: true }))}
                placeholder="e.g. vera, lyna, jiya"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Role / Position
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g. Leader & Main Dancer"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ZEPETO ID
              </label>
              <input
                type="text"
                name="zepeto_id"
                value={formData.zepeto_id}
                onChange={handleChange}
                placeholder="@username_zft"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          <ImageUploader
            label="Avatar / Foto Profil Member (File Lokal)"
            value={formData.avatar_url}
            onChange={(val) => setFormData(prev => ({ ...prev, avatar_url: val }))}
            aspectRatio="1/1"
            required
            helperText="Rasio 1:1 (Persegi)"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Bio & Introduction
            </label>
            <textarea
              rows="3"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Member specialty, personality, and virtual idol lore..."
              className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none resize-none"
            ></textarea>
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
                  {isEditing ? 'Save Changes' : 'Create Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
