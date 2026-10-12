import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RefreshCw, CheckCircle2, Link2 } from 'lucide-react';

/**
 * Utility to downscale and compress local image files into efficient WebP/JPEG data URLs
 * Keeps payloads lightweight (~100KB-300KB) for seamless Supabase storage.
 */
function compressImage(file, maxDimension = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // If SVG, read as raw text data url directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer modern WebP, fallback to JPEG
        let dataUrl;
        try {
          dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4)
        });
      };
      img.onerror = () => reject(new Error('Gagal membaca format gambar.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari disk.'));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export default function ImageUploader({
  label = 'Upload Image',
  value = '',
  onChange,
  aspectRatio = '1/1', // '1/1', '16/9', '4/3', etc.
  maxDimension = 1400,
  required = false,
  helperText = ''
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileMeta, setFileMeta] = useState(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file bertipe gambar (JPG, PNG, WEBP, GIF, SVG).');
      return;
    }

    setIsLoading(true);
    try {
      const result = await compressImage(file, maxDimension, 0.85);
      const dataUrl = typeof result === 'string' ? result : result.dataUrl;
      setFileMeta({
        name: file.name,
        size: result.compressedSize || file.size,
        dimensions: result.width ? `${result.width}x${result.height}` : null
      });
      onChange(dataUrl);
    } catch (err) {
      console.error('Image compression error:', err);
      alert('Terjadi kesalahan saat memproses file gambar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setFileMeta({ name: 'External URL', size: null, dimensions: null });
      setShowUrlFallback(false);
      setUrlInput('');
    }
  };

  const isLocalDataUrl = value && value.startsWith('data:image/');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {helperText && (
          <span className="text-[10px] text-slate-500">{helperText}</span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dropzone & Preview Box */}
      {value ? (
        <div className="p-3 bg-black border border-white/20 flex flex-col sm:flex-row items-center gap-4 transition-all">
          {/* Thumbnail preview */}
          <div 
            className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-950 border border-white/10 shrink-0 overflow-hidden relative group"
            style={{ aspectRatio }}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider"
              >
                Ganti
              </button>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex-grow min-w-0 space-y-2 text-left w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-green-950/60 text-green-400 border border-green-500/30">
                <CheckCircle2 className="w-3 h-3" />
                {isLocalDataUrl ? 'File Lokal Siap' : 'Gambar Aktif'}
              </span>
              {fileMeta?.dimensions && (
                <span className="text-[10px] font-mono text-slate-400">
                  {fileMeta.dimensions}
                </span>
              )}
              {fileMeta?.size && (
                <span className="text-[10px] font-mono text-slate-500">
                  ({formatBytes(fileMeta.size)})
                </span>
              )}
            </div>

            <p className="text-white text-xs font-mono truncate max-w-xs">
              {fileMeta?.name || (isLocalDataUrl ? 'local-image-optimized.webp' : value.slice(0, 45) + '...')}
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" /> Pilih File Lain
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 border border-red-900/40 text-red-400 hover:bg-red-950/30 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed cursor-pointer text-center transition-all ${
            isDragging
              ? 'border-white bg-white/10 scale-[1.01]'
              : 'border-white/20 hover:border-white/50 bg-black/40 hover:bg-white/[0.02]'
          }`}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Mengompresi file gambar...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center bg-white/5 text-slate-300 mb-1">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">
                Klik untuk memilih file lokal atau seret ke sini
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Mendukung PNG, JPG, JPEG, WEBP, SVG (Otomatis dikompresi)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative URL Link input toggle */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[10px] text-slate-500 hover:text-slate-300 underline flex items-center gap-1"
        >
          <Link2 className="w-3 h-3" />
          {showUrlFallback ? 'Tutup input URL' : 'Atau tempel URL gambar'}
        </button>
      </div>

      {showUrlFallback && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-grow px-3 py-2 bg-black border border-white/20 text-white text-xs outline-none focus:border-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-slate-200"
          >
            Terapkan
          </button>
        </div>
      )}
    </div>
  );
}
