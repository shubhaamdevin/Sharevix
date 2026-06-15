import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Search, Clock } from 'lucide-react';
import { dbService } from '../services/db';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon } from '../components/Icons';

const platformIcons = {
  facebook: { icon: FacebookIcon, color: '#1877F2' },
  instagram: { icon: InstagramIcon, color: '#E1306C' },
  x: { icon: TwitterIcon, color: '#000000' },
  linkedin: { icon: null, color: '#0A66C2', letter: 'in' },
  tiktok: { icon: null, color: '#00F2FE', letter: 'T' },
  youtube: { icon: YoutubeIcon, color: '#FF0000' }
};

const InlinePremiumLoader = ({ message = "Synchronizing pipeline data..." }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem', gap: '1.25rem' }}>
    <div style={{ position: 'relative', width: '48px', height: '48px' }}>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.02)',
          borderTop: '3px solid var(--accent-blue)',
          borderRight: '3px solid var(--accent-purple)',
          boxShadow: '0 0 15px rgba(0, 210, 255, 0.25)'
        }}
      />
    </div>
    <motion.div 
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
      style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
    >
      {message}
    </motion.div>
  </div>
);

export default function AdminScheduled() {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadScheduledPosts = async () => {
    setLoading(true);
    const data = await dbService.getPosts();
    setScheduledPosts(data.filter(p => p.status === 'scheduled').sort((a, b) => new Date(a.date) - new Date(b.date)));
    setLoading(false);
  };

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const filteredPosts = scheduledPosts.filter(post => 
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#00e676', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CalendarClock size={28} /> Active Scheduled Posts
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Posts waiting in the queue to be dispatched automatically to social networks.</p>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search scheduled posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem 0.5rem 2.25rem', color: '#fff', fontSize: '0.85rem', width: '250px', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <InlinePremiumLoader message="Syncing scheduler pipeline..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const dateObj = new Date(post.date);
              return (
                <motion.div 
                  key={post.id}
                  whileHover={{ x: 6, background: 'rgba(255,255,255,0.03)' }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--panel-border)', transition: 'all 0.2s ease', flexWrap: 'wrap', gap: '1.5rem'
                  }}
                >
                  {/* Content Preview */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                      {post.content}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ textTransform: 'capitalize' }}>Type: {post.type}</span>
                      <span>•</span>
                      <span style={{ color: '#00e676', fontWeight: 600 }}>
                        Release: {dateObj.toLocaleDateString()} at {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Platforms & Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                    
                    {/* Platforms Icons list */}
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {post.platforms && post.platforms.map(p => {
                        const plat = platformIcons[p];
                        if (!plat) return null;
                        const Icon = plat.icon;
                        return (
                          <div key={p} style={{ width: '20px', height: '20px', borderRadius: '50%', background: plat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title={p}>
                            {Icon ? <Icon size={12} /> : <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{plat.letter}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Badge */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0, 230, 118, 0.1)', color: '#00e676', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(0, 230, 118, 0.2)' }}>
                      <Clock size={12}/> Pending
                    </span>

                  </div>

                </motion.div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              No pending scheduled posts in queue.
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
}
