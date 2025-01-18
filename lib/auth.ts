import { auth as firebaseAuth } from "@/lib/firebase/auth";

export async function auth() {
  const currentUser = firebaseAuth.currentUser;
  
  if (!currentUser) {
    return null;
  }

  return {
    user: {
      id: currentUser.uid,
      email: currentUser.email,
      // Add other user properties you need
    }
  };
} 