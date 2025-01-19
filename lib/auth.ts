import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase/config";

export async function auth() {
  const auth = getAuth(app);
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return null;
  }

  return {
    user: {
      id: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
    }
  };
} 