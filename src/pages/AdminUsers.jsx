import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Ban, UserCheck, Trash2, ShieldAlert, ArrowLeftRight } from 'lucide-react';
import { dbService } from '../services/db';
import ConfirmationModal from '../components/ConfirmationModal';

const InlinePremiumLoader = ({ message = "Synchronizing directory nodes..." }) => (
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

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const data = await dbService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleBan = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    const success = await dbService.updateUserStatus(id, newStatus);
    if (success) {
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: `User status changed to ${newStatus}` } }));
    }
  };

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const success = await dbService.updateUserRole(id, newRole);
    if (success) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: `User role changed to ${newRole}` } }));
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
      setUsers(users.filter(u => u.id !== deleteTargetId));
      window.dispatchEvent(new CustomEvent('show-notification', { detail: { type: 'success', message: "User successfully deleted" } }));
    }
    setDeleteTargetId(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={28} /> Total Registered Users
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse, filter, and manage permissions for all users.</p>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search user or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem 0.5rem 2.25rem', color: '#fff', fontSize: '0.85rem', width: '220px', outline: 'none' }}
            />
          </div>
          
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.5rem 1rem', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="all" style={{ color: '#000', background: '#fff' }}>All Roles</option>
            <option value="admin" style={{ color: '#000', background: '#fff' }}>Admin</option>
            <option value="user" style={{ color: '#000', background: '#fff' }}>User</option>
          </select>
        </div>
      </div>

      {loading ? (
        <InlinePremiumLoader message="Syncing account directory..." />
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

                {/* Badges and Stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  
                  {/* Role Swapper Button */}
                  <button 
                    onClick={() => handleRoleToggle(user.id, user.role)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Click to toggle role"
                  >
                    <span style={{ 
                      padding: '0.35rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      background: user.role === 'admin' ? 'rgba(156, 39, 176, 0.15)' : 'rgba(255,255,255,0.05)', 
                      color: user.role === 'admin' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                      border: `1px solid ${user.role === 'admin' ? 'rgba(156, 39, 176, 0.3)' : 'var(--panel-border)'}`
                    }}>
                      {user.role}
                    </span>
                    <ArrowLeftRight size={12} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                  </button>

                  {/* Post count badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Posts</span>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.posts || 0}</span>
                  </div>

                  {/* Status Badge */}
                  <span style={{ 
                    color: user.status === 'active' ? 'var(--success)' : 'var(--error)', 
                    background: user.status === 'active' ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700, 
                    border: `1px solid ${user.status === 'active' ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 23, 68, 0.2)'}`,
                    textTransform: 'capitalize' 
                  }}>
                    {user.status}
                  </span>

                  {/* Quick Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--panel-border)', paddingLeft: '1rem' }}>
                    <button 
                      onClick={() => handleBan(user.id, user.status)} 
                      style={{ background: 'rgba(255, 179, 0, 0.1)', border: '1px solid rgba(255, 179, 0, 0.2)', color: 'var(--warning)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                      title={user.status === 'active' ? 'Ban User' : 'Unban User'}
                    >
                      {user.status === 'active' ? <Ban size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.2)', color: 'var(--error)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                      title="Delete User Account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>

              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
              No users found matching your search query.
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete User Account"
        message="Are you sure you want to delete this user? This action is completely irreversible."
        confirmLabel="Delete Account"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </motion.div>
  );
}
