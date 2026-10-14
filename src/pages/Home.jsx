import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Hexagon, Disc3, Users, Mic2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { artistsData } from '../data/artistsData';
import { releasesData } from '../data/releasesData';

export default function Home() {
  const [artists, setArtists] = useState(artistsData);
  const [releases, setReleases] = useState(releasesData);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data: aData } = await supabase.from('artists').select('*');
        if (aData && aData.length > 0) {
          setArtists(aData.map(a => ({
            ...a,
            avatar: a.avatar_url || a.avatar || 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400',
            zepetoId: a.zepeto_id || a.zepetoId || '@zefeto_artist'
          })));
        }

        const { data: rData } = await supabase.from('releases').select('*');
        if (rData && rData.length > 0) {
          setReleases(rData.map(r => ({
            ...r,
            cover: r.cover_url || r.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400&h=400'
          })));
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchHomeData();
  }, []);

  const featuredArtists = artists.slice(0, 3);
  const latestReleases = releases.slice(0, 3);

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-hex-pattern bg-[length:60px_103px]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-16 items-center w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 border border-white/20 bg-black/50 backdrop-blur-md">
              <Hexagon className="w-4 h-4 text-white" />
              <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">Next-Gen Virtual Agency</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white uppercase">
              Virtual Artistry <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600">
                Next-Gen Reality
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              ZEFETO MUSIC bridges the gap between the metaverse and global pop culture, debuting iconic virtual personas on the world stage.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link to="/artists" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-3 border border-white">
                Explore Roster
                <Users className="w-4 h-4" />
              </Link>
              <Link to="/discography" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors border border-white/30 flex items-center justify-center gap-3">
                Latest Audio
                <Disc3 className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual Showcase */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:h-[600px] flex justify-center items-center hidden md:flex"
          >
            <div className="relative w-full max-w-md aspect-[3/4] overflow-hidden clip-hexagon-h border-[1px] border-white/20 p-1 bg-white/10 backdrop-blur-md">
              <div className="w-full h-full clip-hexagon-h overflow-hidden relative">
                <img 
                  src={featuredArtists[0]?.avatar || "https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80"} 
                  alt="Featured Artist" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80";
                  }}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-10 left-0 right-0 text-center flex flex-col items-center">
                  <Hexagon className="w-6 h-6 text-white mb-2 opacity-50" />
                  <span className="text-white/60 text-xs font-bold tracking-[0.2em] uppercase mb-1">{featuredArtists[0]?.zepetoId}</span>
                  <h3 className="text-3xl font-bold text-white uppercase tracking-wider">{featuredArtists[0]?.name}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
            {[
              { label: 'Active Artists', value: artists.length.toString(), icon: Users },
              { label: 'Global Releases', value: releases.length.toString(), icon: Disc3 },
              { label: 'Platform', value: 'Zepeto', icon: Mic2 },
              { label: 'Streams', value: '2.4M+', icon: Hexagon }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center px-4"
              >
                <div className="text-4xl font-bold text-white mb-2 font-mono tracking-tight">{stat.value}</div>
                <div className="text-slate-500 text-xs font-bold tracking-[0.2em] uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-32 bg-black relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-hex-pattern bg-[length:40px_69px] opacity-20 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-16 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-4">Talent Roster</h2>
              <p className="text-slate-400 font-medium">The virtual icons shaping the future of music.</p>
            </div>
            <Link to="/artists" className="hidden sm:flex items-center gap-2 text-white hover:text-slate-400 transition-colors font-bold uppercase tracking-widest text-xs">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredArtists.map((artist, idx) => (
              <motion.div 
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group relative bg-black border border-white/10 hover:border-white/40 transition-all duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden relative p-4">
                  <div className="w-full h-full clip-hexagon overflow-hidden bg-slate-900">
                    <img 
                      src={artist.avatar} 
                      alt={artist.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80&w=400&h=400';
                      }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    />
                  </div>
                </div>
                
                <div className="p-8 pt-0 text-center">
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
                    {artist.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white uppercase tracking-wider mb-2">{artist.name}</h3>
                  
                  <Link to={`/artists/${artist.id}`} className="inline-flex items-center gap-2 mt-6 text-xs font-bold uppercase tracking-widest text-white border-b border-white/30 pb-1 hover:border-white transition-colors">
                    View Profile <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
