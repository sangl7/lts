import React, { useState, useEffect } from 'react';
import { Users, Trophy, Settings, Plus, Trash2, Shuffle } from 'lucide-react';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import TeamDisplay from './components/TeamDisplay';
import { distributeTeams, validateTeamDistribution } from './utils/teamDistribution';
import { savePlayers, loadPlayers, clearPlayers } from './utils/storage';
import AuthPage from './AuthPage';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getPlayers, addPlayer, updatePlayer, deletePlayer, saveFinalizedTeams, getFinalizedTeams, resetFinalizedTeams } from './utils/firestore';
import { initialPlayers } from './initialPlayers';

// Mapping for Korean to English tiers and positions
const tierMap = {
  '아이언': 'iron',
  '브론즈': 'bronze',
  '실버': 'silver',
  '실버1': 'silver',
  '골드': 'gold',
  '플레': 'platinum',
  '플레티넘': 'platinum',
  '에메랄드': 'emerald',
  '다이아': 'diamond',
  '다이아몬드3': 'diamond',
  '마스터': 'master+',
};
const posMap = {
  '탑': 'top',
  '정글': 'jungle',
  '미드': 'mid',
  '원딜': 'adc',
  'Adc': 'adc',
  '서폿': 'support',
  '올포지션': ['top', 'jungle', 'mid', 'adc', 'support'],
};

// Helper to normalize a position to English code
function normalizePosition(pos) {
  if (!pos) return '';
  if (typeof pos !== 'string') return pos;
  const lower = pos.trim().toLowerCase();
  if (lower === 'adc') return 'adc';
  // Map Korean and other variants
  if (posMap[pos]) return Array.isArray(posMap[pos]) ? posMap[pos][0] : posMap[pos];
  // Try to match by lowercased English
  if (['top', 'jungle', 'mid', 'adc', 'support'].includes(lower)) return lower;
  return pos;
}

