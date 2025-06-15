import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

const TIERS = ['iron', 'bronze', 'silver', 'gold', 'platinum', 'emerald', 'diamond', 'master+'];
const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'];

function PlayerForm({ onAddPlayer, showAdvanced }) {
  const [formData, setFormData] = useState({
    name: '',
    tier: 'gold',
    preferredPositions: ['mid', 'top', 'jungle', 'adc', 'support'],
    advancedTiers: {}
  });

  // Swapping logic for position preferences
  const handlePositionPreferenceChange = (index, value) => {
    setFormData(prev => {
      const newPrefs = [...prev.preferredPositions];
      const currentValue = newPrefs[index];
      const swapIndex = newPrefs.findIndex((pos, i) => pos === value && i !== index);
      if (swapIndex !== -1) {
        // Swap the values
        newPrefs[swapIndex] = currentValue;
      }
      newPrefs[index] = value;
      return { ...prev, preferredPositions: newPrefs };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a player name');
      return;
    }
    if (new Set(formData.preferredPositions).size !== 5) {
      alert('Please select a unique position for each preference.');
      return;
    }
    onAddPlayer({
      ...formData,
      name: formData.name.trim(),
    });
    // Reset form
    setFormData({
      name: '',
      tier: 'gold',
      preferredPositions: ['mid', 'top', 'jungle', 'adc', 'support'],
      advancedTiers: {}
    });
  };

  const handleAdvancedTierChange = (position, tier) => {
    setFormData(prev => ({
      ...prev,
      advancedTiers: {
        ...prev.advancedTiers,
        [position]: tier
      }
    }));
  };

  const getTierColor = (tier) => {
    const colors = {
      iron: 'text-gray-400',
      bronze: 'text-amber-700',
      silver: 'text-gray-300',
      gold: 'text-yellow-400',
      platinum: 'text-cyan-400',
      emerald: 'text-green-400',
      diamond: 'text-blue-400',
      'master+': 'text-purple-400'
    };
    return colors[tier] || 'text-gray-300';
  };

  // For each dropdown, exclude already selected positions in other dropdowns
  const getAvailablePositions = (index) => {
    return POSITIONS.filter(pos =>
      formData.preferredPositions[index] === pos ||
      !formData.preferredPositions.includes(pos)
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-lol-gold focus:outline-none"
            placeholder="Enter player name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Main Tier
          </label>
          <select
            value={formData.tier}
            onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
            className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-lol-gold focus:outline-none"
          >
            {TIERS.map(tier => (
              <option key={tier} value={tier} className={getTierColor(tier)}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Position Preferences (always visible) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Position Preferences (in order)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {formData.preferredPositions.map((pos, idx) => (
            <div key={idx}>
              <label className="block text-xs text-gray-400 mb-1">
                Preferred Position {idx + 1}
              </label>
              <select
                value={pos}
                onChange={e => handlePositionPreferenceChange(idx, e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md px-2 py-2 focus:ring-2 focus:ring-lol-gold focus:outline-none"
              >
                {POSITIONS.map(option => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-4 border-t border-gray-600 pt-4">
          <h3 className="text-lg font-semibold text-lol-gold">Advanced Settings</h3>
          {/* Position-Specific Tiers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Position-Specific Tiers (optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POSITIONS.map(position => (
                <div key={position} className="bg-gray-700 rounded-md p-3">
                  <label className="block text-xs text-gray-400 mb-1 capitalize">
                    {position}
                  </label>
                  <select
                    value={formData.advancedTiers[position] || ''}
                    onChange={(e) => handleAdvancedTierChange(position, e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-lol-gold focus:outline-none"
                  >
                    <option value="">Use main tier</option>
                    {TIERS.map(tier => (
                      <option key={tier} value={tier} className={getTierColor(tier)}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-lol-gold hover:bg-yellow-600 text-lol-blue font-semibold py-3 px-4 rounded-md flex items-center justify-center space-x-2 transition-colors"
      >
        <UserPlus size={20} />
        <span>Add Player</span>
      </button>
    </form>
  );
}

export default PlayerForm; 