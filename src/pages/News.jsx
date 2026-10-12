import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hexagon, ArrowRight, X } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function News() {
  const [news, setNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase.from('news').select('*');
        if (error) throw error;
        
        const normalized = (data || []).map(a => ({
          ...a,
          summary: a.excerpt || a.summary || a.content?.slice(0, 120) + '...',
          date: a.published_date || a.date || a.created_at || '2026-05-01'
        }));
        setNews(normalized);
      } catch (e) {
        console.error('Error loading news:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading news...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black relative">
      <div className="absolute top-0 left-0 w-full h-96 bg-hex-pattern bg-[length:40px_69px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 border-b border-white/10 pb-12">
          <div className="flex justify-center mb-6">
            <Hexagon className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            Press & Transmissions
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium tracking-wide">
            Official communications, comeback teasers, and agency updates from ZEFETO MUSIC.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
      {news.map((article, idx) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          onClick={() => setSelectedArticle(article)}
          className="group cursor-pointer bg-black p-8 border border-white/10 hover:border-white transition-all duration-300 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              {article.category}
            </span>
            <div className="text-slate-500 text-xs font-mono">
              {new Date(article.date).toLocaleDateString()}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider group-hover:text-slate-300 transition-colors">
            {article.title}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 flex-grow font-medium">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-white text-[10px] font-bold uppercase tracking-widest mt-auto border border-white/20 w-fit px-4 py-2 group-hover:bg-white group-hover:text-black transition-colors">
            Decrypt File <ArrowRight className="w-3 h-3" />
          </div>
        </motion.article>
      ))}
        </div>

        {/* Article Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-black border border-white/20 w-full max-w-3xl overflow-hidden shadow-2xl z-10 max-h-[85vh] flex flex-col"
              >
                <div className="sticky top-0 bg-black/90 backdrop-blur-md p-8 border-b border-white/10 flex items-start justify-between z-20">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Hexagon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                        {selectedArticle.category}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight leading-tight">
                      {selectedArticle.title}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 bg-white/10 hover:bg-white text-white hover:text-black transition-colors shrink-0 ml-6"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-8 md:p-12 overflow-y-auto">
                  <div className="text-slate-500 text-xs font-mono mb-10 pb-6 border-b border-white/10">
                    TRANSMISSION DATE: {new Date(selectedArticle.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  
                  <div className="prose prose-invert prose-slate max-w-none">
                    <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                      {selectedArticle.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
