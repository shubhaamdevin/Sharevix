import React, { useState } from 'react';
import { Sparkles, TrendingUp, Search, RefreshCw, Star, ArrowRight } from 'lucide-react';

const mockTrends = [
  { id: 1, title: 'AI Automation in Social Scheduling', category: 'Tech & AI', volume: '142K posts', growth: '+28%' },
  { id: 2, title: '#MinimalistHomeDecor Ideas', category: 'Home & Living', volume: '89K posts', growth: '+15%' },
  { id: 3, title: 'Reels Hooks that Double Engagement', category: 'Marketing', volume: '220K posts', growth: '+42%' },
  { id: 4, title: 'EV Charging Networks Expansion', category: 'Automotive', volume: '54K posts', growth: '+8%' }
];

const mockCompetitorIdeas = [
  { id: 1, profile: '@competitor_brand_a', title: 'Top 5 mistakes to avoid in branding campaigns', engagement: 'High (4.8% ER)' },
  { id: 2, profile: '@marketing_influencer', title: 'How I grew to 10k followers in 30 days without ads', engagement: 'Viral (9.2% ER)' }
];

export default function InspirationRadar() {
  const [trends, setTrends] = useState(mockTrends);
  const [ideas, setIdeas] = useState(mockCompetitorIdeas);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Shuffle or simulate refresh
      setTrends(prev => [...prev].reverse());
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={28} color="var(--accent-blue)" /> Inspiration Radar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Discover trending hashtags and high-performing content templates in your niche.</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '0.6rem 1rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh Radar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="composer-grid">
        
        {/* LEFT: Live Trends */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-purple)" /> Trending Topics & Volume
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {trends.map(t => (
              <div 
                key={t.id}
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', 
                  borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' 
                }}
              >
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase' }}>{t.category}</span>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.2rem' }}>{t.title}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.volume}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>{t.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Content Ideas */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} color="gold" /> Competitor Radar Ideas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ideas.map(idea => (
              <div 
                key={idea.id}
                style={{ 
                  display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', 
                  borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-purple)' }}>{idea.profile}</span>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(0, 210, 255, 0.1)', color: 'var(--accent-blue)', padding: '0.2rem 0.5rem', borderRadius: '10px', fontWeight: 600 }}>{idea.engagement}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{idea.title}</p>
                <button style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Create similar post <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
