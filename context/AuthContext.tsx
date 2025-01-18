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

interface User extends FirebaseUser {
  token?: string
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

  const createUserInDatabase = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        })
      });

      if (response.status === 409) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create user in database: ${errorData.error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in createUserInDatabase:', error);
    }
  };

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthCookie(userCredential.user);
    await createUserInDatabase(userCredential.user);
    return userCredential.user;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await setAuthCookie(userCredential.user);
    await createUserInDatabase(userCredential.user);
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
        const token = await firebaseUser.getIdToken()
        setUser({ ...firebaseUser, token })
        await setAuthCookie(firebaseUser)
      } else {
        setUser(null)
        await setAuthCookie(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

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