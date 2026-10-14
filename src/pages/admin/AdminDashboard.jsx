import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Disc3, FileText, Mail, 
  LogOut, Plus, Edit2, Trash2, Hexagon, CheckCircle2,
  AlertCircle, ChevronDown, ChevronRight, UserPlus, Eye
} from 'lucide-react';

import { supabase } from '../../utils/supabaseClient';
import { artistsData as defaultArtists } from '../../data/artistsData';
import { releasesData as defaultReleases } from '../../data/releasesData';
import { companyData } from '../../data/companyData';

// Admin CRUD Modals
import ArtistModal from '../../components/admin/ArtistModal';
import MemberModal from '../../components/admin/MemberModal';
import ReleaseModal from '../../components/admin/ReleaseModal';
import NewsModal from '../../components/admin/NewsModal';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import InquiryModal from '../../components/admin/InquiryModal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [artists, setArtists] = useState([]);
  const [members, setMembers] = useState([]);
  const [releases, setReleases] = useState([]);
  const [news, setNews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [expandedArtistId, setExpandedArtistId] = useState(null);

  // Modals state
  const [artistModal, setArtistModal] = useState({ isOpen: false, data: null });
  const [memberModal, setMemberModal] = useState({ isOpen: false, data: null });
  const [releaseModal, setReleaseModal] = useState({ isOpen: false, data: null });
  const [newsModal, setNewsModal] = useState({ isOpen: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: '', item: null, title: '' });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Artists with Members
      const { data: aData, error: aErr } = await supabase
        .from('artists')
        .select('*, members(*)')
        .order('created_at', { ascending: false });

      if (!aErr && aData) {
        setArtists(aData);
        // Flatten all members
        const allMems = aData.flatMap(a => (a.members || []).map(m => ({ ...m, artist_name: a.name })));
        setMembers(allMems);
      } else {
        setArtists(defaultArtists);
      }

      // 2. Fetch Releases with connected artists
      const { data: rData, error: rErr } = await supabase
        .from('releases')
        .select('*, release_artists(artist_id, artists(*))')
        .order('created_at', { ascending: false });

      if (!rErr && rData) {
        setReleases(rData.map(r => {
          const joinedArtists = r.release_artists?.map(ra => ra.artists).filter(Boolean) || [];
          const collaborativeArtists = (r.links?.artists && Array.isArray(r.links.artists) && r.links.artists.length > 0)
            ? r.links.artists
            : (joinedArtists.length > 0 ? joinedArtists : [{ name: 'ZEFETO' }]);

          return {
            ...r,
            artists: collaborativeArtists,
            tracklist: r.links?.tracklist || r.tracklist || []
          };
        }));
      } else {
        setReleases(defaultReleases);
      }

      // 3. Fetch News
      const { data: nData, error: nErr } = await supabase
        .from('news')
        .select('*')
        .order('published_date', { ascending: false });

      if (!nErr && nData) {
        setNews(nData);
      } else {
        setNews(companyData.news);
      }

      // 4. Fetch Inquiries
      const { data: inqData, error: inqErr } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inqErr && inqData) {
        setInquiries(inqData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Error fetching live data from Supabase', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('zft_admin_auth');
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // ==========================================
  // ARTIST CRUD HANDLERS
  // ==========================================
  const handleSaveArtist = async (payload, isEditing) => {
    if (isEditing) {
      const { error } = await supabase
        .from('artists')
        .update({
          name: payload.name,
          type: payload.type,
          category: payload.category,
          avatar_url: payload.avatar_url,
          banner_url: payload.banner_url,
          debut_date: payload.debut_date,
          zepeto_id: payload.zepeto_id,
          bio: payload.bio,
          socials: payload.socials,
          updated_at: new Date().toISOString()
        })
        .eq('id', payload.id);

      if (error) throw error;
      showToast(`Artist "${payload.name}" updated successfully.`);
    } else {
      const { error } = await supabase
        .from('artists')
        .insert([payload]);

      if (error) throw error;
      showToast(`Artist "${payload.name}" added to roster.`);
    }
    await fetchAllData();
  };

  // ==========================================
  // MEMBER CRUD HANDLERS
  // ==========================================
  const handleSaveMember = async (payload, isEditing) => {
    if (isEditing) {
      const { error } = await supabase
        .from('members')
        .update({
          artist_id: payload.artist_id,
          name: payload.name,
          role: payload.role,
          avatar_url: payload.avatar_url,
          zepeto_id: payload.zepeto_id,
          bio: payload.bio
        })
        .eq('id', payload.id);

      if (error) throw error;
      showToast(`Member "${payload.name}" updated successfully.`);
    } else {
      const { error } = await supabase
        .from('members')
        .insert([payload]);

      if (error) throw error;
      showToast(`Member "${payload.name}" registered to unit.`);
    }
    await fetchAllData();
  };

  // ==========================================
  // RELEASE CRUD HANDLERS
  // ==========================================
  const handleSaveRelease = async (payload, isEditing) => {
    const { artist_id, parent_artist_ids, ...releaseData } = payload;
    const targetArtistIds = (parent_artist_ids && parent_artist_ids.length > 0)
      ? parent_artist_ids
      : (artist_id ? [artist_id] : []);

    if (isEditing) {
      const { error: rErr } = await supabase
        .from('releases')
        .update({
          title: releaseData.title,
          type: releaseData.type,
          release_date: releaseData.release_date,
          cover_url: releaseData.cover_url,
          description: releaseData.description,
          links: releaseData.links,
          updated_at: new Date().toISOString()
        })
        .eq('id', releaseData.id);

      if (rErr) throw rErr;

      // Update release_artists junction for all involved artists
      await supabase.from('release_artists').delete().eq('release_id', releaseData.id);
      if (targetArtistIds.length > 0) {
        const rows = targetArtistIds.map(aId => ({
          release_id: releaseData.id,
          artist_id: aId
        }));
        await supabase.from('release_artists').insert(rows);
      }

      showToast(`Release "${releaseData.title}" updated.`);
    } else {
      const { error: rErr } = await supabase
        .from('releases')
        .insert([releaseData]);

      if (rErr) throw rErr;

      // Insert junction entries for all involved artists
      if (targetArtistIds.length > 0) {
        const rows = targetArtistIds.map(aId => ({
          release_id: releaseData.id,
          artist_id: aId
        }));
        await supabase.from('release_artists').insert(rows);
      }

      showToast(`Release "${releaseData.title}" published to catalog.`);
    }
    await fetchAllData();
  };

  // ==========================================
  // NEWS CRUD HANDLERS
  // ==========================================
  const handleSaveNews = async (payload, isEditing) => {
    if (isEditing) {
      const { error } = await supabase
        .from('news')
        .update({
          title: payload.title,
          slug: payload.slug,
          category: payload.category,
          published_date: payload.published_date,
          cover_url: payload.cover_url,
          excerpt: payload.excerpt,
          content: payload.content
        })
        .eq('id', payload.id);

      if (error) throw error;
      showToast(`Article "${payload.title}" updated.`);
    } else {
      const { error } = await supabase
        .from('news')
        .insert([payload]);

      if (error) throw error;
      showToast(`Transmission "${payload.title}" published.`);
    }
    await fetchAllData();
  };

  // ==========================================
  // CONFIRM DELETE DISPATCHER
  // ==========================================
  const handleConfirmDelete = async () => {
    const { type, item } = deleteModal;
    if (!item) return;

    setIsDeleting(true);
    try {
      if (type === 'artist') {
        // Clean up join tables & members first
        await supabase.from('release_artists').delete().eq('artist_id', item.id);
        await supabase.from('members').delete().eq('artist_id', item.id);
        const { error } = await supabase.from('artists').delete().eq('id', item.id);
        if (error) throw error;
        showToast(`Artist "${item.name}" deleted from database.`);
      } else if (type === 'member') {
        const { error } = await supabase.from('members').delete().eq('id', item.id);
        if (error) throw error;
        showToast(`Member "${item.name}" removed.`);
      } else if (type === 'release') {
        await supabase.from('release_artists').delete().eq('release_id', item.id);
        const { error } = await supabase.from('releases').delete().eq('id', item.id);
        if (error) throw error;
        showToast(`Release "${item.title}" removed.`);
      } else if (type === 'news') {
        const { error } = await supabase.from('news').delete().eq('id', item.id);
        if (error) throw error;
        showToast(`Article "${item.title}" deleted.`);
      } else if (type === 'inquiry') {
        const { error } = await supabase.from('contact_inquiries').delete().eq('id', item.id);
        if (error) throw error;
        showToast(`Inquiry #${item.id} deleted.`);
      }

      setDeleteModal({ isOpen: false, type: '', item: null, title: '' });
      await fetchAllData();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalMembers = artists.reduce((acc, artist) => {
    return acc + (artist.members ? artist.members.length : 1);
  }, 0);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'artists', label: `Artists (${artists.length})`, icon: Users },
    { id: 'discography', label: `Discography (${releases.length})`, icon: Disc3 },
    { id: 'news', label: `Press & News (${news.length})`, icon: FileText },
    { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Mail },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'artists':
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Artist & Unit Roster</h2>
                <p className="text-slate-400 text-xs">Manage primary virtual personas, soloist profiles, and group members.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMemberModal({ isOpen: true, data: null })}
                  className="flex items-center gap-2 px-4 py-2.5 border border-white/30 text-white hover:border-white text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Add Member
                </button>
                <button 
                  onClick={() => setArtistModal({ isOpen: true, data: null })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Artist
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {artists.map(artist => {
                const isExpanded = expandedArtistId === artist.id;
                const artistMembers = artist.members || [];

                return (
                  <div key={artist.id} className="bg-black border border-white/10 hover:border-white/30 transition-all overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 clip-hexagon bg-slate-900 shrink-0 border border-white/10">
                          <img 
                            src={artist.avatar_url || artist.avatar} 
                            alt={artist.name} 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1616091216791-a5360b5ce757?auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover grayscale" 
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-white font-bold uppercase tracking-wider text-lg">{artist.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-slate-300 uppercase">
                              ID: {artist.id}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs">
                            {artist.category} • <strong className="text-white uppercase">{artist.type}</strong> ({artist.type === 'solo' ? 'Solo' : `${artistMembers.length} Members`})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {artist.type !== 'solo' && (
                          <button
                            onClick={() => setExpandedArtistId(isExpanded ? null : artist.id)}
                            className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 flex items-center gap-1.5 transition-colors"
                          >
                            Members ({artistMembers.length})
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button 
                          onClick={() => setArtistModal({ isOpen: true, data: artist })}
                          title="Edit Artist"
                          className="p-2 border border-white/10 text-slate-400 hover:text-white hover:border-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteModal({
                            isOpen: true,
                            type: 'artist',
                            item: artist,
                            title: `Artist: ${artist.name} (${artist.id})`
                          })}
                          title="Delete Artist"
                          className="p-2 border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Nested Members List for Groups */}
                    {artist.type !== 'solo' && isExpanded && (
                      <div className="border-t border-white/10 bg-white/[0.02] p-5 space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Sub-unit Members in {artist.name}
                          </span>
                          <button
                            onClick={() => setMemberModal({ isOpen: true, data: { artist_id: artist.id } })}
                            className="text-[10px] font-bold uppercase tracking-widest text-white hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Member to {artist.name}
                          </button>
                        </div>

                        {artistMembers.length === 0 ? (
                          <p className="text-slate-500 text-xs italic py-2">No members registered yet under this unit.</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {artistMembers.map(mem => (
                              <div key={mem.id} className="p-3 bg-black border border-white/10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-10 h-10 clip-hexagon bg-slate-900 shrink-0">
                                    <img 
                                      src={mem.avatar_url || mem.avatar} 
                                      alt={mem.name} 
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80';
                                      }}
                                      className="w-full h-full object-cover grayscale" 
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h5 className="text-white font-bold text-xs uppercase truncate">{mem.name}</h5>
                                    <p className="text-slate-500 text-[10px] truncate">{mem.role}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => setMemberModal({ isOpen: true, data: mem })}
                                    className="p-1.5 text-slate-400 hover:text-white"
                                    title="Edit Member"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteModal({
                                      isOpen: true,
                                      type: 'member',
                                      item: mem,
                                      title: `Member: ${mem.name} (${mem.id})`
                                    })}
                                    className="p-1.5 text-red-400 hover:text-red-300"
                                    title="Delete Member"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'discography':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Audio Releases Catalog</h2>
                <p className="text-slate-400 text-xs">Manage discography releases, cover art, track credits, and external streaming links.</p>
              </div>
              <button 
                onClick={() => setReleaseModal({ isOpen: true, data: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" /> New Release
              </button>
            </div>

            <div className="grid gap-4">
              {releases.map(release => (
                <div key={release.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black border border-white/10 hover:border-white/30 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 border border-white/10 shrink-0 overflow-hidden">
                      <img 
                        src={release.cover_url || release.cover} 
                        alt={release.title} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover grayscale" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-white font-bold uppercase tracking-wider text-base">{release.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-slate-300 uppercase">
                          {release.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-medium">
                        Artist: <strong className="text-white">{(release.artists || []).map(a => a.name).join(' X ') || 'ZEFETO'}</strong> • {new Date(release.release_date || release.releaseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button 
                      onClick={() => setReleaseModal({ isOpen: true, data: release })}
                      title="Edit Release"
                      className="p-2 border border-white/10 text-slate-400 hover:text-white hover:border-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteModal({
                        isOpen: true,
                        type: 'release',
                        item: release,
                        title: `Release: ${release.title} (${release.id})`
                      })}
                      title="Delete Release"
                      className="p-2 border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'news':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Press Publications & News</h2>
                <p className="text-slate-400 text-xs">Publish comeback teasers, agency press releases, and global tour announcements.</p>
              </div>
              <button 
                onClick={() => setNewsModal({ isOpen: true, data: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" /> Publish Article
              </button>
            </div>

            <div className="grid gap-4">
              {news.map(article => (
                <div key={article.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black border border-white/10 hover:border-white/30 transition-colors gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {article.category} • {new Date(article.published_date || article.date).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        /{article.slug}
                      </span>
                    </div>
                    <h4 className="text-white font-bold uppercase tracking-wider text-base">{article.title}</h4>
                    <p className="text-slate-400 text-xs line-clamp-1">{article.excerpt || article.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button 
                      onClick={() => setNewsModal({ isOpen: true, data: article })}
                      title="Edit Article"
                      className="p-2 border border-white/10 text-slate-400 hover:text-white hover:border-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteModal({
                        isOpen: true,
                        type: 'news',
                        item: article,
                        title: `Article: ${article.title}`
                      })}
                      title="Delete Article"
                      className="p-2 border border-red-900/50 text-red-500 hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'inquiries':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Communications Inbox</h2>
                <p className="text-slate-400 text-xs">Direct transmissions submitted by visitors, partners, and media through the Contact hub.</p>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="p-16 text-center border border-white/10 bg-black">
                <Mail className="w-10 h-10 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No transmissions recorded.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="p-5 bg-black border border-white/10 hover:border-white/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10">
                      <div>
                        <span className="text-white font-bold uppercase tracking-wider text-sm">{inq.name}</span>
                        <span className="text-slate-500 text-xs font-mono ml-3">&lt;{inq.email}&gt;</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-white/20 text-slate-300">
                          {inq.category}
                        </span>
                        <span className="text-slate-500 text-xs font-mono">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <h5 className="text-white font-bold uppercase tracking-wide text-xs mb-2">Subject: {inq.subject}</h5>
                    <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{inq.message}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setSelectedInquiry(inq)}
                        className="px-3 py-1.5 border border-white/20 hover:border-white text-white text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Read Payload
                      </button>
                      <button
                        onClick={() => setDeleteModal({
                          isOpen: true,
                          type: 'inquiry',
                          item: inq,
                          title: `Inquiry from ${inq.name} (${inq.subject})`
                        })}
                        className="p-1.5 border border-red-900/50 text-red-500 hover:bg-red-950/30 transition-colors"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        // Overview Tab
        return (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Active Roster', value: artists.length, tab: 'artists' },
                { label: 'Total Unit Members', value: totalMembers, tab: 'artists' },
                { label: 'Audio Releases', value: releases.length, tab: 'discography' },
                { label: 'Total Transmissions', value: inquiries.length, tab: 'inquiries' }
              ].map((stat, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveTab(stat.tab)}
                  className="p-6 bg-black border border-white/10 hover:border-white/40 cursor-pointer transition-all"
                >
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4">{stat.label}</div>
                  <div className="text-4xl font-mono text-white mb-2">{stat.value}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white">Manage &rarr;</span>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 bg-black border border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Realtime Connectivity</h3>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">Supabase DB Client</span>
                    <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Active & Connected</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">Artists Roster</span>
                    <span className="text-white text-xs font-mono">{artists.length} Live Records</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">Discography Catalog</span>
                    <span className="text-white text-xs font-mono">{releases.length} Live Records</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-mono">Publications Table</span>
                    <span className="text-white text-xs font-mono">{news.length} Live Records</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-black border border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Quick Shortcuts</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setArtistModal({ isOpen: true, data: null })}
                    className="p-3 border border-white/10 hover:border-white text-left transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">+ Artist</span>
                    <strong className="text-white text-xs uppercase">New Roster</strong>
                  </button>
                  <button 
                    onClick={() => setReleaseModal({ isOpen: true, data: null })}
                    className="p-3 border border-white/10 hover:border-white text-left transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">+ Discography</span>
                    <strong className="text-white text-xs uppercase">New Music</strong>
                  </button>
                  <button 
                    onClick={() => setNewsModal({ isOpen: true, data: null })}
                    className="p-3 border border-white/10 hover:border-white text-left transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">+ Publication</span>
                    <strong className="text-white text-xs uppercase">New Press</strong>
                  </button>
                  <button 
                    onClick={() => setMemberModal({ isOpen: true, data: null })}
                    className="p-3 border border-white/10 hover:border-white text-left transition-colors"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">+ Member</span>
                    <strong className="text-white text-xs uppercase">Add to Unit</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col md:flex-row text-white font-sans">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 border flex items-center gap-3 shadow-2xl backdrop-blur-md text-xs font-bold uppercase tracking-widest ${
              toast.type === 'error' 
                ? 'bg-red-950/80 border-red-500 text-red-200' 
                : 'bg-black/90 border-white text-white'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black border-r border-white/10 flex flex-col shrink-0">
        <div className="h-20 border-b border-white/10 flex items-center px-6">
          <Link to="/" className="flex items-center gap-3">
            <Hexagon className="w-6 h-6 text-white" />
            <span className="text-sm font-bold tracking-[0.2em] text-white uppercase">ZEFETO SYS</span>
          </Link>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-black' 
                    : 'text-slate-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            &larr; View Public Site
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-red-950/30 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Terminate
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-h-screen overflow-hidden">
        <header className="h-20 bg-black border-b border-white/10 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-white uppercase tracking-[0.2em]">Management Console</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 px-3 py-1.5 border border-white/10">
              Session: SUPER_ADMIN
            </span>
          </div>
        </header>
        
        <div className="flex-grow p-8 overflow-y-auto relative">
          <div className="absolute inset-0 bg-hex-pattern bg-[length:40px_69px] opacity-10 pointer-events-none" />
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl relative z-10"
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <ArtistModal
        isOpen={artistModal.isOpen}
        initialData={artistModal.data}
        onClose={() => setArtistModal({ isOpen: false, data: null })}
        onSave={handleSaveArtist}
      />

      <MemberModal
        isOpen={memberModal.isOpen}
        initialData={memberModal.data}
        artists={artists}
        onClose={() => setMemberModal({ isOpen: false, data: null })}
        onSave={handleSaveMember}
      />

      <ReleaseModal
        isOpen={releaseModal.isOpen}
        initialData={releaseModal.data}
        artists={artists}
        members={members}
        onClose={() => setReleaseModal({ isOpen: false, data: null })}
        onSave={handleSaveRelease}
      />

      <NewsModal
        isOpen={newsModal.isOpen}
        initialData={newsModal.data}
        onClose={() => setNewsModal({ isOpen: false, data: null })}
        onSave={handleSaveNews}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        itemType={deleteModal.type}
        isDeleting={isDeleting}
        onClose={() => setDeleteModal({ isOpen: false, type: '', item: null, title: '' })}
        onConfirm={handleConfirmDelete}
      />

      <InquiryModal
        isOpen={Boolean(selectedInquiry)}
        inquiry={selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        onDelete={(inq) => setDeleteModal({
          isOpen: true,
          type: 'inquiry',
          item: inq,
          title: `Inquiry from ${inq.name} (${inq.subject})`
        })}
      />
      
    </div>
  );
}