function EditPlayerModal({ player, onSave, onClose }) {
  const [form, setForm] = useState({
    preferredPositions: player.preferredPositions || [],
    advancedTiers: player.advancedTiers || {},
    tier: player.tier || '',
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (idx, value) => {
    const newPositions = [...form.preferredPositions];
    newPositions[idx] = value;
    setForm(prev => ({ ...prev, preferredPositions: newPositions }));
  };

  const handleAdvancedTierChange = (position, value) => {
    setForm(prev => ({
      ...prev,
      advancedTiers: { ...prev.advancedTiers, [position]: value },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...player, ...form });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-lol-gold">Edit Player: {player.name}</h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Preferred Positions</label>
          {form.preferredPositions.map((pos, idx) => (
            <select
              key={idx}
              value={pos}
              onChange={e => handlePositionChange(idx, e.target.value)}
              className="w-full mb-2 bg-gray-700 text-white rounded px-2 py-1"
            >
              {['top', 'jungle', 'mid', 'adc', 'support'].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Main Tier</label>
          <select
            value={form.tier}
            onChange={e => handleChange('tier', e.target.value)}
            className="w-full bg-gray-700 text-white rounded px-2 py-1"
          >
            {['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master+'].map(tier => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Advanced Tiers (optional)</label>
          {['top', 'jungle', 'mid', 'adc', 'support'].map(position => (
            <div key={position} className="mb-2">
              <span className="text-gray-400 mr-2">{position}</span>
              <select
                value={form.advancedTiers[position] || ''}
                onChange={e => handleAdvancedTierChange(position, e.target.value)}
                className="bg-gray-700 text-white rounded px-2 py-1"
              >
                <option value="">Use main tier</option>
                {['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master+'].map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-lol-gold text-lol-blue rounded font-bold">Save</button>
        </div>
      </form>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlayer, setEditPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamsCount, setTeamsCount] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  const [finalized, setFinalized] = useState(null);
  const [finalizedLoading, setFinalizedLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getPlayers().then(players => {
        setPlayers(players);
        setLoading(false);
      });
      setFinalizedLoading(true);
      getFinalizedTeams().then(data => {
        setFinalized(data && data.teams && data.teams.length > 0 ? data : null);
        setFinalizedLoading(false);
      });
    }
  }, [user]);

  const handleAddPlayer = async (player) => {
    await addPlayer(player);
    const updated = await getPlayers();
    setPlayers(updated);
  };

  const handleRemovePlayer = async (playerId) => {
    await deletePlayer(playerId);
    const updated = await getPlayers();
    setPlayers(updated);
  };

  const handleEditPlayer = (player) => {
    setEditPlayer(player);
  };

  const handleSaveEdit = async (updatedPlayer) => {
    await updatePlayer(updatedPlayer.id, updatedPlayer);
    setEditPlayer(null);
    const updated = await getPlayers();
    setPlayers(updated);
  };

  const clearAllPlayers = async () => {
    for (const player of players) {
      await deletePlayer(player.id);
    }
    setPlayers([]);
    setTeams([]);
  };

  const generateTeams = () => {
    const validation = validateTeamDistribution(players, teamsCount);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
    const distributedTeams = distributeTeams(players, teamsCount);
    setTeams(distributedTeams);
    setActiveTab('teams');
  };

  const handleFinalizeTeams = async () => {
    await saveFinalizedTeams(teams, user);
    setFinalized({ teams, finalizedAt: new Date().toISOString(), finalizedBy: user?.email });
  };

  const handleResetFinalized = async () => {
    await resetFinalizedTeams();
    setFinalized(null);
    setTeams([]);
    setActiveTab('players');
  };

  const maxTeams = Math.floor(players.length / 5);

  if (!user) {
    return <AuthPage onAuth={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lol-blue via-gray-900 to-lol-blue text-lol-light">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <button onClick={() => signOut(auth)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded">Sign Out</button>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-lol-gold mb-2">
            League of Legends Team Distributor
          </h1>
          <p className="text-gray-300">
            Create fair and balanced teams for your League games
          </p>
        </div>
        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'players'
                  ? 'bg-lol-gold text-lol-blue font-semibold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Players ({players.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                activeTab === 'teams'
                  ? 'bg-lol-gold text-lol-blue font-semibold'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Teams ({finalized ? (finalized.teams ? finalized.teams.length : 0) : teams.length})</span>
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                showAdvanced
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Advanced</span>
            </button>
          </div>
        </div>
        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="space-y-8">
            {/* Add Player Form */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-lol-gold mb-4 flex items-center">
                Add Player
              </h2>
              <PlayerForm onAddPlayer={handleAddPlayer} showAdvanced={showAdvanced} />
            </div>
            {/* Player List */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-lol-gold flex items-center">
                  Players ({players.length}/30)
                </h2>
                {players.length > 0 && (
                  <button
                    onClick={clearAllPlayers}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <span>Clear All</span>
                  </button>
                )}
              </div>
              {loading ? (
                <div className="text-gray-400">Loading players...</div>
              ) : (
                <PlayerList players={players} onRemovePlayer={handleRemovePlayer} onEditPlayer={handleEditPlayer} />
              )}
            </div>
            {/* Generate Teams Section */}
            {!finalized && players.length >= 10 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-lol-gold mb-4 flex items-center">
                  Generate Teams
                </h2>
                <div className="flex items-center space-x-4 mb-4">
                  <label className="text-gray-300">Number of teams:</label>
                  <select
                    value={teamsCount}
                    onChange={(e) => setTeamsCount(parseInt(e.target.value))}
                    className="bg-gray-700 text-white rounded-md px-3 py-2"
                  >
                    {Array.from({ length: maxTeams }, (_, i) => i + 2).map(num => (
                      <option key={num} value={num}>{num} teams</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={generateTeams}
                  className="bg-lol-gold hover:bg-yellow-600 text-lol-blue font-semibold px-6 py-3 rounded-md flex items-center space-x-2 transition-colors"
                >
                  <span>Generate Fair Teams</span>
                </button>
              </div>
            )}
          </div>
        )}
        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-lol-gold flex items-center">
                  Generated Teams
                </h2>
                {finalized && (
                  <div className="text-sm text-green-400">Finalized by {finalized.finalizedBy} at {finalized.finalizedAt && new Date(finalized.finalizedAt).toLocaleString()}</div>
                )}
                {!finalized && teams.length > 0 && (
                  <button
                    onClick={handleFinalizeTeams}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <span>Finalize Teams</span>
                  </button>
                )}
                {finalized && (
                  <button
                    onClick={handleResetFinalized}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ml-4"
                  >
                    <span>Reset Teams</span>
                  </button>
                )}
              </div>
              <TeamDisplay teams={finalized ? finalized.teams : teams} />
              {finalized && (
                <div className="text-yellow-400 mt-4">Teams are finalized and locked. Click Reset Teams to allow new team generation.</div>
              )}
            </div>
          </div>
        )}
        {editPlayer && (
          <EditPlayerModal
            player={editPlayer}
            onSave={handleSaveEdit}
            onClose={() => setEditPlayer(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App; 