import React, { useState, useEffect } from 'react';
import { Users, Trophy, Settings, Plus, Trash2, Shuffle } from 'lucide-react';
import PlayerForm from './components/PlayerForm';
import PlayerList from './components/PlayerList';
import TeamDisplay from './components/TeamDisplay';
import { distributeTeams, validateTeamDistribution } from './utils/teamDistribution';
import { savePlayers, loadPlayers, clearPlayers } from './utils/storage';

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

// Normalize all preferredPositions in initialPlayers
const initialPlayers = [
  { name: '김태우', tier: 'silver', preferredPositions: ['탑', '원딜', '정글'] },
  { name: '임대원', tier: 'diamond', preferredPositions: ['서폿', '원딜', '정글', '탑', '미드'] },
  { name: '이상훈', tier: 'silver', preferredPositions: ['원딜', '탑'] },
  { name: '김동현', tier: 'bronze', preferredPositions: ['탑', '서폿'] },
  { name: '황희승', tier: 'emerald', preferredPositions: ['미드', '서폿', '원딜', '정글'] },
  { name: '이찬준', tier: 'gold', preferredPositions: ['정글', '미드', '원딜'] },
  { name: '정준영', tier: 'platinum', preferredPositions: ['정글', '탑', '서폿', '원딜', '미드'] },
  { name: '박동선', tier: 'gold', preferredPositions: ['정글', '미드', '원딜'] },
  { name: '강정훈', tier: 'bronze', preferredPositions: ['서폿', '탑', '미드'] },
  { name: '구교준', tier: 'bronze', preferredPositions: ['탑', '미드', '서폿', '원딜', '정글'] },
  { name: '김병호', tier: 'silver', preferredPositions: ['정글', '탑', '원딜'] },
  { name: '이규빈', tier: 'silver', preferredPositions: ['서폿', '원딜', '탑', '정글', '미드'] },
  { name: '이종혁', tier: 'bronze', preferredPositions: ['정글'] },
  { name: '박진현', tier: 'silver', preferredPositions: ['서폿', '원딜', '탑'] },
  { name: '스펜서', tier: 'silver', preferredPositions: ['탑', '미드', '서폿', 'Adc'] },
  { name: '구본근', tier: 'diamond', preferredPositions: ['올포지션'] }, // 올포지션
  { name: '권예창', tier: 'gold', preferredPositions: ['정글', '서폿'] },
  { name: '조관중', tier: 'bronze', preferredPositions: ['탑', '서폿', '미드', '정글', '원딜'] },
  { name: '심재원', tier: 'silver', preferredPositions: ['탑'] },
  { name: '박성현', tier: 'diamond', preferredPositions: ['미드', '탑', '정글', '서폿', 'adc'] },
  { name: '정의건', tier: 'bronze', preferredPositions: ['서폿', '탑'] },
  { name: '정한용', tier: 'master+', preferredPositions: ['정글', '원딜', '탑', '미드', '서폿'] },
  { name: '이한슬', tier: 'master+', preferredPositions: ['미드', '원딜'] },
  { name: '정호원', tier: 'gold', preferredPositions: ['탑', '서폿', '미드'] },
  { name: '김재현', tier: 'diamond', preferredPositions: ['미드', '정글', '탑'] },
  { name: '강민', tier: 'diamond', preferredPositions: ['서폿', '원딜', '탑', '정글', '미드'] },
  { name: '추지웅', tier: 'bronze', preferredPositions: ['원딜', '미드', '탑', '정글', '서폿'] },
  { name: '문호빈', tier: 'bronze', preferredPositions: ['서폿', '정글', '탑'] },
  { name: '윤수열', tier: 'iron', preferredPositions: ['서폿', '탑'] },
].map((p, i) => ({
  ...p,
  preferredPositions: p.preferredPositions.flatMap(pos => {
    if (Array.isArray(posMap[pos])) return posMap[pos];
    return [normalizePosition(pos)];
  }),
  id: 1000 + i,
  timestamp: new Date().toISOString(),
}));

function App() {
  // Use hardcoded players as initial state
  const [players, setPlayers] = useState(() => {
    // If localStorage has players, use them; otherwise, use initialPlayers
    const savedPlayers = loadPlayers();
    return savedPlayers.length > 0 ? savedPlayers : initialPlayers;
  });
  const [teams, setTeams] = useState([]);
  const [teamsCount, setTeamsCount] = useState(2);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('players');

  // Save players to localStorage whenever players change
  useEffect(() => {
    savePlayers(players);
  }, [players]);

  const addPlayer = (player) => {
    const newPlayer = {
      ...player,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const removePlayer = (playerId) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const clearAllPlayers = () => {
    setPlayers([]);
    clearPlayers();
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

  const maxTeams = Math.floor(players.length / 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lol-blue via-gray-900 to-lol-blue text-lol-light">
      <div className="container mx-auto px-4 py-8">
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
              <Users size={20} />
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
              <Trophy size={20} />
              <span>Teams ({teams.length})</span>
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                showAdvanced
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Settings size={20} />
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
                <Plus className="mr-2" size={24} />
                Add Player
              </h2>
              <PlayerForm onAddPlayer={addPlayer} showAdvanced={showAdvanced} />
            </div>

            {/* Player List */}
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-lol-gold flex items-center">
                  <Users className="mr-2" size={24} />
                  Players ({players.length}/30)
                </h2>
                {players.length > 0 && (
                  <button
                    onClick={clearAllPlayers}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
              <PlayerList players={players} onRemovePlayer={removePlayer} />
            </div>

            {/* Generate Teams Section */}
            {players.length >= 10 && (
              <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
                <h2 className="text-2xl font-semibold text-lol-gold mb-4 flex items-center">
                  <Shuffle className="mr-2" size={24} />
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
                  <Shuffle size={20} />
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
                  <Trophy className="mr-2" size={24} />
                  Generated Teams
                </h2>
                {teams.length > 0 && (
                  <button
                    onClick={generateTeams}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 transition-colors"
                  >
                    <Shuffle size={16} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
              <TeamDisplay teams={teams} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App; 