'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  getAuth, 
  onAuthStateChanged,
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Cookies from 'js-cookie'

interface User {
  id: string;
  email: string | null;
  phoneNumber: string | null;
  phoneVerified: boolean;
  displayName?: string | null;
  photoURL?: string | null;
  token?: string;
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGithub: () => Promise<FirebaseUser>
  signInWithGoogle: () => Promise<FirebaseUser>
  signInWithEmail: (email: string, password: string) => Promise<FirebaseUser>
  signUpWithEmail: (email: string, password: string) => Promise<FirebaseUser>
  signout: () => Promise<void>
  getToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGithub: async () => { throw new Error('Not implemented') },
  signInWithGoogle: async () => { throw new Error('Not implemented') },
  signInWithEmail: async () => { throw new Error('Not implemented') },
  signUpWithEmail: async () => { throw new Error('Not implemented') },
  signout: async () => { throw new Error('Not implemented') },
  getToken: async () => { throw new Error('Not implemented') }
})

const setAuthCookie = async (user: FirebaseUser | null) => {
  if (user) {
    const token = await user.getIdToken()
    Cookies.set('auth_token', token, { 
      expires: 7,
      secure: true,
      sameSite: 'strict'
    })
  } else {
    Cookies.remove('auth_token')
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      return { 
        ...userData,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        token 
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await setAuthCookie(userCredential.user);
      
      // Create or fetch user data
      const token = await userCredential.user.getIdToken();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        })
      });

      if (!response.ok && response.status !== 409) { // 409 means user already exists
        throw new Error('Failed to create user');
      }

      const userData = await fetchUserData(userCredential.user);
      setUser(userData);
      
      return userCredential.user;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await setAuthCookie(userCredential.user);
      
      // Create or fetch user data
      const token = await userCredential.user.getIdToken();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        })
      });

      if (!response.ok && response.status !== 409) { // 409 means user already exists
        throw new Error('Failed to create user');
      }

      const userData = await fetchUserData(userCredential.user);
      setUser(userData);
      
      return userCredential.user;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setAuthCookie(userCredential.user);
      
      const userData = await fetchUserData(userCredential.user);
      setUser(userData);
      
      return userCredential.user;
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setAuthCookie(userCredential.user);
      
      // Create user data
      const token = await userCredential.user.getIdToken();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        })
      });

      if (!response.ok && response.status !== 409) {
        throw new Error('Failed to create user');
      }

      const userData = await fetchUserData(userCredential.user);
      setUser(userData);
      
      return userCredential.user;
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const signout = async () => {
    await signOut(auth)
    await setAuthCookie(null)
  }

  const getToken = async () => {
    return auth.currentUser?.getIdToken();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    signInWithGithub,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signout,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}