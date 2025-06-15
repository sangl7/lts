import React from 'react';
import { Trophy, Target, Star } from 'lucide-react';
import { getPlayerSkillValue, POSITIONS } from '../utils/teamDistribution';

function TeamDisplay({ teams }) {
  const getTierBadgeColor = (tier) => {
    const colors = {
      iron: 'bg-gray-600 text-gray-300',
      bronze: 'bg-amber-800 text-amber-200',
      silver: 'bg-gray-500 text-gray-100',
      gold: 'bg-yellow-600 text-yellow-100',
      platinum: 'bg-cyan-600 text-cyan-100',
      emerald: 'bg-green-600 text-green-100',
      diamond: 'bg-blue-600 text-blue-100',
      'master+': 'bg-purple-600 text-purple-100'
    };
    return colors[tier] || 'bg-gray-500 text-gray-100';
  };

  const getPositionIcon = (position) => {
    const icons = {
      top: '⚔️',
      jungle: '🌲',
      mid: '⭐',
      adc: '🏹',
      support: '🛡️'
    };
    return icons[position] || '❓';
  };

  const getPositionColor = (position) => {
    const colors = {
      top: 'bg-red-700 text-red-100',
      jungle: 'bg-green-700 text-green-100',
      mid: 'bg-blue-700 text-blue-100',
      adc: 'bg-orange-700 text-orange-100',
      support: 'bg-purple-700 text-purple-100'
    };
    return colors[position] || 'bg-gray-700 text-gray-100';
  };

  if (!teams || teams.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Trophy size={48} className="mx-auto mb-4 opacity-50" />
        <p>No teams generated yet. Add players and generate teams!</p>
      </div>
    );
  }

  // Calculate team balance statistics
  const avgSkill = teams.reduce((sum, team) => sum + team.averageSkill, 0) / teams.length;
  const skillVariance = teams.reduce((sum, team) => sum + Math.pow(team.averageSkill - avgSkill, 2), 0) / teams.length;
  const balanceScore = Math.max(0, 100 - skillVariance * 10);

  // Helper: get preference score (5 for 1st, 1 for 5th)
  const getPreferenceScore = (player, assignedPosition) => {
    const idx = (player.preferredPositions || []).indexOf(assignedPosition);
    return idx >= 0 ? 5 - idx : 0;
  };

  return (
    <div className="space-y-6">
      {/* Balance Statistics */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-lol-gold flex items-center">
            <Target className="mr-2" size={20} />
            Team Balance Analysis
          </h3>
          <div className="text-right">
            <div className="text-sm text-gray-300">Balance Score</div>
            <div className={`text-lg font-bold ${balanceScore >= 80 ? 'text-green-400' : balanceScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {balanceScore.toFixed(1)}/100
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Average Skill:</span>
            <span className="ml-2 text-white font-medium">{avgSkill.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-gray-400">Skill Range:</span>
            <span className="ml-2 text-white font-medium">
              {Math.min(...teams.map(t => t.averageSkill)).toFixed(1)} - {Math.max(...teams.map(t => t.averageSkill)).toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Teams:</span>
            <span className="ml-2 text-white font-medium">{teams.length}</span>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teams.map(team => {
          // Map positions to players for this team
          const positionToPlayer = {};
          team.players.forEach(player => {
            positionToPlayer[player.assignedPosition] = player;
          });
          // Calculate total team value (sum of skill values for assigned positions)
          const totalTeamValue = POSITIONS.reduce((sum, pos) => {
            const player = positionToPlayer[pos];
            return sum + (player ? getPlayerSkillValue(player, pos) : 0);
          }, 0);
          // Calculate total and average preference score
          const preferenceScores = POSITIONS.map(pos => {
            const player = positionToPlayer[pos];
            return player ? getPreferenceScore(player, pos) : 0;
          });
          const totalPrefScore = preferenceScores.reduce((a, b) => a + b, 0);
          const avgPrefScore = preferenceScores.length > 0 ? (totalPrefScore / preferenceScores.length) : 0;

          return (
            <div key={team.id} className="bg-gray-700 rounded-lg p-6 shadow-lg">
              {/* Team Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-lol-gold flex items-center">
                  <Trophy className="mr-2" size={20} />
                  Team {team.id}
                </h3>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Team Value</div>
                  <div className="text-lg font-bold text-white">{totalTeamValue}</div>
                  <div className="text-sm text-gray-400">
                    Avg: {team.averageSkill.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">Total Pref. Score: <span className="text-white font-bold">{totalPrefScore}</span></div>
                  <div className="text-sm text-gray-400">Avg Pref. Score: <span className="text-white font-bold">{avgPrefScore.toFixed(2)}</span></div>
                </div>
              </div>

              {/* Team Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-300 border-b border-gray-600">
                      <th className="py-2 pr-4">Position</th>
                      <th className="py-2 pr-4">Player</th>
                      <th className="py-2 pr-4">Tier for Position</th>
                      <th className="py-2 pr-4">Preferred?</th>
                      <th className="py-2 pr-4">Pref. Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {POSITIONS.map(pos => {
                      const player = positionToPlayer[pos];
                      if (!player) {
                        return (
                          <tr key={pos} className="bg-gray-800">
                            <td className="py-2 pr-4 capitalize">{pos}</td>
                            <td className="py-2 pr-4 text-gray-400 italic" colSpan={4}>No player assigned</td>
                          </tr>
                        );
                      }
                      const tierForPosition = player.advancedTiers && player.advancedTiers[pos] ? player.advancedTiers[pos] : player.tier;
                      const isPreferred = (player.preferredPositions || []).indexOf(pos) >= 0;
                      const isTopPreference = (player.preferredPositions || []).indexOf(pos) <= 1; // 0 or 1 (first or second)
                      const prefScore = getPreferenceScore(player, pos);
                      return (
                        <tr key={player.id} className="border-b border-gray-600">
                          <td className="py-2 pr-4 capitalize font-semibold">{pos}</td>
                          <td className="py-2 pr-4">
                            <span className="font-medium text-white">{player.name}</span>
                          </td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(tierForPosition)}`}>
                              {tierForPosition.charAt(0).toUpperCase() + tierForPosition.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 pr-4">
                            {isPreferred && (
                              <span className="inline-flex items-center">
                                {isTopPreference && <Star size={16} className="text-yellow-400 mr-1" />}<span className="text-gray-300">{isTopPreference ? 'Top' : 'Yes'}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 pr-4 font-bold text-lol-gold">{prefScore}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-lol-gold mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Star size={16} className="text-yellow-400" />
              <span className="text-gray-300">Player assigned to one of their top 2 preferences</span>
            </div>
            <div className="text-gray-400">
              The algorithm prioritizes fairness first, then position preferences.
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-gray-300 font-medium">Position Order:</div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">Top</div>
              <div className="text-center">Jungle</div>
              <div className="text-center">Mid</div>
              <div className="text-center">ADC</div>
              <div className="text-center">Support</div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-gray-400 text-xs">
          <span className="font-bold text-lol-gold">Pref. Score:</span> 5 = most preferred, 1 = least preferred
        </div>
      </div>
    </div>
  );
}

export default TeamDisplay; 