import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { artistsData } from '../data/artistsData';

export default function MemberDetail() {
  const { id, memberId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [member, setMember] = useState(null);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        // 1. Look up member in Supabase (case-insensitive)
        const { data: memberData, error: mErr } = await supabase
          .from('members')
          .select('*, artists(*)')
          .ilike('id', memberId)
          .maybeSingle();

        if (memberData) {
          setMember({
            ...memberData,
            avatar: memberData.avatar_url || memberData.avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400',
            zepetoId: memberData.zepeto_id || memberData.zepetoId || '@member'
          });

          const artistObj = Array.isArray(memberData.artists) ? memberData.artists[0] : memberData.artists;
          if (artistObj && artistObj.name) {
            setGroup(artistObj);
          } else {
            const targetArtistId = memberData.artist_id || id;
            const { data: parentArtist } = await supabase
              .from('artists')
              .select('*')
              .ilike('id', targetArtistId)
              .maybeSingle();

            setGroup(parentArtist || { id: targetArtistId, name: targetArtistId.toUpperCase() });
          }
          return;
        }

        // 2. Fallback: Search in static mock data
        const staticGroup = artistsData.find(a => a.id.toLowerCase() === (id || '').toLowerCase());
        const staticMember = staticGroup?.members?.find(m => m.id.toLowerCase() === (memberId || '').toLowerCase());
        if (staticMember) {
          setMember(staticMember);
          setGroup(staticGroup);
          return;
        }

        // 3. Fallback: Search any static group that contains this member
        for (const g of artistsData) {
          const m = g.members?.find(mem => mem.id.toLowerCase() === (memberId || '').toLowerCase());
          if (m) {
            setMember(m);
            setGroup(g);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching member:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, memberId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading member profile...
      </div>
    );
  }

  if (!group || !member) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-center bg-black px-4">
        <Hexagon className="w-12 h-12 text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-white uppercase tracking-widest">Member Not Found</h2>
        <p className="text-slate-400 text-sm mb-8">The requested member profile could not be found.</p>
        <button onClick={() => navigate(id ? `/artists/${id}` : '/artists')} className="px-6 py-3 bg-white text-black uppercase tracking-widest text-xs font-bold hover:bg-slate-200 transition-colors">
          Return to Artist
        </button>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(member.zepetoId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background hex pattern */}
      <div className="absolute inset-0 bg-hex-pattern bg-[length:60px_103px] opacity-10 pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Link 
          to={`/artists/${group.id}`}
          className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white hover:text-black border border-white/20 transition-colors text-white text-xs font-bold uppercase tracking-widest mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {group.name}
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 md:p-16 shadow-2xl flex flex-col md:flex-row gap-12 items-center md:items-start"
        >
          <div className="w-48 h-48 md:w-72 md:h-72 shrink-0 relative">
            <div className="w-full h-full clip-hexagon bg-slate-900 overflow-hidden border-[1px] border-white/20 p-2">
               <div className="w-full h-full clip-hexagon overflow-hidden">
                 <img 
                   src={member.avatar} 
                   alt={member.name} 
                   onError={(e) => {
                     e.currentTarget.onerror = null;
                     e.currentTarget.src = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=400';
                   }}
                   className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                 />
               </div>
            </div>
          </div>

          <div className="text-center md:text-left flex-grow">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Hexagon className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                {member.role}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 uppercase tracking-wider">{member.name}</h1>
            
            <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium max-w-lg mx-auto md:mx-0">
              {member.bio}
            </p>

            <div className="inline-flex items-center p-1 bg-white/5 border border-white/10">
              <div className="px-6 py-3 text-white text-xs font-mono tracking-widest">
                {member.zepetoId}
              </div>
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center px-4 py-3 bg-white hover:bg-slate-200 text-black transition-colors"
                title="Copy Zepeto ID"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
