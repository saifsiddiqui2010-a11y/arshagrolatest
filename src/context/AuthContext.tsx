import React, { createContext, useContext, useState, useEffect } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseAuthProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { User, Address } from '../types';
import { api } from '../services/api';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  handleFirestoreError,
  OperationType 
} from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (name: string, phone: string) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<boolean>;
  quickLoginAs: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORE_ADMIN_EMAILS = new Set([
  'saif.siddiqui2010@gmail.com',
  'admin@arshagroindustry.com',
  'arshagroindustry@gmail.com',
]);

const isStoreAdminEmail = (email?: string | null) =>
  email !== null && email !== undefined && STORE_ADMIN_EMAILS.has(email.toLowerCase());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isStoreAdmin = isStoreAdminEmail(firebaseUser.email);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const loadedUser: User = {
              id: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'Customer',
              email: firebaseUser.email || data.email || '',
              phone: data.phone || firebaseUser.phoneNumber || '',
              role: isStoreAdmin ? 'admin' : (data.role || 'user'),
              avatar: data.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || 'Customer')}`,
              addresses: data.addresses || [],
              createdAt: data.createdAt || new Date().toISOString()
            };
            setUser(loadedUser);
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('arsh_token', idToken);
            localStorage.setItem('arsh_user', JSON.stringify(loadedUser));
          } else {
            // New user registration in Firestore
            const newUser: User = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'Valued Customer',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              role: isStoreAdmin ? 'admin' : 'user',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'Customer')}`,
              addresses: [],
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
            const idToken = await firebaseUser.getIdToken();
            setToken(idToken);
            localStorage.setItem('arsh_token', idToken);
            localStorage.setItem('arsh_user', JSON.stringify(newUser));
          }
        } catch (error) {
          console.warn('[Firebase Auth] Falling back to cached session:', error);
          loadCachedSession();
        }
      } else {
        loadCachedSession();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadCachedSession = () => {
    try {
      const savedUser = localStorage.getItem('arsh_user');
      const savedToken = localStorage.getItem('arsh_token');
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
  };

  const persistSession = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('arsh_user', JSON.stringify(userData));
    localStorage.setItem('arsh_token', authToken);
  };

  const persistFirebaseUser = async (
    firebaseUser: FirebaseUser,
    fallbackName?: string,
    fallbackPhone?: string
  ) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userDocRef);
    const data = userSnap.exists() ? userSnap.data() : {};
    const name = data.name || firebaseUser.displayName || fallbackName || 'Valued Customer';
    const isStoreAdmin = isStoreAdminEmail(firebaseUser.email);
    const activeUser: User = {
      id: firebaseUser.uid,
      name,
      email: firebaseUser.email || data.email || '',
      phone: data.phone || firebaseUser.phoneNumber || fallbackPhone || '',
      role: isStoreAdmin ? 'admin' : (data.role || 'user'),
      avatar: data.avatar || firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      addresses: data.addresses || [],
      createdAt: data.createdAt || new Date().toISOString()
    };

    if (!userSnap.exists()) {
      await setDoc(userDocRef, activeUser);
    }

    persistSession(activeUser, await firebaseUser.getIdToken());
    return activeUser;
  };

  const getAuthErrorMessage = (error: unknown, action: 'login' | 'register') => {
    if (!(error instanceof FirebaseError)) {
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
    }

    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/weak-password':
        return 'Choose a stronger password with at least 6 characters.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Email or password is incorrect.';
      case 'auth/operation-not-allowed':
        return 'Email and password sign-in is not enabled for this project yet.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a while and try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        console.error(`[Firebase ${action} error]:`, error);
        return error.message || 'Authentication failed. Please try again.';
    }
  };

  // Google Sign-In with Firebase Auth
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userDocRef);

      const isStoreAdmin = isStoreAdminEmail(firebaseUser.email);

      let activeUser: User;
      if (userSnap.exists()) {
        const data = userSnap.data();
        activeUser = {
          id: firebaseUser.uid,
          name: data.name || firebaseUser.displayName || 'Customer',
          email: firebaseUser.email || data.email || '',
          phone: data.phone || '',
          role: isStoreAdmin ? 'admin' : (data.role || 'user'),
          avatar: data.avatar || firebaseUser.photoURL || '',
          addresses: data.addresses || [],
          createdAt: data.createdAt || new Date().toISOString()
        };
      } else {
        activeUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Valued Customer',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: isStoreAdmin ? 'admin' : 'user',
          avatar: firebaseUser.photoURL || '',
          addresses: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, activeUser);
      }

      const idToken = await firebaseUser.getIdToken();
      persistSession(activeUser, idToken);
      return { success: true };
    } catch (error) {
      console.error('[Firebase Google Login Error]:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Google sign-in was not completed.'
      };
    }
  };

  // Traditional Email/Password Auth
  const login = async (email: string, pass: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await persistFirebaseUser(credential.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: getAuthErrorMessage(error, 'login') };
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const normalizedName = name.trim();
      const normalizedPhone = phone?.trim() || '';
      await updateFirebaseAuthProfile(credential.user, { displayName: normalizedName });
      await persistFirebaseUser(credential.user, normalizedName, normalizedPhone);
      return { success: true };
    } catch (error) {
      return { success: false, message: getAuthErrorMessage(error, 'register') };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('arsh_user');
    localStorage.removeItem('arsh_token');
  };

  const updateProfile = async (name: string, phone: string) => {
    if (!user) return false;
    try {
      // Update in Firestore
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { name, phone });
      }

      // Also update in backend
      const res = await api.updateProfile(user.id, name, phone);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('arsh_user', JSON.stringify(res.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update profile error:', err);
      return false;
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return false;
    try {
      const res = await api.addAddress(user.id, address);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('arsh_user', JSON.stringify(res.user));

        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { addresses: res.user.addresses });
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return false;
    try {
      const res = await api.deleteAddress(user.id, addressId);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('arsh_user', JSON.stringify(res.user));

        if (auth.currentUser) {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { addresses: res.user.addresses });
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const quickLoginAs = async () => {
    await login('priya.sharma@example.com', 'customer123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        quickLoginAs,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
