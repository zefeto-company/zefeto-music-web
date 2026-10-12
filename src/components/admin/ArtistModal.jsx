import { useState, useEffect } from 'react';
import { X, Hexagon, Save, AlertCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function ArtistModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'solo',
    category: 'Virtual Pop Soloist',
    avatar_url: '',
    banner_url: '',
    debut_date: new Date().toISOString().split('T')[0],
    zepeto_id: '',
    bio: '',
    tiktok: '',
    instagram: '',
    youtube: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData && initialData.id);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        type: initialData.type || 'solo',
        category: initialData.category || 'Virtual Pop Soloist',
        avatar_url: initialData.avatar_url || initialData.avatar || '',
        banner_url: initialData.banner_url || initialData.banner || '',
        debut_date: initialData.debut_date || initialData.debutDate || new Date().toISOString().split('T')[0],
        zepeto_id: initialData.zepeto_id || initialData.zepetoId || '',
        bio: initialData.bio || '',
        tiktok: initialData.socials?.tiktok || '',
        instagram: initialData.socials?.instagram || '',
        youtube: initialData.socials?.youtube || ''
      });
    } else {
      setFormData({
        id: '',
        name: '',
        type: 'solo',
        category: 'Virtual Pop Soloist',
        avatar_url: 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80',
        banner_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
        debut_date: new Date().toISOString().split('T')[0],
        zepeto_id: '',
        bio: '',
        tiktok: '',
        instagram: '',
        youtube: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // auto-generate slug for new records if user is typing name
      if (!isEditing && name === 'name' && !prev.id_manually_edited) {
        updated.id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resolvedId = (formData.id.trim() || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();

    if (!resolvedId || !formData.name.trim()) {
      setError('ID / Slug dan Nama Artis wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: resolvedId,
        name: formData.name.trim(),
        type: formData.type,
        category: formData.category.trim(),
        avatar_url: formData.avatar_url.trim() || 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80',
        banner_url: formData.banner_url.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
        debut_date: formData.debut_date,
        zepeto_id: formData.zepeto_id.trim() || `@${formData.id.trim()}_zft`,
        bio: formData.bio.trim(),
        socials: {
          ...(formData.tiktok && { tiktok: formData.tiktok }),
          ...(formData.instagram && { instagram: formData.instagram }),
          ...(formData.youtube && { youtube: formData.youtube })
        }
      };

      await onSave(payload, isEditing);
      onClose();
    } catch (err) {
      console.error('Save artist error:', err);
      setError(err.message || 'Gagal menyimpan data artis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-white/20 w-full max-w-2xl my-8 overflow-hidden shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <Hexagon className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white uppercase tracking-widest">
              {isEditing ? `Edit Artist: ${initialData?.name}` : 'Add New Artist Roster'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
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
                Artist Name *
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. VELIN, CINEMATIKA"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Slug / ID (Primary Key) *
              </label>
              <input
                required
                type="text"
                name="id"
                value={formData.id}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, id: e.target.value, id_manually_edited: true }));
                }}
                placeholder="e.g. velin, cinematika"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Type / Format
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none"
              >
                <option value="solo">Soloist (1 Member)</option>
                <option value="duo">Duo (2 Members)</option>
                <option value="trio">Trio (3 Members)</option>
                <option value="group">Group / Unit (4+ Members)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Genre Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Virtual Pop Soloist, Cyber Idol Trio"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Debut Date
              </label>
              <input
                type="date"
                name="debut_date"
                value={formData.debut_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>
          </div>

          <ImageUploader
            label="Avatar / Foto Profil Artis (File Lokal)"
            value={formData.avatar_url}
            onChange={(val) => setFormData(prev => ({ ...prev, avatar_url: val }))}
            aspectRatio="1/1"
            required
            helperText="Rasio 1:1 (Persegi)"
          />

          <ImageUploader
            label="Header Banner Background (File Lokal)"
            value={formData.banner_url}
            onChange={(val) => setFormData(prev => ({ ...prev, banner_url: val }))}
            aspectRatio="16/9"
            helperText="Rasio 16:9 (Landscape)"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Biography & Lore
            </label>
            <textarea
              rows="4"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Enter lore, virtual persona profile, and musical background..."
              className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none resize-none"
            ></textarea>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Social Links
            </span>
            <div className="grid md:grid-cols-3 gap-4">
              <input
                type="url"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="Instagram URL"
                className="w-full px-3 py-2 bg-transparent border border-white/20 focus:border-white text-white text-xs outline-none"
              />
              <input
                type="url"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                placeholder="TikTok URL"
                className="w-full px-3 py-2 bg-transparent border border-white/20 focus:border-white text-white text-xs outline-none"
              />
              <input
                type="url"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="YouTube URL"
                className="w-full px-3 py-2 bg-transparent border border-white/20 focus:border-white text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
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
                  {isEditing ? 'Save Changes' : 'Create Artist'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
