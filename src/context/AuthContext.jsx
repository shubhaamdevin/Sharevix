import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isMock } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

import { motion } from 'framer-motion';

const PremiumLoader = () => (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: '#090a0f', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', zIndex: 99999,
    overflow: 'hidden'
  }}>
    {/* Floating background glowing blobs */}
    <div className="blob blob-1" style={{ opacity: 0.15, transform: 'translate(-50%, -50%)' }}></div>
    <div className="blob blob-2" style={{ opacity: 0.15, transform: 'translate(50%, 50%)' }}></div>
    
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', zIndex: 10 }}
    >
      {/* Animated Glowing Ring */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            border: '4px solid rgba(255, 255, 255, 0.03)',
            borderTop: '4px solid var(--accent-blue)',
            borderRight: '4px solid var(--accent-purple)',
            boxShadow: '0 0 20px rgba(0, 210, 255, 0.3)'
          }}
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '15%', left: '15%',
            width: '70%', height: '70%',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, var(--accent-blue), var(--accent-purple))',
            filter: 'blur(10px)',
            zIndex: -1
          }}
        />
      </div>
      
      {/* Glowing Text */}
      <motion.h2 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        style={{
          fontSize: '1.5rem', fontWeight: 800,
          background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '0.15em'
        }}
      >
        SHAREVIX
      </motion.h2>
    </motion.div>
  </div>
);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define Admin Email for role checking
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@sharevix.com';

  useEffect(() => {
    // Explicitly set browser local persistence to prevent session logout on browser close
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error("Auth persistence error:", err);
    });

    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        // Restore connections from Firestore to localStorage on login
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.connections) {
              Object.entries(userData.connections).forEach(([key, val]) => {
                if (val === null) {
                  localStorage.removeItem(key);
                } else if (typeof val === 'object') {
                  localStorage.setItem(key, JSON.stringify(val));
                } else {
                  localStorage.setItem(key, String(val));
                }
              });
              // Dispatch to update active accounts in components
              window.dispatchEvent(new CustomEvent('accounts-updated'));
            }
          }
        } catch (err) {
          console.warn("Failed to load user connections from Firestore:", err);
        }

        setCurrentUser({ ...user, isAdmin: user.email === adminEmail });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleAccountsUpdated = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const keys = [
            'connectedAccounts',
            'fb_available_pages',
            'fb_page_id',
            'fb_page_name',
            'fb_access_token',
            'facebook_username',
            'ig_business_account_id',
            'instagram_username',
            'threads_username',
            'threads_access_token',
            'threads_user_id',
            'youtube_channel_id',
            'youtube_channel_name',
            'youtube_access_token',
            'youtube_username',
            'youtube_subscribers'
          ];
          const connections = {};
          keys.forEach(key => {
            const val = localStorage.getItem(key);
            if (val !== null) {
              try {
                connections[key] = JSON.parse(val);
              } catch (e) {
                connections[key] = val;
              }
            } else {
              connections[key] = null;
            }
          });

          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await updateDoc(doc(db, "users", user.uid), {
            connections: connections
          });
          console.log("Successfully synced connections to Firestore");
        } catch (err) {
          console.error("Failed to sync connections to Firestore:", err);
        }
      }
    };

    window.addEventListener('accounts-updated', handleAccountsUpdated);
    return () => {
      window.removeEventListener('accounts-updated', handleAccountsUpdated);
    };
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email, password) => {
    // Real Firebase Auth signup
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Write user profile to Firestore
    const { setDoc, doc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    await setDoc(doc(db, "users", user.uid), {
      name: user.email.split('@')[0],
      email: user.email,
      role: user.email === adminEmail ? 'admin' : 'user',
      status: 'active',
      posts: 0,
      joined: new Date().toISOString().split('T')[0]
    });
    
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check/Write user profile to Firestore
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase');
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        role: user.email === adminEmail ? 'admin' : 'user',
        status: 'active',
        posts: 0,
        joined: new Date().toISOString().split('T')[0]
      });
    }

    return result;
  };

  const logout = async () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    isAdmin: currentUser?.isAdmin || false
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PremiumLoader /> : children}
    </AuthContext.Provider>
  );
}
