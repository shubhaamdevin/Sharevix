import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check } from 'lucide-react';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon, ThreadsIcon } from './Icons';

const platformInfo = {
  facebook: { name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
  instagram: { name: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
  x: { name: 'Twitter/X', icon: TwitterIcon, color: '#ffffff' },
  linkedin: { name: 'LinkedIn', icon: LinkedinIcon, color: '#0A66C2' },
  tiktok: { name: 'TikTok', icon: TiktokIcon, color: '#000000' },
  youtube: { name: 'YouTube', icon: YoutubeIcon, color: '#FF0000' },
  threads: { name: 'Threads', icon: ThreadsIcon, color: '#ffffff' }
};

export default function DeletePostModal({
  isOpen,
  post,
  onConfirm,
  onCancel
}) {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [deleteLocal, setDeleteLocal] = useState(true);

  useEffect(() => {
    if (post) {
      setSelectedPlatforms(post.platforms || []);
      setDeleteLocal(true);
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const publishedPlatforms = post.platforms || [];
  const hasPlatforms = publishedPlatforms.length > 0;

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleConfirm = () => {
    onConfirm(post.id, selectedPlatforms, deleteLocal);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          style={{
            background: 'var(--bg-dark)',
            border: '1px solid var(--panel-border)',
            borderRadius: '24px',
            padding: '2rem',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 61, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 61, 0, 0.2)'
            }}>
              <AlertTriangle size={24} color="var(--error)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Delete Post Options
            </h3>
          </div>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: '1.5',
            margin: 0
          }}>
            Select where you would like to delete this post from. Deleting from connected platforms will send API requests to remove the post.
          </p>

          {/* Social Platforms list */}
          {hasPlatforms && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connected Social Media
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {publishedPlatforms.map(p => {
                  const info = platformInfo[p];
                  if (!info) return null;
                  const Icon = info.icon;
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <div
                      key={p}
                      onClick={() => togglePlatform(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        background: isChecked ? 'rgba(255,255,255,0.03)' : 'transparent',
                        border: `1px solid ${isChecked ? 'rgba(255,255,255,0.1)' : 'var(--panel-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon color={info.color} size={20} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{info.name}</span>
                      </div>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: `2px solid ${isChecked ? 'var(--error)' : 'var(--panel-border)'}`,
                        background: isChecked ? 'var(--error)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}>
                        {isChecked && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sharevix dashboard option */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--panel-border)', paddingTop: '1.25rem' }}>
            <div
              onClick={() => setDeleteLocal(!deleteLocal)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: deleteLocal ? 'rgba(255, 61, 0, 0.05)' : 'transparent',
                border: `1px solid ${deleteLocal ? 'rgba(255, 61, 0, 0.2)' : 'var(--panel-border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Delete from Sharevix Dashboard</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Remove history and details of this post permanently</span>
              </div>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                border: `2px solid ${deleteLocal ? 'var(--error)' : 'var(--panel-border)'}`,
                background: deleteLocal ? 'var(--error)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {deleteLocal && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button
              onClick={onCancel}
              className="btn-secondary"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={selectedPlatforms.length === 0 && !deleteLocal}
              style={{
                flex: 1,
                background: 'var(--error)',
                border: 'none',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(255, 61, 0, 0.2)',
                opacity: (selectedPlatforms.length === 0 && !deleteLocal) ? 0.5 : 1,
                pointerEvents: (selectedPlatforms.length === 0 && !deleteLocal) ? 'none' : 'auto',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              Delete Selected
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
