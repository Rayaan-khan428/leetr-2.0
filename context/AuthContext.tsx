'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  getAuth, 
  onAuthStateChanged,
  signOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
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
  signout: () => Promise<void>
  getToken: () => Promise<string | undefined>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGithub: async () => { throw new Error('Not implemented') },
  signInWithGoogle: async () => { throw new Error('Not implemented') },
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
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthCookie(userCredential.user);
    await fetchUserData(userCredential.user);
    return userCredential.user;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthCookie(userCredential.user);
    await fetchUserData(userCredential.user);
    return userCredential.user;
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