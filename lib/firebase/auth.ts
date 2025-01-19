import { getAuth } from "firebase-admin/auth";
import { app } from "./firebase-admin";

export const auth = getAuth(app); 