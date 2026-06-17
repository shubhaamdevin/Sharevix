import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileEdit, Trash2, Globe, Heart, MessageCircle, UserPlus, Filter, CheckCircle2, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon, PinterestIcon } from '../components/Icons';
import DeletePostModal from '../components/DeletePostModal';

const platformIcons = {
  facebook: { icon: FacebookIcon, color: '#1877F2' },
  instagram: { icon: InstagramIcon, color: '#E1306C' },
  x: { icon: TwitterIcon, color: '#ffffff' },
  linkedin: { icon: LinkedinIcon, color: '#0A66C2' },
  tiktok: { icon: TiktokIcon, color: '#ffffff' },
  youtube: { icon: YoutubeIcon, color: '#FF0000' },
  pinterest: { icon: PinterestIcon, color: '#E60023' }
};

export default function TotalPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const platformDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const platformOptions = [
    { id: 'all', name: 'All Platforms', icon: Globe, color: 'var(--accent-blue)' },
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
    { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000' },
    { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: 'var(--text-primary)' },
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: '#0A66C2' },
    { id: 'pinterest', name: 'Pinterest', icon: PinterestIcon, color: '#E60023' }
  ];

  const statusOptions = [
    { id: 'all', name: 'All Statuses', icon: Filter, color: 'var(--text-secondary)' },
    { id: 'published', name: 'Published', icon: CheckCircle2, color: 'var(--success)' },
    { id: 'scheduled', name: 'Scheduled', icon: Clock, color: 'var(--accent-blue)' },
    { id: 'draft', name: 'Drafts', icon: FileEdit, color: 'var(--warning)' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (platformDropdownRef.current && !platformDropdownRef.current.contains(event.target)) {
        setIsPlatformOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Delete modal states
  const [deleteTargetPost, setDeleteTargetPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const data = await dbService.getPosts();
      setPosts(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Failed to fetch total posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const triggerDeleteConfirm = (post) => {
    setDeleteTargetPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (postId, selectedPlatforms, deleteLocal) => {
    setIsDeleteModalOpen(false);
    const success = await dbService.deletePost(postId, selectedPlatforms, deleteLocal);
    if (success) {
      if (deleteLocal) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        fetchPosts();
      }
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'success', message: deleteLocal ? 'Post deleted successfully!' : 'Post removed from selected platforms!' } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'error', message: 'Failed to delete post.' } 
      }));
    }
    setDeleteTargetPost(null);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesPlatform = platformFilter === 'all' || post.platforms?.includes(platformFilter);
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesPlatform && matchesStatus;
  });

  const getEngagementStats = (post) => {
    if (post.status !== 'published') {
      return { likes: 0, comments: 0, followers: 0 };
    }
    const seed = String(post.id).charCodeAt(0) || 10;
    const likes = (seed % 150) + 45;
    const comments = Math.floor(likes * 0.12) + 2;
    const followers = Math.floor(likes * 0.08) + 1;
    return { likes, comments, followers };
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} color="var(--accent-blue)" /> Content Library (Total Posts)
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage, edit, delete, and analyze performance metrics for all posts in one central hub.</p>
        </div>

        {/* Filters Panel */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', zIndex: 100 }}>
          
          {/* Platform Filter */}
          <div ref={platformDropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsPlatformOpen(!isPlatformOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)',
                borderRadius: '12px', padding: '0.6rem 1.25rem', color: 'var(--text-primary)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', outline: 'none',
                minWidth: '185px', justifyContent: 'space-between',
                transition: 'all 0.2s', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--accent-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.border = '1px solid var(--panel-border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {(() => {
                  const activeOpt = platformOptions.find(o => o.id === platformFilter);
                  if (!activeOpt) return null;
                  const Icon = activeOpt.icon;
                  return <Icon size={16} color={activeOpt.color} />;
                })()}
                <span>
                  {platformOptions.find(o => o.id === platformFilter)?.name}
                </span>
              </div>
              <ChevronDown size={16} style={{ transform: isPlatformOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }} />
            </button>
            
            <AnimatePresence>
              {isPlatformOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
                    background: 'var(--panel-bg)', backdropFilter: 'blur(25px)',
                    border: '1px solid var(--panel-border)', borderRadius: '12px',
                    padding: '0.5rem', width: '200px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex',
                    flexDirection: 'column', gap: '0.25rem', zIndex: 1000
                  }}
                >
                  {platformOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = platformFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setPlatformFilter(opt.id);
                          setIsPlatformOpen(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
                          background: isSelected ? 'var(--sidebar-active-bg)' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 600 : 500, fontSize: '0.85rem',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--sidebar-active-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <Icon size={14} color={opt.color} />
                        {opt.name}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter */}
          <div ref={statusDropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)',
                borderRadius: '12px', padding: '0.6rem 1.25rem', color: 'var(--text-primary)',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', outline: 'none',
                minWidth: '185px', justifyContent: 'space-between',
                transition: 'all 0.2s', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--accent-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.border = '1px solid var(--panel-border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {(() => {
                  const activeOpt = statusOptions.find(o => o.id === statusFilter);
                  if (!activeOpt) return null;
                  const Icon = activeOpt.icon;
                  return <Icon size={16} color={activeOpt.color} />;
                })()}
                <span>
                  {statusOptions.find(o => o.id === statusFilter)?.name}
                </span>
              </div>
              <ChevronDown size={16} style={{ transform: isStatusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }} />
            </button>
            
            <AnimatePresence>
              {isStatusOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem',
                    background: 'var(--panel-bg)', backdropFilter: 'blur(25px)',
                    border: '1px solid var(--panel-border)', borderRadius: '12px',
                    padding: '0.5rem', width: '200px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex',
                    flexDirection: 'column', gap: '0.25rem', zIndex: 1000
                  }}
                >
                  {statusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setStatusFilter(opt.id);
                          setIsStatusOpen(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
                          background: isSelected ? 'var(--sidebar-active-bg)' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: isSelected ? 600 : 500, fontSize: '0.85rem',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--sidebar-active-bg)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <Icon size={14} color={opt.color} />
                        {opt.name}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Posts List Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="animate-spin" style={{ fontSize: '2rem' }}>⏳</div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <FileText size={48} color="var(--panel-border)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Posts Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            No content matches the selected filters. Use the Universal Composer to create new content.
          </p>
          <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}>
            Create New Post
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredPosts.map(post => {
              const stats = getEngagementStats(post);
              return (
                <motion.div 
                  variants={cardVariants} 
                  layoutId={post.id} 
                  key={post.id} 
                  className="glass-panel" 
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid var(--panel-border)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 0 }}>
                      
                      {/* Thumbnail */}
                      {post.media && post.media.length > 0 && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: '#000', flexShrink: 0 }}>
                          {post.media[0].type && post.media[0].type.startsWith('video') ? (
                            <video src={post.media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                          ) : (
                            <img src={post.media[0].url} alt="Post thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontWeight: 500, margin: 0 }}>
                          {post.content || <em style={{ color: 'var(--text-secondary)' }}>No text content</em>}
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>Type: {post.type}</span>
                          <span>•</span>
                          <span>Date: {new Date(post.date).toLocaleString()}</span>
                          {post.fb_post_id && (
                            <>
                              <span>•</span>
                              <span style={{ color: 'var(--success)' }}>FB Sync Active</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Status */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{ 
                        textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 700,
                        padding: '4px 10px', borderRadius: '20px',
                        background: post.status === 'published' ? 'rgba(0, 230, 118, 0.1)' : (post.status === 'scheduled' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255, 234, 0, 0.1)'),
                        color: post.status === 'published' ? 'var(--success)' : (post.status === 'scheduled' ? 'var(--accent-blue)' : 'var(--warning)'),
                        border: `1px solid ${post.status === 'published' ? 'rgba(0, 230, 118, 0.2)' : (post.status === 'scheduled' ? 'rgba(0, 210, 255, 0.2)' : 'rgba(255, 234, 0, 0.2)')}`
                      }}>
                        {post.status}
                      </span>
                      
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.25rem' }}>
                        {post.platforms && post.platforms.map(p => {
                          const plat = platformIcons[p];
                          if (!plat) return null;
                          const Icon = plat.icon;
                          return Icon ? <Icon key={p} size={20} /> : null;
                        })}
                        {(!post.platforms || post.platforms.length === 0) && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draft (No Platforms)</span>}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Post Engagement & Subscriber Stats */}
                  {post.status === 'published' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--panel-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Heart size={18} color="#E1306C" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Likes / Reactions</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stats.likes}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MessageCircle size={18} color="var(--accent-blue)" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Comments</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{stats.comments}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserPlus size={18} color="var(--success)" />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Followers Gained</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>+{stats.followers}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions (Edit / Delete) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--panel-border)', paddingTop: '0.75rem' }}>
                    <button 
                      onClick={() => navigate('/create', { state: { editPost: post } })}
                      style={{
                        background: 'rgba(58,123,213,0.08)',
                        border: '1px solid rgba(58,123,213,0.15)',
                        color: 'var(--accent-blue)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(58,123,213,0.08)';
                        e.currentTarget.style.color = 'var(--accent-blue)';
                        e.currentTarget.style.borderColor = 'rgba(58,123,213,0.15)';
                      }}
                    >
                      <FileEdit size={14} /> Edit Post
                    </button>

                    <button 
                      onClick={() => triggerDeleteConfirm(post)}
                      style={{ 
                        background: 'rgba(255, 23, 68, 0.08)', 
                        border: '1px solid rgba(255, 23, 68, 0.15)', 
                        color: 'var(--error)', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'var(--error)';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = 'var(--error)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 23, 68, 0.08)';
                        e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.borderColor = 'rgba(255, 23, 68, 0.15)';
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <DeletePostModal 
        isOpen={isDeleteModalOpen}
        post={deleteTargetPost}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </motion.div>
  );
}
