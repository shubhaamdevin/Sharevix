import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, Trash2, CalendarClock, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

const platformIcons = {
  facebook: { icon: FacebookIcon, color: '#1877F2' },
  instagram: { icon: InstagramIcon, color: '#E1306C' },
  x: { icon: TwitterIcon, color: '#000000' },
  linkedin: { icon: LinkedinIcon, color: '#0A66C2' },
  tiktok: { icon: TiktokIcon, color: '#000000' },
  youtube: { icon: YoutubeIcon, color: '#FF0000' }
};

export default function Drafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const triggerDeleteConfirm = (postId) => {
    setDeleteTargetId(postId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleteModalOpen(false);
    await deleteDraft(deleteTargetId);
    setDeleteTargetId(null);
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const allPosts = await dbService.getPosts();
      const allDrafts = allPosts.filter(p => p.status === 'draft');
      setDrafts(allDrafts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Failed to load drafts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const deleteDraft = async (id) => {
    const success = await dbService.deletePost(id);
    if (success) {
      setDrafts(prev => prev.filter(d => d.id !== id));
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'success', message: 'Draft deleted successfully!' } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('show-notification', { 
        detail: { type: 'error', message: 'Failed to delete draft.' } 
      }));
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileEdit size={28} color="var(--accent-blue)" /> Draft Templates
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage, edit, and publish your saved drafts.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <div className="animate-spin" style={{ fontSize: '2rem' }}>⏳</div>
        </div>
      ) : drafts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <FileEdit size={48} color="var(--panel-border)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Drafts Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            You haven't saved any drafts yet. Create a draft using the Universal Composer.
          </p>
          <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px' }}>
            Create Your First Draft
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {drafts.map(draft => (
              <motion.div 
                variants={itemVariants} 
                layoutId={draft.id} 
                key={draft.id} 
                className="glass-panel" 
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', justifyContent: 'space-between', border: '1px solid var(--panel-border)' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                      Type: {draft.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Saved: {new Date(draft.date).toLocaleDateString()}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', minHeight: '80px', marginBottom: '1rem' }}>
                    {draft.content || <em style={{ color: 'var(--text-secondary)' }}>No text content</em>}
                  </p>

                  {draft.media && draft.media.length > 0 && (
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: draft.media.length > 1 ? 'repeat(2, 1fr)' : '1fr', 
                      gap: '0.5rem', 
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      {draft.media.map((file, i) => (
                        <div key={i} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--panel-border)', background: '#000' }}>
                          {file.type && file.type.startsWith('video') ? (
                            <video src={file.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                          ) : (
                            <img src={file.url} alt="Draft media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {draft.platforms && draft.platforms.map(p => {
                      const plat = platformIcons[p];
                      if (!plat) return null;
                      const Icon = plat.icon;
                      return Icon ? <Icon key={p} size={20} /> : null;
                    })}
                    {(!draft.platforms || draft.platforms.length === 0) && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No Platforms</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => navigate('/create', { state: { editPost: draft } })}
                      style={{
                        background: 'rgba(58,123,213,0.1)',
                        border: '1px solid rgba(58,123,213,0.2)',
                        color: 'var(--accent-blue)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-blue)';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.borderColor = 'var(--accent-blue)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(58,123,213,0.1)';
                        e.currentTarget.style.color = 'var(--accent-blue)';
                        e.currentTarget.style.borderColor = 'rgba(58,123,213,0.2)';
                      }}
                    >
                      <FileEdit size={12} /> Edit
                    </button>

                    <button 
                      onClick={() => triggerDeleteConfirm(draft.id)}
                      style={{
                        background: 'rgba(255, 23, 68, 0.05)',
                        border: '1px solid rgba(255, 23, 68, 0.15)',
                        color: 'var(--error)',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--error)';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = 'var(--error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 23, 68, 0.05)';
                        e.currentTarget.style.color = 'var(--error)';
                        e.currentTarget.style.borderColor = 'rgba(255, 23, 68, 0.15)';
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Draft"
        message="Are you sure you want to delete this draft template? This action cannot be undone."
        confirmLabel="Delete Draft"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </motion.div>
  );
}
