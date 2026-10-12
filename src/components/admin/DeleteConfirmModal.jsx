import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, itemType, isDeleting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-black border border-red-500/40 w-full max-w-md overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-white">
              Confirm Record Deletion
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Are you sure you want to permanently delete this {itemType || 'record'}?
          </p>
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 font-mono text-xs break-all">
            {title || 'Selected Item'}
          </div>
          <p className="text-slate-500 text-xs">
            This action will remove the record directly from the Supabase database and cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 border border-white/20 text-slate-400 hover:text-white hover:border-white text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Record
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
