import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Activity, PenSquare, ChevronDown, Globe, CheckCircle2, Clock, FileEdit, Trash2, Users, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon, LinkedinIcon, TiktokIcon } from '../components/Icons';

const platformIcons = {
  facebook: { icon: FacebookIcon, color: '#1877F2' },
  instagram: { icon: InstagramIcon, color: '#E1306C' },
  x: { icon: TwitterIcon, color: '#000000' },
  linkedin: { icon: LinkedinIcon, color: '#0A66C2' },
  tiktok: { icon: TiktokIcon, color: '#000000' },
  youtube: { icon: YoutubeIcon, color: '#FF0000' }
};

const InlinePremiumLoader = ({ message = "Synchronizing intelligence data stream..." }) => (
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click Outside to Close dropdown logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [liveFollowers, setLiveFollowers] = useState(1420);

  useEffect(() => {
    const fetchFacebookStats = async () => {
      const token = localStorage.getItem('fb_access_token');
      let pageId = localStorage.getItem('fb_page_id');
      if (token) {
        try {
          if (!pageId) {
            const accountsRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`);
            const accountsData = await accountsRes.json();
            if (accountsRes.ok && accountsData.data && accountsData.data.length > 0) {
              pageId = accountsData.data[0].id;
            }
          }
          if (pageId) {
            const res = await fetch(`https://graph.facebook.com/v18.0/${pageId}?fields=fan_count,followers_count&access_token=${token}`);
            const data = await res.json();
            if (res.ok) {
              const count = data.followers_count || data.fan_count || 1420;
              setLiveFollowers(count);
            }
          }
        } catch (e) {
          console.warn("Could not load FB fans count, using simulated count", e);
        }
      }
    };
    fetchFacebookStats();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const allPosts = await dbService.getPosts();
        setPosts(allPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error("Failed to load dashboard posts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();

    window.addEventListener('posts-updated', fetchPosts);
    return () => window.removeEventListener('posts-updated', fetchPosts);
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  // Platform Filter Configuration
  const platformOptions = [
    { id: 'all', name: 'All Platforms', icon: Globe, color: 'var(--accent-blue)' },
    { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
    { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
    { id: 'x', name: 'X (Twitter)', icon: TwitterIcon, color: '#ffffff' },
    { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon, color: '#0A66C2' },
    { id: 'tiktok', name: 'TikTok', icon: TiktokIcon, color: '#ffffff' },
    { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000' }
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedPlatform === 'all') return true;
    return post.platforms?.includes(selectedPlatform);
  });

  const displayPosts = filteredPosts.filter(post => {
    if (statusFilter === 'all') return true;
    return post.status === statusFilter;
  });

  // Calculate genuine metrics based on filtered posts
  const totalPosts = filteredPosts.length;
  const publishedPosts = filteredPosts.filter(p => p.status === 'published').length;
  const scheduledPosts = filteredPosts.filter(p => p.status === 'scheduled').length;
  const drafts = filteredPosts.filter(p => p.status === 'draft').length;

  // Simulate reach specifically for selected platforms
  const estimatedReach = filteredPosts
    .filter(p => p.status === 'published')
    .reduce((sum, post) => {
      const platformCount = selectedPlatform === 'all' ? (post.platforms?.length || 1) : 1;
      return sum + (platformCount * 245);
    }, 0);

  const estimatedEngagement = Math.round(estimatedReach * 0.12);

  const metrics = [
    { label: selectedPlatform === 'all' ? 'Total Posts' : `Total on ${selectedPlatform}`, value: totalPosts, change: `Drafts & published`, icon: Activity, color: 'var(--accent-blue)' },
    { label: selectedPlatform === 'all' ? 'Published Posts' : `${selectedPlatform} Published`, value: publishedPosts, change: 'Successfully posted', icon: CheckCircle2, color: '#00e676' },
    { label: selectedPlatform === 'all' ? 'Scheduled Queue' : `${selectedPlatform} Scheduled`, value: scheduledPosts, change: 'Waiting to publish', icon: Clock, color: 'var(--accent-purple)' },
    { label: selectedPlatform === 'all' ? 'Draft Templates' : `${selectedPlatform} Drafts`, value: drafts, change: 'Saved as drafts', icon: FileEdit, color: 'var(--warning)' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={28} color="var(--accent-blue)" /> Analytics Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time stats calculated from your published and scheduled posts.</p>
        </div>
        
        {/* Filter and Create Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', zIndex: 100 }}>
          
          {/* Custom Select Dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsOpen(!isOpen)}
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
                  const activeOpt = platformOptions.find(o => o.id === selectedPlatform);
                  if (!activeOpt) return null;
                  const Icon = activeOpt.icon;
                  return <Icon size={16} color={activeOpt.color} />;
                })()}
                <span style={{ textTransform: 'capitalize' }}>
                  {platformOptions.find(o => o.id === selectedPlatform)?.name}
                </span>
              </div>
              <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }} />
            </button>
            
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
                    background: 'var(--panel-bg)', backdropFilter: 'blur(25px)',
                    border: '1px solid var(--panel-border)', borderRadius: '12px',
                    padding: '0.5rem', width: '200px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex',
                    flexDirection: 'column', gap: '0.25rem', zIndex: 1000
                  }}
                >
                  {platformOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedPlatform === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedPlatform(opt.id);
                          setIsOpen(false);
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '160px' }}>
            <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
              <PenSquare size={16} /> Create New Post
            </button>
            <button 
              onClick={() => navigate('/live-count')} 
              className="btn-secondary" 
              style={{ 
                padding: '0.6rem 1.25rem', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                justifyContent: 'center',
                fontSize: '0.85rem',
                border: '1px solid var(--panel-border)',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = 'var(--panel-border)';
              }}
            >
              <Radio size={14} color="#ff3d00" className="animate-pulse" /> Live Count
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <InlinePremiumLoader message="Syncing Campaign Data Stream..." />
      ) : (
        <>
          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div 
                  variants={itemVariants} 
                  key={i} 
                  className="metric-card" 
                  style={{ 
                    border: `1px solid ${metric.color}20` 
                  }}
                  whileHover={{ borderColor: `${metric.color}50` }}
                >
                  <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', opacity: 0.08 }}><Icon size={120} color={metric.color} /></div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${metric.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon color={metric.color} size={20} />
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>{metric.label}</div>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem', lineHeight: 1 }}>{metric.value}</div>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', zIndex: 2 }}>{metric.change}</div>
                </motion.div>
              )
            })}
          </div>

          {totalPosts === 0 ? (
            <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <PenSquare size={48} color="var(--panel-border)" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Posts Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.95rem' }}>
                {selectedPlatform === 'all' 
                  ? "You haven't created any posts or drafts yet. Create your first post using the universal composer to activate live metrics."
                  : `No posts found targeted for ${selectedPlatform}. Write a post for this platform to activate its metrics.`}
              </p>
              <button onClick={() => navigate('/create')} className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '10px', marginTop: '0.5rem' }}>
                Write Your First Post
              </button>
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              
              {/* Queue Breakdown row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,230,118,0.03)', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(0,230,118,0.15)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Published Posts</div>
                  <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.3rem' }}>{publishedPosts}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(156,39,176,0.03)', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(156,39,176,0.15)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Scheduled Posts</div>
                  <div style={{ color: 'var(--accent-purple)', fontWeight: 800, fontSize: '1.3rem' }}>{scheduledPosts}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,234,0,0.03)', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,234,0,0.15)' }}>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>Draft Templates</div>
                  <div style={{ color: 'var(--warning)', fontWeight: 800, fontSize: '1.3rem' }}>{drafts}</div>
                </div>
              </div>

              {/* Premium List Row Cards */}
              <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {selectedPlatform === 'all' ? 'Recent Content' : `${selectedPlatform} Content`}
                  </h3>
                  
                  {/* Status Filters (Tabs) */}
                  <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.1)', padding: '0.2rem', borderRadius: '8px' }}>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'published', label: 'Published' },
                      { id: 'scheduled', label: 'Scheduled' },
                      { id: 'draft', label: 'Drafts' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id)}
                        style={{
                          background: statusFilter === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                          color: statusFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                          border: 'none',
                          padding: '0.3rem 0.7rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {displayPosts.map((post, i) => (
                    <div 
                      key={post.id || i}
                      className="post-list-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                        {post.media && post.media.length > 0 && (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--panel-border)', background: '#000', flexShrink: 0 }}>
                            {post.media[0].type && post.media[0].type.startsWith('video') ? (
                              <video src={post.media[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                            ) : (
                              <img src={post.media[0].url} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                            {post.content || '[Media Post or Empty Content]'}
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                            <span style={{ textTransform: 'capitalize' }}>Type: {post.type}</span>
                            <span>•</span>
                            <span>{new Date(post.date).toLocaleDateString()}</span>
                            {post.platforms && post.platforms.length > 0 && (
                              <>
                                <span>•</span>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>
                                  Destination: {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        {/* Platforms badges */}
                         <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                           {post.platforms && post.platforms.map(p => {
                             const plat = platformIcons[p];
                             if (!plat) return null;
                             const Icon = plat.icon;
                             return Icon ? <Icon key={p} size={20} /> : null;
                           })}
                           {(!post.platforms || post.platforms.length === 0) && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draft</span>}
                         </div>

                        {/* Status Badge */}
                        <span style={{ 
                          textTransform: 'capitalize', fontSize: '0.75rem', fontWeight: 700,
                          padding: '4px 10px', borderRadius: '20px',
                          background: post.status === 'published' ? 'rgba(0, 230, 118, 0.1)' : (post.status === 'scheduled' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(255, 23, 68, 0.1)'),
                          color: post.status === 'published' ? 'var(--success)' : (post.status === 'scheduled' ? 'var(--accent-purple)' : 'var(--error)'),
                          border: `1px solid ${post.status === 'published' ? 'rgba(0, 230, 118, 0.2)' : (post.status === 'scheduled' ? 'rgba(156, 39, 176, 0.2)' : 'rgba(255, 23, 68, 0.2)')}`
                        }}>
                          {post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {displayPosts.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem', fontSize: '0.9rem' }}>
                      No posts found matching the selected filters.
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}

    </motion.div>
  );
}
