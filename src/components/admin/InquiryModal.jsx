import { X, Mail, Calendar, User, Trash2 } from 'lucide-react';

export default function InquiryModal({ isOpen, onClose, inquiry, onDelete }) {
  if (!isOpen || !inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-black border border-white/20 w-full max-w-xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold text-white uppercase tracking-widest">
              Transmission Details
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
            <span className="text-slate-400 uppercase">Status</span>
            <span className="px-2 py-0.5 bg-green-950/60 border border-green-500/40 text-green-400 uppercase font-bold text-[10px]">
              {inquiry.status || 'Received'}
            </span>
          </div>

          <div className="p-4 bg-black border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 text-slate-500" />
              <strong className="text-white text-sm">{inquiry.name}</strong>
              <span className="text-slate-500">&lt;{inquiry.email}&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(inquiry.created_at).toLocaleString()}</span>
              <span className="mx-2">•</span>
              <span className="text-white font-bold uppercase">{inquiry.category}</span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Subject Line</span>
            <div className="p-3 bg-white/5 border border-white/10 text-white font-sans text-sm font-bold">
              {inquiry.subject}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider block">Message Payload</span>
            <div className="p-4 bg-white/5 border border-white/10 text-slate-300 font-sans text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {inquiry.message}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              onDelete(inquiry);
              onClose();
            }}
            className="px-4 py-2.5 border border-red-900/50 text-red-400 hover:bg-red-950/40 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
