import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Hexagon } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function Artists() {
  const [filter, setFilter] = useState('All Artists');
  const filters = ['All Artists', 'Soloists', 'Groups/Units'];
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase.from('artists').select('*');
        if (error) throw error;
        
        const normalized = (data || []).map(a => ({
          ...a,
          avatar: a.avatar_url || a.avatar || 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400',
          zepetoId: a.zepeto_id || a.zepetoId || '@zefeto_artist'
        }));
        setArtists(normalized);
      } catch (err) {
        console.error('Error fetching artists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(artist => {
    if (filter === 'Soloists') return artist.type === 'solo' || artist.category?.toLowerCase().includes('solo');
    if (filter === 'Groups/Units') return artist.type !== 'solo' || artist.category?.toLowerCase().includes('group') || artist.category?.toLowerCase().includes('trio');
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading roster...
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
      <div className="absolute top-0 right-0 w-full h-96 bg-hex-pattern bg-[length:40px_69px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 border-b border-white/10 pb-12">
          <div className="flex justify-center mb-6">
            <Hexagon className="w-8 h-8 text-slate-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight mb-4">
            ZEFETO Roster
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium tracking-wide">
            The digital pioneers leading the next generation of virtual music.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 border ${
                filter === f
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-slate-500 border-white/20 hover:text-white hover:border-white/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Artists Grid */}
        <motion.div 
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {filteredArtists.map((artist, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              key={artist.id}
            >
              <Link 
                to={`/artists/${artist.id}`}
                className="group block relative bg-black border border-white/10 hover:border-white/40 transition-all duration-500"
              >
                <div className="p-4">
                  <div className="aspect-[4/5] overflow-hidden relative clip-hexagon bg-slate-900">
                    <img 
                      src={artist.avatar} 
                      alt={artist.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400';
                      }}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                  </div>
                </div>
                
                <div className="p-8 pt-2 text-center relative">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                    {artist.category}
                  </span>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-wider mb-2">{artist.name}</h3>
                  <div className="text-slate-400 font-mono text-xs tracking-widest mb-6">
                    {artist.zepetoId}
                  </div>
                  
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white border-b border-white/30 pb-1 group-hover:border-white transition-colors">
                    View Profile <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
