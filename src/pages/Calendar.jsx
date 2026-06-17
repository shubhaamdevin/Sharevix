import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, FileEdit, Trash2, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon, ThreadsIcon } from '../components/Icons';
import DeletePostModal from '../components/DeletePostModal';

const platformIcons = {
  facebook: { icon: FacebookIcon, color: '#1877F2' },
  instagram: { icon: InstagramIcon, color: '#E1306C' },
  x: { icon: TwitterIcon, color: '#000000' },
  linkedin: { icon: LinkedinIcon, color: '#0A66C2' },
  tiktok: { icon: TiktokIcon, color: '#000000' },
  youtube: { icon: YoutubeIcon, color: '#FF0000' },
  threads: { icon: ThreadsIcon, color: '#000000' }
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null); // For detail modal
  
  // Delete modal states
  const [deleteTargetPost, setDeleteTargetPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchPosts = async () => {
    const data = await dbService.getPosts();
    setHistory(data);
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
      fetchPosts();
      setSelectedPost(null);
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'success', message: deleteLocal ? 'Post deleted successfully!' : 'Post removed from selected platforms!' } 
      }));
    }
    setDeleteTargetPost(null);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Month Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push(new Date(year, month, i));
  }

  // Get posts for a specific date
  const getPostsForDate = (date) => {
    if (!date) return [];
    return history.filter(post => {
      const pDate = new Date(post.date);
      return (
        pDate.getDate() === date.getDate() &&
        pDate.getMonth() === date.getMonth() &&
        pDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      {/* Header & Month Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <CalendarIcon size={28} color="var(--accent-blue)" /> Content Calendar
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track your published, scheduled, and drafted content on the monthly grid.</p>
        </div>

        {/* Month Picker Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
          <button onClick={handlePrevMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '130px', textAlign: 'center' }}>
            {monthName} {year}
          </span>
          <button onClick={handleNextMonth} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', overflowX: 'auto' }}>
        
        {/* Days of Week Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gap: '0.5rem', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: '1px solid var(--panel-border)' }}>
          {weekDays.map(day => (
            <div key={day} style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
          ))}
        </div>

        {/* Calendar Monthly Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', gridAutoRows: '120px', gap: '0.5rem', marginTop: '0.5rem' }}>
          {daysGrid.map((date, index) => {
            const datePosts = getPostsForDate(date);
            const isToday = date && new Date().toDateString() === date.toDateString();

            return (
              <div 
                key={index} 
                style={{
                  background: date ? (isToday ? 'rgba(0, 210, 255, 0.05)' : 'rgba(255,255,255,0.01)') : 'transparent',
                  border: date ? (isToday ? '1px solid var(--accent-blue)' : '1px solid var(--panel-border)') : 'none',
                  borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
                  position: 'relative', overflowY: 'auto', boxSizing: 'border-box'
                }}
              >
                {date && (
                  <div style={{ 
                    fontSize: '0.9rem', fontWeight: 700, 
                    color: isToday ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    marginBottom: '0.25rem'
                  }}>
                    {date.getDate()}
                  </div>
                )}

                {/* Render Post Badges Inside Grid Cell */}
                {datePosts.map(post => {
                  const statusColors = {
                    published: 'rgba(0, 230, 118, 0.15)',
                    scheduled: 'rgba(58, 123, 213, 0.15)',
                    draft: 'rgba(255, 234, 0, 0.15)'
                  };
                  const textColors = {
                    published: 'var(--success)',
                    scheduled: 'var(--accent-blue)',
                    draft: 'var(--warning)'
                  };

                  return (
                    <div 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)}
                      style={{
                        background: statusColors[post.status || 'published'],
                        color: textColors[post.status || 'published'],
                        fontSize: '0.7rem', fontWeight: 600, padding: '3px 6px', borderRadius: '6px',
                        cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        display: 'flex', alignItems: 'center', gap: '0.35rem', border: `1px solid ${textColors[post.status || 'published']}20`
                      }}
                      title={post.content}
                    >
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {post.platforms && post.platforms.map(p => {
                          const Icon = platformIcons[p]?.icon;
                          return Icon ? <Icon key={p} size={10} /> : null;
                        })}
                      </div>
                      <span>{post.content || '[Media]'}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              style={{ background: 'var(--bg-dark)', border: '1px solid var(--panel-border)', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative' }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPost(null)} 
                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Post Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Status: <strong style={{ textTransform: 'capitalize', color: selectedPost.status === 'published' ? 'var(--success)' : 'var(--accent-blue)' }}>{selectedPost.status}</strong></span>
                  {selectedPost.visibility && (
                    <span>Visibility: <strong style={{ textTransform: 'capitalize', color: 'var(--accent-blue)' }}>{selectedPost.visibility}</strong></span>
                  )}
                  <span>Date: {new Date(selectedPost.date).toLocaleString()}</span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.95rem', minHeight: '100px' }}>
                  {selectedPost.content || <em style={{ color: 'var(--text-secondary)' }}>No text content</em>}
                </div>

                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: selectedPost.media.length > 1 ? 'repeat(2, 1fr)' : '1fr', 
                    gap: '0.5rem', 
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    {selectedPost.media.map((file, i) => (
                      <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--panel-border)', background: '#000' }}>
                        {file.type && file.type.startsWith('video') ? (
                          <video src={file.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <img src={file.url} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Platforms:</span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {selectedPost.platforms && selectedPost.platforms.map(p => {
                      const Icon = platformIcons[p]?.icon;
                      return Icon ? <Icon key={p} size={20} /> : null;
                    })}
                    {(!selectedPost.platforms || selectedPost.platforms.length === 0) && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Draft (No Platforms)</span>}
                  </div>
                </div>

                {/* Actions inside modal */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => {
                      setSelectedPost(null);
                      navigate('/create', { state: { editPost: selectedPost } });
                    }}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <FileEdit size={16} /> Edit Post
                  </button>

                  <button 
                    onClick={() => triggerDeleteConfirm(selectedPost)}
                    style={{ 
                      background: 'rgba(255, 23, 68, 0.1)', 
                      border: '1px solid rgba(255, 23, 68, 0.2)', 
                      color: 'var(--error)', 
                      padding: '0.75rem', 
                      borderRadius: '12px', 
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 23, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 23, 68, 0.1)'}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeletePostModal
        isOpen={isDeleteModalOpen}
        post={deleteTargetPost}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

    </div>
  );
}
