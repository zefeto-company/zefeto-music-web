import { useState, useEffect } from 'react';
import { X, Hexagon, Save, AlertCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';

export default function NewsModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    slug: '',
    category: 'Announcement',
    published_date: new Date().toISOString().split('T')[0],
    cover_url: '',
    excerpt: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || null,
        title: initialData.title || '',
        slug: initialData.slug || '',
        category: initialData.category || 'Announcement',
        published_date: initialData.published_date || initialData.date || new Date().toISOString().split('T')[0],
        cover_url: initialData.cover_url || initialData.cover || '',
        excerpt: initialData.excerpt || initialData.summary || '',
        content: initialData.content || ''
      });
    } else {
      setFormData({
        id: null,
        title: '',
        slug: '',
        category: 'Announcement',
        published_date: new Date().toISOString().split('T')[0],
        cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80',
        excerpt: '',
        content: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (!isEditing && name === 'title') {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.slug.trim()) {
      setError('Judul artikel dan Slug wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase(),
        category: formData.category,
        published_date: formData.published_date,
        cover_url: formData.cover_url.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80',
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim() || formData.excerpt.trim()
      };

      if (isEditing && formData.id) {
        payload.id = formData.id;
      }

      await onSave(payload, isEditing);
      onClose();
    } catch (err) {
      console.error('Save news error:', err);
      setError(err.message || 'Gagal menyimpan artikel berita.');
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
              {isEditing ? `Edit Publication: ${initialData?.title}` : 'Publish Press Transmission'}
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
              Headline / Title *
            </label>
            <input
              required
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Zefeto Music Announces Global Virtual Tour 2026"
              className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Slug URL *
              </label>
              <input
                required
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. global-virtual-tour-2026"
                className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none"
              >
                <option value="Announcement">Announcement</option>
                <option value="Press Release">Press Release</option>
                <option value="Comeback Teaser">Comeback Teaser</option>
                <option value="Virtual Event">Virtual Event</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Transmission Date *
            </label>
            <input
              required
              type="date"
              name="published_date"
              value={formData.published_date}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-black border border-white/20 focus:border-white text-white text-sm outline-none font-mono"
            />
          </div>

          <ImageUploader
            label="Cover Banner Publikasi / Berita (File Lokal)"
            value={formData.cover_url}
            onChange={(val) => setFormData(prev => ({ ...prev, cover_url: val }))}
            aspectRatio="16/9"
            required
            helperText="Rasio 16:9 (Landscape)"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Excerpt / Brief Summary *
            </label>
            <textarea
              required
              rows="2"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Short 1-2 sentence overview for the card..."
              className="w-full px-4 py-3 bg-transparent border border-white/20 focus:border-white text-white text-sm outline-none resize-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Full Transmission Payload (Article Content) *
            </label>
            <textarea
              required
              rows="6"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Full press release statement, quotes, and agency announcements..."
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
                  {isEditing ? 'Save Changes' : 'Publish Article'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
