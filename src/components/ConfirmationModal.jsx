import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel", 
  onConfirm, 
  onCancel,
  isDangerous = true
}) {
  if (!isOpen) return null;

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
          background: 'rgba(0,0,0,0.8)', 
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
            maxWidth: '440px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', 
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

          {/* Alert Header Icon */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              background: isDangerous ? 'rgba(255, 61, 0, 0.1)' : 'rgba(0, 210, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `1px solid ${isDangerous ? 'rgba(255, 61, 0, 0.2)' : 'rgba(0, 210, 255, 0.2)'}`
            }}>
              <AlertTriangle size={24} color={isDangerous ? 'var(--error)' : 'var(--accent-blue)'} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {title}
            </h3>
          </div>

          {/* Alert Message */}
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.95rem', 
            lineHeight: '1.6', 
            margin: 0 
          }}>
            {message}
          </p>

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
              {cancelLabel}
            </button>

            <button 
              onClick={onConfirm}
              style={{ 
                flex: 1, 
                background: isDangerous ? 'var(--error)' : 'linear-gradient(45deg, var(--accent-purple), var(--accent-blue))',
                border: 'none', 
                color: '#fff', 
                padding: '0.75rem', 
                borderRadius: '12px', 
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: isDangerous ? '0 0 15px rgba(255, 61, 0, 0.2)' : '0 0 15px rgba(0, 210, 255, 0.2)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
