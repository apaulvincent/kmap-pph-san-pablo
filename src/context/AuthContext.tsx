import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, logout as firebaseLogout, signInWithGoogle } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
          // Check role in Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
              const userData = userSnap.data();
              setIsAdmin(userData.role === 'admin');
          } else {
              // New user - created as 'guest'
              await setDoc(userRef, {
                  displayName: currentUser.displayName,
                  email: currentUser.email,
                  role: 'guest',
                  createdAt: new Date()
              });
              setIsAdmin(false);
          }
      } else {
          setIsAdmin(false);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await firebaseLogout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
