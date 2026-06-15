import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserX, Search, UserCheck, Trash2 } from 'lucide-react';
import { dbService } from '../services/db';
import ConfirmationModal from '../components/ConfirmationModal';

const InlinePremiumLoader = ({ message = "Querying blacklist nodes..." }) => (
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

export default function AdminBanned() {
  const [bannedUsers, setBannedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadBannedUsers = async () => {
    setLoading(true);
    const data = await dbService.getUsers();
    setBannedUsers(data.filter(u => u.status === 'banned'));
    setLoading(false);
  };

  useEffect(() => {
    loadBannedUsers();
  }, []);

  const handleUnban = async (id) => {
    const success = await dbService.updateUserStatus(id, 'active');
    if (success) {
      setBannedUsers(bannedUsers.filter(u => u.id !== id));
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: "User successfully restored!" } }));
    }
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleteModalOpen(false);
    const success = await dbService.deleteUser(deleteTargetId);
    if (success) {
      setBannedUsers(bannedUsers.filter(u => u.id !== deleteTargetId));
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: "User account deleted permanently" } }));
    }
    setDeleteTargetId(null);
  };

  const filteredUsers = bannedUsers.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserX size={28} /> Banned Accounts
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Accounts restricted from logging in or scheduling content.</p>
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search suspended accounts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem 0.5rem 2.25rem', color: '#fff', fontSize: '0.85rem', width: '250px', outline: 'none' }}
          />
        </div>
      </div>

      {loading ? (
        <InlinePremiumLoader message="Syncing restriction logs..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <motion.div 
                key={user.id}
                whileHover={{ x: 6, background: 'rgba(255,255,255,0.03)' }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem', borderRadius: '14px', background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--panel-border)', transition: 'all 0.2s ease', flexWrap: 'wrap', gap: '1rem'
                }}
              >
                {/* User Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '200px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{user.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Joined: {user.joined}</div>
                </div>

                {/* Status and Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  
                  <span style={{ 
                    color: 'var(--error)', background: 'rgba(255, 23, 68, 0.1)', 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                    border: '1px solid rgba(255, 23, 68, 0.2)'
                  }}>
                    Banned
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--panel-border)', paddingLeft: '1rem' }}>
                    <button 
                      onClick={() => handleUnban(user.id)} 
                      style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.2)', color: 'var(--success)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                      title="Unban Account"
                    >
                      <UserCheck size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.2)', color: 'var(--error)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                      title="Permanently Delete Account"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>

              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              No banned accounts found.
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Permanently Delete Account"
        message="Are you sure you want to permanently delete this banned user? This action is completely irreversible."
        confirmLabel="Permanently Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </motion.div>
  );
}
