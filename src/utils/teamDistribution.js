// League of Legends tier values for fair distribution
export const TIERS = {
  iron: 1,
  bronze: 2,
  silver: 3,
  gold: 4,
  platinum: 5,
  emerald: 6,
  diamond: 7,
  'master+': 8
};

export const POSITIONS = ['top', 'jungle', 'mid', 'adc', 'support'];

// Calculate player's skill value for a specific position
export function getPlayerSkillValue(player, position) {
  if (player.advancedTiers && player.advancedTiers[position]) {
    return TIERS[player.advancedTiers[position]];
  }
  return TIERS[player.tier];
}

// Calculate total team skill value
export function calculateTeamSkill(team) {
  return team.reduce((total, player) => {
    const position = player.assignedPosition;
    return total + getPlayerSkillValue(player, position);
  }, 0);
}

// Generate all possible team combinations
function generateTeamCombinations(players, teamsCount) {
  const playersPerTeam = 5;
  const totalPlayers = teamsCount * playersPerTeam;
  
  if (players.length < totalPlayers) {
    throw new Error(`Need at least ${totalPlayers} players for ${teamsCount} teams`);
  }

  // For now, we'll use a greedy approach for better performance
  // In a production app, you might want to use more sophisticated algorithms
  return greedyTeamGeneration(players.slice(0, totalPlayers), teamsCount);
}

// Greedy algorithm for team generation
function greedyTeamGeneration(players, teamsCount) {
  const teams = Array(teamsCount).fill().map(() => []);
  const positionAssignments = Array(teamsCount).fill().map(() => ({}));
  
  // Sort players by skill (highest first) for fair distribution
  const sortedPlayers = [...players].sort((a, b) => TIERS[b.tier] - TIERS[a.tier]);
  
  for (const player of sortedPlayers) {
    let bestTeam = -1;
    let bestPosition = null;
    let bestScore = -Infinity;
    
    // Try each team and position combination
    for (let teamIndex = 0; teamIndex < teamsCount; teamIndex++) {
      if (teams[teamIndex].length >= 5) continue;
      
      // Only consider positions the player actually listed
      for (const position of player.preferredPositions || [player.preferredPosition]) {
        if (!position) continue; // skip empty
        if (positionAssignments[teamIndex][position]) continue;
        
        // Calculate score for this assignment
        const positionPreferenceIndex = (player.preferredPositions || [player.preferredPosition]).indexOf(position);
        const positionScore = 10 - positionPreferenceIndex; // Higher score for preferred positions
        
        // Calculate team balance score (prefer teams with lower total skill)
        const currentTeamSkill = calculateTeamSkill(teams[teamIndex]);
        const balanceScore = 100 - currentTeamSkill; // Lower skill = higher score
        
        const totalScore = positionScore + balanceScore * 0.1;
        
        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestTeam = teamIndex;
          bestPosition = position;
        }
      }
    }
    
    // Assign player to best team and position
    if (bestTeam !== -1 && bestPosition) {
      const playerWithPosition = { ...player, assignedPosition: bestPosition };
      teams[bestTeam].push(playerWithPosition);
      positionAssignments[bestTeam][bestPosition] = true;
    }
  }
  
  return teams;
}

// Main function to distribute players into fair teams
export function distributeTeams(players, teamsCount = 2) {
  if (!players || players.length === 0) {
    return [];
  }
  
  try {
    const teams = generateTeamCombinations(players, teamsCount);
    
    // Calculate team statistics
    const teamsWithStats = teams.map((team, index) => ({
      id: index + 1,
      players: team,
      totalSkill: calculateTeamSkill(team),
      averageSkill: calculateTeamSkill(team) / team.length
    }));
    
    return teamsWithStats;
  } catch (error) {
    console.error('Error distributing teams:', error);
    return [];
  }
}

// Validate if team distribution is possible
export function validateTeamDistribution(players, teamsCount) {
  const requiredPlayers = teamsCount * 5;
  
  if (players.length < requiredPlayers) {
    return {
      valid: false,
      message: `Need at least ${requiredPlayers} players for ${teamsCount} teams. Currently have ${players.length} players.`
    };
  }
  
  if (players.length > 30) {
    return {
      valid: false,
      message: `Maximum 30 players allowed. Currently have ${players.length} players.`
    };
  }
  
  return { valid: true };
} 