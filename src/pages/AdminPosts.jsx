import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Clock, CheckCircle2, FileEdit } from 'lucide-react';
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

const InlinePremiumLoader = ({ message = "Synchronizing posts node..." }) => (
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

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    setLoading(true);
    const data = await dbService.getPosts();
    setPosts(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(0, 230, 118, 0.2)' }}><CheckCircle2 size={12}/> Published</span>;
      case 'scheduled':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(58, 123, 213, 0.1)', color: 'var(--accent-purple)', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(58, 123, 213, 0.2)' }}><Clock size={12}/> Scheduled</span>;
      case 'draft':
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255, 234, 0, 0.1)', color: 'var(--warning)', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255, 234, 0, 0.2)' }}><FileEdit size={12}/> Draft</span>;
      default:
        return null;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={28} /> All Created Posts
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monitor all content written, saved as drafts, or published by system users.</p>
        </div>

        {/* Search & Status Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search post content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem 0.5rem 2.25rem', color: '#fff', fontSize: '0.85rem', width: '220px', outline: 'none' }}
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all" style={{ color: '#000', background: '#fff' }}>All Statuses</option>
            <option value="published" style={{ color: '#000', background: '#fff' }}>Published</option>
            <option value="scheduled" style={{ color: '#000', background: '#fff' }}>Scheduled</option>
            <option value="draft" style={{ color: '#000', background: '#fff' }}>Drafts</option>
          </select>
        </div>
      </div>

      {loading ? (
        <InlinePremiumLoader message="Syncing post repository..." />
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
                  {/* Post Content */}
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                      {post.content || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No content text</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ textTransform: 'capitalize' }}>Type: {post.type}</span>
                      <span>•</span>
                      <span>Created: {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
                          <div key={p} style={{ width: '22px', height: '22px', borderRadius: '50%', background: plat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }} title={p}>
                            {Icon ? <Icon size={12} /> : <span style={{ fontSize: '9px', fontWeight: 'bold' }}>{plat.letter}</span>}
                          </div>
                        );
                      })}
                      {(!post.platforms || post.platforms.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>-</span>}
                    </div>

                    {/* Status Badge */}
                    {getStatusBadge(post.status)}

                  </div>

                </motion.div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              No posts found matching the criteria.
            </div>
          )}
        </div>
      )}

    </motion.div>
  );
}
