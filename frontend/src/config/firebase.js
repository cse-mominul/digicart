import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdo2Fz-ym6Ue8kMq3LBLtQp30IgHOfrKA",
  authDomain: "e-kinun.firebaseapp.com",
  projectId: "e-kinun",
  storageBucket: "e-kinun.firebasestorage.app",
  messagingSenderId: "911231966194",
  appId: "1:911231966194:web:68b96bfb2ca6a1abd7e96b",
  measurementId: "G-4FXK3S9WGM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
