import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const db = getFirestore(app);
export const playersCollection = collection(db, "players");
const finalizedTeamsDoc = doc(db, "finalized_teams", "current");

export async function getPlayers() {
  const snapshot = await getDocs(playersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addPlayer(player) {
  return await addDoc(playersCollection, player);
}

export async function updatePlayer(id, data) {
  const playerRef = doc(db, "players", id);
  return await updateDoc(playerRef, data);
}

export async function setPlayer(id, data) {
  const playerRef = doc(db, "players", id);
  return await setDoc(playerRef, data);
}

export async function deletePlayer(id) {
  const playerRef = doc(db, "players", id);
  return await deleteDoc(playerRef);
}

// Finalized teams logic
export async function saveFinalizedTeams(teams, user) {
  return await setDoc(finalizedTeamsDoc, {
    teams,
    finalizedAt: new Date().toISOString(),
    finalizedBy: user?.email || null
  });
}

export async function getFinalizedTeams() {
  const docSnap = await getDoc(finalizedTeamsDoc);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function resetFinalizedTeams() {
  return await setDoc(finalizedTeamsDoc, {});
} 