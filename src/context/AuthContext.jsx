import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch extra user details from Firestore (/users collection)
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not create record
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const initialProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Market Arena User',
          email: user.email,
          whatsappNumber: '',
          location: 'UNICAL',
          isVerified: false,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      } else {
        setUserProfile(userSnap.data());
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Email / Password Signup
  const signup = async (email, password, displayName, whatsappNumber, location) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const initialProfile = {
      uid: user.uid,
      displayName,
      email,
      whatsappNumber,
      location,
      isVerified: false,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), initialProfile);
    setUserProfile(initialProfile);
    return user;
  };

  // Email / Password Login
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout
  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Update name, WhatsApp number or location of the logged-in user
  const updateUserProfile = async (data) => {
    if (!auth.currentUser) throw new Error('Not logged in');
    await updateDoc(doc(db, 'users', auth.currentUser.uid), data);
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  // Send password reset email
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signInWithGoogle,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);