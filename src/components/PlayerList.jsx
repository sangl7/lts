import React from 'react';
import { Trash2, User } from 'lucide-react';

function PlayerList({ players, onRemovePlayer }) {
  const getTierColor = (tier) => {
    const colors = {
      iron: 'text-gray-400 bg-gray-800',
      bronze: 'text-amber-700 bg-amber-100',
      silver: 'text-gray-300 bg-gray-200',
      gold: 'text-yellow-400 bg-yellow-100',
      platinum: 'text-cyan-400 bg-cyan-100',
      emerald: 'text-green-400 bg-green-100',
      diamond: 'text-blue-400 bg-blue-100',
      'master+': 'text-purple-400 bg-purple-100'
    };
    return colors[tier] || 'text-gray-300 bg-gray-200';
  };

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

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <User size={48} className="mx-auto mb-4 opacity-50" />
        <p>No players added yet. Add some players to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {players.map(player => (
        <div
          key={player.id}
          className="bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-lol-gold rounded-full flex items-center justify-center">
                <User size={20} className="text-lol-blue" />
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(player.tier)}`}>
                  {player.tier.charAt(0).toUpperCase() + player.tier.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1">
                <div className="text-sm text-gray-300">
                  <span className="text-gray-400">Preferred:</span>{' '}
                  {player.preferredPositions ? (
                    player.preferredPositions.map(pos => pos.charAt(0).toUpperCase() + pos.slice(1)).join(' > ')
                  ) : (
                    player.preferredPosition?.charAt(0).toUpperCase() + player.preferredPosition?.slice(1)
                  )}
                </div>
                
                {player.advancedTiers && Object.keys(player.advancedTiers).length > 0 && (
                  <div className="text-xs text-gray-400">
                    <span>Advanced tiers set</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onRemovePlayer(player.id)}
            className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-900 rounded-md transition-colors"
            title="Remove player"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default PlayerList; 