'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth'
import { app } from '@/lib/firebase'

// Define the shape of your user object
interface User extends FirebaseUser {
  token?: string
}

// Define what your auth context will contain
interface AuthContextType {
  user: User | null
  loading: boolean
  signup: (email: string, password: string, displayName: string) => Promise<FirebaseUser>
  signin: (email: string, password: string) => Promise<FirebaseUser>
  signout: () => Promise<void>
}

// Create the context with a default value that matches your interface
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {
    throw new Error('Not implemented')
  },
  signin: async () => {
    throw new Error('Not implemented')
  },
  signout: async () => {
    throw new Error('Not implemented')
  }
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth(app)

  // This function creates a user in your database after Firebase authentication
  const createUserInDatabase = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      
      // Changed from '/api/users/create' to '/api/users'
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
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error details:', errorData);
        throw new Error(`Failed to create user in database: ${errorData.error}`);
      }
  
      const userData = await response.json();
      console.log('User created successfully:', userData);
      return userData;
    } catch (error) {
      console.error('Detailed error:', error);
      throw error;
    }
  };

  // Sign up function
  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update the user's profile with the display name
    await updateProfile(userCredential.user, { displayName })
    
    // Create the user in your database
    await createUserInDatabase(userCredential.user)
    
    return userCredential.user
  }

  // Sign in function
  const signin = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  }

  // Sign out function
  const signout = () => signOut(auth)

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token whenever auth state changes
        const token = await firebaseUser.getIdToken()
        setUser({ ...firebaseUser, token })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Cleanup subscription
    return unsubscribe
  }, [auth])

  const value = {
    user,
    loading,
    signup,
    signin,
    signout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Export the hook with proper typing
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}