import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, X, ExternalLink, Hexagon, ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function Discography() {
  const [filterType, setFilterType] = useState('All');
  const [filterArtist, setFilterArtist] = useState('All Artists');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [selectedRelease, setSelectedRelease] = useState(null);

  const [releases, setReleases] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: releasesData, error: releasesError } = await supabase
          .from('releases')
          .select('*, release_artists(artist_id, artists(*))');
        if (releasesError) throw releasesError;

        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('*');
        if (artistsError) throw artistsError;

        const normalizedReleases = (releasesData || []).map(r => {
          const joinedArtists = (r.release_artists || [])
            .map(ra => ra.artists)
            .filter(Boolean);
          
          return {
            ...r,
            cover: r.cover_url || r.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400',
            releaseDate: r.release_date || r.releaseDate || '2026-01-01',
            artists: (r.links?.artists && Array.isArray(r.links.artists) && r.links.artists.length > 0)
              ? r.links.artists
              : (joinedArtists.length > 0 ? joinedArtists : (r.artists || [{ name: 'ZEFETO' }])),
            tracklist: (r.links?.tracklist && Array.isArray(r.links.tracklist) && r.links.tracklist.length > 0)
              ? r.links.tracklist
              : (r.tracklist && Array.isArray(r.tracklist) && r.tracklist.length > 0)
                ? r.tracklist
                : [
                    { title: r.title, duration: '3:20' },
                    { title: `${r.title} (Instrumental)`, duration: '3:20' }
                  ],
            links: r.links || { spotify: 'https://spotify.com/', youtube: 'https://youtube.com/' }
          };
        });

        setReleases(normalizedReleases);
        setArtists(artistsData || []);
      } catch (e) {
        console.error('Error loading discography:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const types = useMemo(() => {
    const list = new Set(['All', 'Digital Single', 'Single Album', 'Single', 'Mini Album', 'Full Album']);
    releases.forEach(r => {
      if (r.type) list.add(r.type);
    });
    return Array.from(list);
  }, [releases]);
  const artistNames = useMemo(() => {
    const names = new Set(artists.map(a => a.name));
    releases.forEach(r => {
      r.artists?.forEach(a => { if (a.name) names.add(a.name); });
    });
    return ['All Artists', ...Array.from(names)];
  }, [artists, releases]);

  const filteredReleases = useMemo(() => {
    if (loading) return [];
    const filtered = releases.filter(release => {
      const matchType = filterType === 'All' || release.type === filterType;
      const matchArtist = filterArtist === 'All Artists' || (
        release.artists && release.artists.some(a => a.name?.toLowerCase().includes(filterArtist.toLowerCase()))
      );
      return matchType && matchArtist;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.releaseDate || a.release_date || 0).getTime();
      const dateB = new Date(b.releaseDate || b.release_date || 0).getTime();
      return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  }, [filterType, filterArtist, sortBy, releases, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading discography...
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
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Banner */}
        <div className="relative overflow-hidden border border-white/10 mb-16 flex items-center justify-center min-h-[300px] bg-hex-pattern bg-[length:40px_69px]">
          <div className="absolute inset-0 bg-black/80 z-0" />
          
          <div className="relative z-10 text-center space-y-6 p-8">
            <div className="flex justify-center">
              <Hexagon className="w-8 h-8 text-slate-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight">Global Discography</h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium tracking-wide">
              Explore the entire sonic universe of ZEFETO MUSIC. From hyper-pop anthems to ethereal R&B, discover the sounds of the metaverse.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-16 p-4 sm:p-6 bg-black border border-white/10">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              Filter Catalog
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2 border-l border-white/10">
              {filteredReleases.length} {filteredReleases.length === 1 ? 'Release' : 'Releases'}
            </span>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
            {/* Sort Dropdown */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none bg-black border border-white/20 hover:border-white/50 focus:border-white px-4 py-2.5 pr-9 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer rounded-none focus:outline-none"
              >
                <option value="newest" className="bg-neutral-950 text-white">TERBARU (NEWEST)</option>
                <option value="oldest" className="bg-neutral-950 text-white">TERLAMA (OLDEST)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Type Dropdown */}
            <div className="relative flex-1 sm:w-44">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none bg-black border border-white/20 hover:border-white/50 focus:border-white px-4 py-2.5 pr-9 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer rounded-none focus:outline-none"
              >
                {types.map((type) => (
                  <option key={type} value={type} className="bg-neutral-950 text-white">
                    {type === 'All' ? 'ALL TYPES' : type.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Artist Dropdown */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={filterArtist}
                onChange={(e) => setFilterArtist(e.target.value)}
                className="w-full appearance-none bg-black border border-white/20 hover:border-white/50 focus:border-white px-4 py-2.5 pr-9 text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer rounded-none focus:outline-none"
              >
                {artistNames.map((name) => (
                  <option key={name} value={name} className="bg-neutral-950 text-white">
                    {name === 'All Artists' ? 'ALL ARTISTS' : name.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Button (shown when any filter or sort is active) */}
            {(filterType !== 'All' || filterArtist !== 'All Artists' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setFilterType('All');
                  setFilterArtist('All Artists');
                  setSortBy('newest');
                }}
                className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-black hover:bg-white border border-white/20 hover:border-white transition-all flex items-center gap-1.5 shrink-0"
                title="Reset Filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Releases Grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredReleases.map((release, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={release.id}
                onClick={() => setSelectedRelease(release)}
                className="group cursor-pointer bg-black p-4 border border-white/10 hover:border-white/40 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-900 mb-6">
                  <img 
                    src={release.cover} 
                    alt={release.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center backdrop-blur-sm gap-3">
                    <PlayCircle className="w-12 h-12 text-white" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">View Tracks</span>
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Hexagon className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {release.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider line-clamp-1">{release.title}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest truncate">
                    {(release.artists || []).map(a => a.name).join(' X ') || 'ZEFETO'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredReleases.length === 0 && (
          <div className="text-center py-32 text-slate-500 font-bold uppercase tracking-widest text-sm border border-white/10">
            NO RELEASES FOUND
          </div>
        )}

        {/* Release Modal */}
        <AnimatePresence>
          {selectedRelease && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRelease(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-black border border-white/20 w-full max-w-4xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row"
              >
                <button 
                  onClick={() => setSelectedRelease(null)}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white text-white hover:text-black transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Modal Cover */}
                <div className="md:w-1/2 aspect-square md:aspect-auto border-r border-white/10">
                  <img 
                    src={selectedRelease.cover} 
                    alt={selectedRelease.title} 
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
                    }}
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Modal Content */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-4">
                    <Hexagon className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                      {selectedRelease.type}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">{selectedRelease.title}</h2>
                  <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-8 border-b border-white/10 pb-6">
                    {(selectedRelease.artists || []).map(a => a.name).join(' X ') || 'ZEFETO'} &nbsp;—&nbsp; {new Date(selectedRelease.releaseDate).getFullYear()}
                  </p>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
                    {selectedRelease.description}
                  </p>

                  <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Tracklist</h3>
                  <ul className="space-y-4 mb-10 flex-grow">
                    {(selectedRelease.tracklist || []).map((track, idx) => (
                      <li key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <span className="text-slate-600 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="text-slate-300 group-hover:text-white transition-colors font-bold text-sm uppercase tracking-wider">{track.title}</span>
                        </div>
                        <span className="text-slate-600 text-xs font-mono">{track.duration}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    {Object.entries(selectedRelease.links || {})
                      .filter(([platform, val]) => platform !== 'tracklist' && typeof val === 'string' && val.startsWith('http'))
                      .map(([platform, url]) => (
                      <a 
                        key={platform} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 py-4 bg-white/5 hover:bg-white text-white hover:text-black font-bold text-[10px] uppercase tracking-widest transition-colors border border-white/20 hover:border-white"
                      >
                        {platform} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
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
