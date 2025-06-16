import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhAMCyWo9EJ6q-5D1uvb6zjD0s6xR93mg",
  authDomain: "league-team-selector.firebaseapp.com",
  projectId: "league-team-selector",
  storageBucket: "league-team-selector.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider }; 