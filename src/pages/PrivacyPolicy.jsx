import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', background: 'var(--bg-dark)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2.5rem' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            alignSelf: 'flex-start',
            fontSize: '0.9rem',
            padding: '0.5rem 0',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1.5rem' }}>
          <Shield size={36} color="var(--accent-blue)" />
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Last updated: June 15, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
          
          <section>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>1. Information We Collect</h2>
            <p>
              When you connect your social media profiles (such as Facebook, Instagram, Threads, YouTube, and X) to Sharevix, we receive and store access tokens and profile information (such as your page name and page ID) necessary to authenticate and publish posts on your behalf.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>2. How We Use Your Data</h2>
            <p>
              We use the permissions and access tokens you grant us solely to:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Retrieve list of pages you manage to allow you to select a target channel.</li>
              <li>Publish text, image, and video posts to your selected platforms as requested.</li>
              <li>Schedule posts and automate posting at your requested times.</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>
              We do not sell, rent, or share your data with third parties.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>3. Data Deletion and Disconnection</h2>
            <p>
              You can disconnect any social media account from Sharevix at any time by navigating to the <strong>Social Accounts</strong> page and clicking <strong>Disconnect</strong>.
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              If you want to request complete deletion of your account and all associated data stored in our system, please contact us at <a href="mailto:admin@sharevix.com" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>admin@sharevix.com</a>. We will process your request and delete your information within 48 hours.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>4. Security</h2>
            <p>
              We prioritize the security of your access tokens and account credentials. All credentials and configuration values are securely stored using industry-standard protocols.
            </p>
          </section>

          <section style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
              If you have any questions about this Privacy Policy, please contact our administrator at <strong>admin@sharevix.com</strong>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
