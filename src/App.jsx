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

// Hardcoded player data
const initialPlayers = [
  { name: '김태우', tier: 'silver', preferredPositions: ['top', 'adc', 'jungle'] },
  { name: '임대원', tier: 'diamond', preferredPositions: ['support', 'adc', 'jungle', 'top', 'mid'] },
  { name: '이상훈', tier: 'silver', preferredPositions: ['adc', 'top'] },
  { name: '김동현', tier: 'bronze', preferredPositions: ['top', 'support'] },
  { name: '황희승', tier: 'emerald', preferredPositions: ['mid', 'support', 'adc', 'jungle'] },
  { name: '이찬준', tier: 'gold', preferredPositions: ['jungle', 'mid', 'adc'] },
  { name: '정준영', tier: 'platinum', preferredPositions: ['jungle', 'top', 'support', 'adc', 'mid'] },
  { name: '박동선', tier: 'gold', preferredPositions: ['jungle', 'mid', 'adc'] },
  { name: '강정훈', tier: 'bronze', preferredPositions: ['support', 'top', 'mid'] },
  { name: '구교준', tier: 'bronze', preferredPositions: ['top', 'mid', 'support', 'adc', 'jungle'] },
  { name: '김병호', tier: 'silver', preferredPositions: ['jungle', 'top', 'adc'] },
  { name: '이규빈', tier: 'silver', preferredPositions: ['support', 'adc', 'top', 'jungle', 'mid'] },
  { name: '이종혁', tier: 'bronze', preferredPositions: ['jungle'] },
  { name: '박진현', tier: 'silver', preferredPositions: ['support', 'adc', 'top'] },
  { name: '스펜서', tier: 'silver', preferredPositions: ['top', 'mid', 'support', 'adc'] },
  { name: '구본근', tier: 'diamond', preferredPositions: ['top', 'jungle', 'mid', 'adc', 'support'] }, // 올포지션
  { name: '권예창', tier: 'gold', preferredPositions: ['jungle', 'support'] },
  { name: '조관중', tier: 'bronze', preferredPositions: ['top', 'support', 'mid', 'jungle', 'adc'] },
  { name: '심재원', tier: 'silver', preferredPositions: ['top'] },
  { name: '박성현', tier: 'diamond', preferredPositions: ['mid', 'top', 'jungle', 'support', 'adc'] },
  { name: '정의건', tier: 'bronze', preferredPositions: ['support', 'top'] },
  { name: '정한용', tier: 'master+', preferredPositions: ['jungle', 'adc', 'top', 'mid', 'support'] },
  { name: '이한슬', tier: 'master+', preferredPositions: ['mid', 'adc'] },
  { name: '정호원', tier: 'gold', preferredPositions: ['top', 'support', 'mid'] },
  { name: '김재현', tier: 'diamond', preferredPositions: ['mid', 'jungle', 'top'] },
  { name: '강민', tier: 'diamond', preferredPositions: ['support', 'adc', 'top', 'jungle', 'mid'] },
  { name: '추지웅', tier: 'bronze', preferredPositions: ['adc', 'mid', 'top', 'jungle', 'support'] },
  { name: '문호빈', tier: 'bronze', preferredPositions: ['support', 'jungle', 'top'] },
  { name: '윤수열', tier: 'iron', preferredPositions: ['support', 'top'] },
].map((p, i) => ({ ...p, id: 1000 + i, timestamp: new Date().toISOString() }));

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