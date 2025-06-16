import React, { useEffect } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const ALLOWED_EMAILS = [
  "lsh0160@gmail.com",
  "moon.hojik@gmail.com",
  "wooya81@gmail.com",
  "ldslcj@gmail.com"
  // Add more allowed emails here
];

export default function AuthPage({ onAuth }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && ALLOWED_EMAILS.includes(user.email)) {
        onAuth(user);
      } else if (user) {
        alert("You are not authorized to access this app.");
        signOut(auth);
      }
    });
    return () => unsubscribe();
  }, [onAuth]);

  const handleSignIn = () => {
    signInWithPopup(auth, provider).catch((err) => {
      alert("Sign in failed: " + err.message);
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl mb-6">Sign in to use the Team Distributor</h1>
      <button
        onClick={handleSignIn}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg font-bold"
      >
        Sign in with Google
      </button>
    </div>
  );
} 