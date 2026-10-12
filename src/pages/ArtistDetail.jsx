import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Copy, Check, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { artistsData } from '../data/artistsData';

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [artist, setArtist] = useState(null);
  const [artistReleases, setArtistReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        let normalizedArtist = null;

        // 1. Fetch artist with related members from Supabase (case-insensitive)
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*, members(*)')
          .ilike('id', id)
          .maybeSingle();

        if (artistError) {
          console.warn('Supabase artist query issue:', artistError);
        }

        if (artistData) {
          normalizedArtist = {
            ...artistData,
            avatar: artistData.avatar_url || artistData.avatar || 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400',
            banner: artistData.banner_url || artistData.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
            debutDate: artistData.debut_date || artistData.debutDate || '2025-05-15',
            zepetoId: artistData.zepeto_id || artistData.zepetoId || '@zefeto_artist',
            gallery: artistData.gallery || [
              'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400',
              'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92a?auto=format&fit=crop&q=80&w=400&h=400',
              'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400&h=400'
            ],
            members: (artistData.members || []).map(m => ({
              ...m,
              avatar: m.avatar_url || m.avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
              zepetoId: m.zepeto_id || m.zepetoId || '@member'
            }))
          };
        } else {
          // 2. Check static mock data fallback
          const staticArtist = artistsData.find(a => a.id.toLowerCase() === (id || '').toLowerCase());
          if (staticArtist) {
            normalizedArtist = {
              ...staticArtist,
              avatar: staticArtist.avatar || 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400',
              banner: staticArtist.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400',
              debutDate: staticArtist.debutDate || '2025-05-15',
              zepetoId: staticArtist.zepetoId || '@zefeto_artist',
              gallery: staticArtist.gallery || [
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=400',
                'https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92a?auto=format&fit=crop&q=80&w=400&h=400',
                'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=400&h=400'
              ],
              members: (staticArtist.members || []).map(m => ({
                ...m,
                avatar: m.avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
                zepetoId: m.zepetoId || '@member'
              }))
            };
          }
        }

        setArtist(normalizedArtist);

        // 3. Fetch releases for this artist safely via release_artists
        if (normalizedArtist) {
          try {
            const { data: relArtists } = await supabase
              .from('release_artists')
              .select('release_id, releases(*)')
              .ilike('artist_id', normalizedArtist.id);
            
            const releasesList = (relArtists || [])
              .map(ra => ra.releases)
              .filter(Boolean)
              .map(r => ({
                ...r,
                cover: r.cover_url || r.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400',
                releaseDate: r.release_date || r.releaseDate || '2026-01-01'
              }));

            setArtistReleases(releasesList);
          } catch (relErr) {
            console.warn('Non-fatal: could not load releases for artist:', relErr);
          }
        }
      } catch (e) {
        console.error('Error loading artist details:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading artist details...
      </div>
    );
  }

  if (error && !artist) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center bg-black px-4">
        <Hexagon className="w-12 h-12 text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-widest">Unable to Load Artist</h2>
        <p className="text-slate-400 text-sm mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate('/artists')} className="px-6 py-3 bg-white text-black uppercase tracking-widest text-xs font-bold hover:bg-slate-200 transition-colors">
          Return to Roster
        </button>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center bg-black px-4">
        <Hexagon className="w-12 h-12 text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-widest">Artist Not Found</h2>
        <p className="text-slate-400 text-sm mb-8">The requested artist profile does not exist or has been removed.</p>
        <button onClick={() => navigate('/artists')} className="px-6 py-3 bg-white text-black uppercase tracking-widest text-xs font-bold hover:bg-slate-200 transition-colors">
          Return to Roster
        </button>
      </div>
    );
  }




  const copyToClipboard = () => {
    navigator.clipboard.writeText(artist.zepetoId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 bg-black">
      {/* Banner Section */}
      <div className="relative h-[40vh] md:h-[60vh] w-full border-b border-white/10">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="absolute inset-0 bg-hex-pattern bg-[length:40px_69px] opacity-20 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img 
          src={artist.banner} 
          alt={`${artist.name} banner`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200&h=400';
          }}
          className="w-full h-full object-cover grayscale"
        />
        <button 
          onClick={() => navigate('/artists')}
          className="absolute top-28 left-4 md:left-12 z-20 flex items-center gap-2 px-4 py-2 border border-white/20 bg-black/50 hover:bg-white hover:text-black backdrop-blur-md text-white transition-all text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roster
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24 md:-mt-40">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Avatar & Quick Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-48 h-48 md:w-80 md:h-80 shrink-0 relative"
          >
            <div className="w-full h-full clip-hexagon bg-slate-900 border-[1px] border-white/20 p-2">
              <div className="w-full h-full clip-hexagon overflow-hidden">
                <img 
                  src={artist.avatar} 
                  alt={artist.name} 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400';
                  }}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                />
              </div>
            </div>
          </motion.div>

          {/* Bio Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-grow pt-4 md:pt-40"
          >
            <div className="flex items-center gap-3 mb-4">
              <Hexagon className="w-5 h-5 text-slate-400" />
              <span className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
                {artist.category}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tight">{artist.name}</h1>
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white hover:text-black border border-white/20 transition-colors text-white text-xs font-bold uppercase tracking-widest"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : artist.zepetoId}
              </button>
              <div className="h-4 w-px bg-white/20 hidden md:block"></div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Debut / <strong className="text-white ml-2">{new Date(artist.debutDate).toLocaleDateString()}</strong>
              </span>
            </div>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-3xl mb-8 font-medium">
              {artist.bio}
            </p>
          </motion.div>
        </div>

        {/* Condition B: Groups / Trio Members */}
        {artist.members && artist.members.length > 0 && (
          <div className="mt-32 pt-16 border-t border-white/10">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 text-white uppercase tracking-widest">
              <Hexagon className="w-6 h-6 text-slate-500" /> Members
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {artist.members.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    to={`/artists/${artist.id}/member/${member.id}`}
                    className="group block p-6 bg-black border border-white/10 hover:border-white/50 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-32 h-32 mb-6 relative">
                        <div className="w-full h-full clip-hexagon bg-slate-900 overflow-hidden">
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400';
                            }}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-500 group-hover:scale-110" 
                          />
                        </div>
                      </div>
                      <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{member.role}</span>
                      <h4 className="text-2xl font-bold text-white mb-2 uppercase tracking-wider">{member.name}</h4>
                      <div className="text-slate-600 text-xs font-mono">{member.zepetoId}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Condition A: Soloist Gallery */}
        {artist.type === 'solo' && artist.gallery && artist.gallery.length > 0 && (
          <div className="mt-32 pt-16 border-t border-white/10">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 text-white uppercase tracking-widest">
              <Hexagon className="w-6 h-6 text-slate-500" /> Visual Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {artist.gallery.map((img, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="aspect-[3/4] overflow-hidden bg-slate-900 border border-white/10 relative group"
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 border-[1px] border-white/0 group-hover:border-white/20 transition-all duration-500 m-4 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Shared: Discography */}
        {artistReleases.length > 0 && (
          <div className="mt-32 pt-16 border-t border-white/10">
            <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 text-white uppercase tracking-widest">
              <Hexagon className="w-6 h-6 text-slate-500" /> Discography
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artistReleases.map((release, idx) => (
                <motion.div 
                  key={release.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex gap-6 p-6 bg-black border border-white/10 hover:border-white/40 transition-all"
                >
                  <div className="w-24 h-24 shrink-0 overflow-hidden bg-slate-900">
                    <img 
                      src={release.cover} 
                      alt={release.title} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400';
                      }}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{release.type}</span>
                    <h4 className="text-lg font-bold text-white mb-1 uppercase tracking-wider">{release.title}</h4>
                    <span className="text-slate-600 text-xs font-mono">{new Date(release.releaseDate).getFullYear()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link to="/discography" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
                View Global Discography <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
