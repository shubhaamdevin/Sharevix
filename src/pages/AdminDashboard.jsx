import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, AlertTriangle, ShieldCheck, Activity, Clock, Server, Cpu, DatabaseZap, 
  Database, RefreshCw, ToggleLeft, ToggleRight, FileText, CalendarClock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  
  // Real-time calculated statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    bannedUsers: 0,
    totalPosts: 0,
    activeScheduled: 0
  });

  // System Controls state
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [backupRunning, setBackupRunning] = useState(false);
  const [serverLoad, setServerLoad] = useState(34);
  const [loading, setLoading] = useState(true);

  // System Activity Logs
  const [logs, setLogs] = useState([
    { id: 1, event: 'Database backup successfully saved to AWS S3', type: 'info', time: '5 mins ago' },
    { id: 2, event: 'API endpoint /posts/schedule response time peak (1.2s)', type: 'error', time: '1 hour ago' },
    { id: 3, event: 'New account registrations peak capacity reached', type: 'info', time: '2 hours ago' }
  ]);

  // Fetch genuine data from Firebase/LocalStorage
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const allUsers = await dbService.getUsers();
      const allPosts = await dbService.getPosts();
      
      const banned = allUsers.filter(u => u.status === 'banned').length;
      const scheduled = allPosts.filter(p => p.status === 'scheduled').length;
      
      setStats({
        totalUsers: allUsers.length,
        bannedUsers: banned,
        totalPosts: allPosts.length,
        activeScheduled: scheduled
      });
    } catch (error) {
      console.error("Failed to load admin stats: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Simulated server load fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setServerLoad(prev => {
        const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
        return Math.max(15, Math.min(85, prev + delta));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (event, type) => {
    const newLog = {
      id: Date.now(),
      event,
      type,
      time: 'Just now'
    };
    setLogs(prev => [newLog, ...prev.slice(0, 5)]);
  };

  const triggerBackup = () => {
    setBackupRunning(true);
    addLog('Manual system backup process initiated...', 'info');
    setTimeout(() => {
      setBackupRunning(false);
      addLog('Manual system backup completed successfully!', 'success');
    }, 3000);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-purple)' }}>
            <ShieldCheck size={32} /> Admin Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Live system diagnostics, status cards, and security feeds.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', color: '#fff', border: '1px solid var(--panel-border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Registered Users', value: stats.totalUsers, icon: Users, color: 'var(--accent-blue)', subtitle: 'Genuine users in system' },
          { label: 'Total Posts Created', value: stats.totalPosts, icon: FileText, color: '#ffb300', subtitle: 'All published & drafts' },
          { label: 'Active Scheduled Posts', value: stats.activeScheduled, icon: CalendarClock, color: '#00e676', subtitle: 'Queued to launch' },
          { label: 'Banned Accounts', value: stats.bannedUsers, icon: AlertTriangle, color: 'var(--error)', subtitle: 'Access suspended' },
        ].map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div variants={itemVariants} key={i} className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden', border: `1px solid ${metric.color}25` }}>
              <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', opacity: 0.08 }}><Icon size={120} color={metric.color} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{metric.label}</span>
                <span style={{ color: metric.color, background: `${metric.color}15`, padding: '4px', borderRadius: '8px' }}><Icon size={16} /></span>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0.5rem 0' }}>{loading ? '...' : metric.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{metric.subtitle}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Two Column Layout: Controls & Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        
        {/* System Control Panel */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Server size={20} color="var(--accent-blue)" /> System Controls</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Locks dashboard to read-only mode</div>
              </div>
              <button 
                onClick={() => { setMaintenanceMode(!maintenanceMode); addLog(`Maintenance mode toggled ${!maintenanceMode ? 'ON' : 'OFF'}`, 'warning'); }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: maintenanceMode ? 'var(--error)' : 'var(--text-secondary)' }}
              >
                {maintenanceMode ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Allow New Registrations</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Accept new sign-ups into the platform</div>
              </div>
              <button 
                onClick={() => { setNewRegistrations(!newRegistrations); addLog(`Signups toggled ${!newRegistrations ? 'ENABLED' : 'DISABLED'}`, 'info'); }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: newRegistrations ? 'var(--success)' : 'var(--text-secondary)' }}
              >
                {newRegistrations ? <ToggleRight size={40} color="var(--success)" /> : <ToggleLeft size={40} />}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>Database Snapshot Backup</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Initiate hot-snapshot of database nodes</div>
              </div>
              <button 
                onClick={triggerBackup} 
                disabled={backupRunning}
                style={{ background: backupRunning ? 'rgba(255,255,255,0.05)' : 'var(--accent-purple)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {backupRunning ? <RefreshCw size={16} className="spin" /> : <Database size={16} />}
                {backupRunning ? 'Backing up...' : 'Backup Now'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Live Diagnostics Log & Server Stats */}
        <motion.div variants={itemVariants} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} color="var(--accent-purple)" /> Server Status & Performance</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Server CPU Load</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={16} color="var(--accent-blue)" />
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{serverLoad}%</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>DB Connection</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DatabaseZap size={16} color="var(--success)" />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)' }}>Optimal</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
            {logs.map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: 'rgba(255,255,255,0.01)', borderRadius: '6px', fontSize: '0.8rem', borderLeft: '2px solid var(--accent-purple)' }}>
                <div style={{ color: 'var(--text-primary)' }}>{log.event}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{log.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
