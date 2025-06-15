const STORAGE_KEY = 'lol-team-distributor-players';

// Save players to localStorage
export function savePlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Failed to save players to localStorage:', error);
  }
}

// Load players from localStorage
export function loadPlayers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load players from localStorage:', error);
    return [];
  }
}

// Clear all saved players
export function clearPlayers() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear players from localStorage:', error);
  }
} 