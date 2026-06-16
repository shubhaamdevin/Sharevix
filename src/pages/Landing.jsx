import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Share2, Layers, Calendar, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { InstagramIcon, FacebookIcon, YoutubeIcon, TwitterIcon } from '../components/Icons';

export default function Landing() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleCTA = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  const platforms = [
    { name: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
    { name: 'Facebook', icon: FacebookIcon, color: '#1877F2' },
    { name: 'YouTube', icon: YoutubeIcon, color: '#FF0000' },
    { name: 'X (Twitter)', icon: TwitterIcon, color: '#000000' }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Navigation Header */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Sharevix
          </h1>
        </div>
        <button 
          onClick={handleCTA}
          className="btn-secondary" 
          style={{ padding: '0.6rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {currentUser ? 'Go to Dashboard' : 'Sign In'} <ArrowRight size={16} />
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', position: 'relative', zIndex: 5 }}>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          {/* Tagline Badge */}
          <motion.div 
            variants={itemVariants}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(58, 123, 213, 0.15)', border: '1px solid rgba(58, 123, 213, 0.3)', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 600 }}
          >
            <Sparkles size={14} /> Ultimate Social Media Hub
          </motion.div>

          {/* Main Heading */}
          <motion.h2 
            variants={itemVariants}
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em' }}
          >
            One Post. <br />
            <span style={{ background: 'linear-gradient(45deg, var(--accent-blue), var(--accent-purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Every Single Platform.
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.25rem)', lineHeight: 1.6, maxWidth: '600px' }}
          >
            Draft, schedule, customize, and analyze your social campaigns globally with one simple composer. Boost engagement, automate workflows.
          </motion.p>

          {/* Call-to-action buttons */}
          <motion.div 
            variants={itemVariants}
            style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <button 
              onClick={handleCTA}
              className="btn-primary" 
              style={{ padding: '1rem 2rem', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 25px rgba(58, 123, 213, 0.4)' }}
            >
              Get Started for Free <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Floating Platform Icons */}
          <motion.div 
            variants={itemVariants}
            style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {platforms.map((plat, i) => {
              const Icon = plat.icon;
              return (
                <motion.div 
                  key={i}
                  whileHover={{ y: -8, scale: 1.1 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--panel-bg)', border: '1px solid var(--panel-border)', padding: '0.75rem 1.25rem', borderRadius: '16px', backdropFilter: 'blur(20px)' }}
                >
                  <Icon color={plat.color} size={20} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{plat.name}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Feature Cards Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1100px', width: '100%', marginTop: '6rem' }}>
          {[
            { title: 'Universal Composer', desc: 'Create content once and preview instantly how it looks on Facebook, Instagram, LinkedIn, or Twitter.', icon: Layers, color: 'var(--accent-blue)' },
            { title: 'Advanced Scheduler', desc: 'Plan posts weeks ahead and save draft templates. Queue content for peak audience activity hours.', icon: Calendar, color: '#00e676' },
            { title: 'Deep Metrics Analytics', desc: 'Track post views, likes, clicks, and growth metrics dynamically across connected networks.', icon: BarChart3, color: 'var(--accent-purple)' }
          ].map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index} 
                className="glass-panel" 
                style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: `1px solid ${feat.color}25` }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} color={feat.color} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{feat.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{feat.desc}</p>
              </motion.div>
            )
          })}
        </div>

      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem', borderTop: '1px solid var(--panel-border)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', zIndex: 10 }}>
        © 2026 Sharevix Social Engine. All rights reserved.
      </footer>

    </div>
  );
}
