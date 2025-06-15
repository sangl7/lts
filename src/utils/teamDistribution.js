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

// Helper: count eligible players for each position
function countEligiblePlayers(players) {
  const counts = { top: 0, jungle: 0, mid: 0, adc: 0, support: 0 };
  for (const player of players) {
    for (const pos of player.preferredPositions || []) {
      if (counts[pos] !== undefined) counts[pos]++;
    }
  }
  return counts;
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

// Improved greedy algorithm: assign rarest positions first
function greedyTeamGeneration(players, teamsCount) {
  const teams = Array(teamsCount).fill().map(() => []);
  const positionAssignments = Array(teamsCount).fill().map(() => ({}));

  // Check if enough eligible players for each position
  const eligibleCounts = countEligiblePlayers(players);
  for (const pos of POSITIONS) {
    if (eligibleCounts[pos] < teamsCount) {
      throw new Error(`Not enough players for position ${pos.toUpperCase()} (${eligibleCounts[pos]} available, ${teamsCount} needed)`);
    }
  }

  // For each team, build a list of positions to fill, sorted by rarity (fewest eligible players first)
  const positionRarity = [...POSITIONS].sort((a, b) => eligibleCounts[a] - eligibleCounts[b]);
  const teamNeeds = Array(teamsCount).fill().map(() => [...positionRarity]);

  // Copy players and sort by flexibility (players with fewer preferences first), then by skill
  const sortedPlayers = [...players].sort((a, b) => {
    const flexA = (a.preferredPositions || []).length;
    const flexB = (b.preferredPositions || []).length;
    if (flexA !== flexB) return flexA - flexB;
    return TIERS[b.tier] - TIERS[a.tier];
  });

  // Assign players to teams/positions
  for (const player of sortedPlayers) {
    let bestTeam = -1;
    let bestPosition = null;
    let bestScore = -Infinity;

    // Try each team and their unfilled positions (in rarity order)
    for (let teamIndex = 0; teamIndex < teamsCount; teamIndex++) {
      if (teams[teamIndex].length >= 5) continue;
      for (const position of teamNeeds[teamIndex]) {
        if (!(player.preferredPositions || []).includes(position)) continue;
        if (positionAssignments[teamIndex][position]) continue;
        // Calculate score for this assignment
        const positionPreferenceIndex = (player.preferredPositions || []).indexOf(position);
        const positionScore = 10 - positionPreferenceIndex;
        const currentTeamSkill = calculateTeamSkill(teams[teamIndex]);
        const balanceScore = 100 - currentTeamSkill;
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
      // Remove assigned position from teamNeeds
      teamNeeds[bestTeam] = teamNeeds[bestTeam].filter(pos => pos !== bestPosition);
    }
  }
  return teams;
}

// Post-processing: swap players between teams to improve fairness
function improveFairness(teams) {
  const maxIterations = 100;
  let improved = true;
  let iteration = 0;
  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;
    // For each pair of teams
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const teamA = teams[i];
        const teamB = teams[j];
        // For each position
        for (const pos of POSITIONS) {
          const playerA = teamA.find(p => p.assignedPosition === pos);
          const playerB = teamB.find(p => p.assignedPosition === pos);
          if (!playerA || !playerB) continue;
          // Only swap if both players are eligible for the other's position
          if (
            (playerA.preferredPositions || []).includes(pos) &&
            (playerB.preferredPositions || []).includes(pos)
          ) {
            // Calculate team values before swap
            const valueA = calculateTeamSkill(teamA);
            const valueB = calculateTeamSkill(teamB);
            // Swap players
            const newTeamA = teamA.map(p =>
              p.assignedPosition === pos ? { ...playerB } : p
            );
            const newTeamB = teamB.map(p =>
              p.assignedPosition === pos ? { ...playerA } : p
            );
            const newValueA = calculateTeamSkill(newTeamA);
            const newValueB = calculateTeamSkill(newTeamB);
            // If swap improves fairness (reduces max-min difference), do it
            const oldDiff = Math.abs(valueA - valueB);
            const newDiff = Math.abs(newValueA - newValueB);
            if (newDiff < oldDiff) {
              teams[i] = newTeamA;
              teams[j] = newTeamB;
              improved = true;
            }
          }
        }
      }
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
    let teams = generateTeamCombinations(players, teamsCount);
    // Post-process to improve fairness
    teams = improveFairness(teams);
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