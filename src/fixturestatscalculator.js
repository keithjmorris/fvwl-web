// fixtureStatsCalculator.js - Processes fixture data to calculate player statistics

export const calculatePlayerStats = (fixtures) => {
  const playerStats = {};

  fixtures.forEach(fixture => {
    // Process starting players
    for (let i = 1; i <= 11; i++) {
      const player = fixture[`starter${i}`];
      if (player && player.trim()) {
        if (!playerStats[player]) {
          playerStats[player] = {
            totalAppearances: 0,
            totalStarts: 0,
            totalSubstitutes: 0,
            completedMatches: 0,
            substitutedOff: 0,
            yellowCards: 0,
            redCards: 0
          };
        }
        
        playerStats[player].totalAppearances++;
        playerStats[player].totalStarts++;
        
        // Check if player was substituted off
        let wasSubstituted = false;
        for (let j = 1; j <= 5; j++) {
          if (fixture[`substitutedPlayer${j}`] === player) {
            wasSubstituted = true;
            playerStats[player].substitutedOff++;
            break;
          }
        }
        
        if (!wasSubstituted) {
          playerStats[player].completedMatches++;
        }
      }
    }
    
    // Process substitute players
    for (let i = 1; i <= 5; i++) {
      const player = fixture[`substitute${i}`];
      if (player && player.trim()) {
        if (!playerStats[player]) {
          playerStats[player] = {
            totalAppearances: 0,
            totalStarts: 0,
            totalSubstitutes: 0,
            completedMatches: 0,
            substitutedOff: 0,
            yellowCards: 0,
            redCards: 0
          };
        }
        
        playerStats[player].totalAppearances++;
        playerStats[player].totalSubstitutes++;
        // Substitutes always complete the match (can't be subbed off after coming on)
        playerStats[player].completedMatches++;
      }
    }
    
    // Process yellow cards
    for (let i = 1; i <= 6; i++) {
      const player = fixture[`yellowCard${i}`];
      if (player && player.trim()) {
        if (!playerStats[player]) {
          playerStats[player] = {
            totalAppearances: 0,
            totalStarts: 0,
            totalSubstitutes: 0,
            completedMatches: 0,
            substitutedOff: 0,
            yellowCards: 0,
            redCards: 0
          };
        }
        playerStats[player].yellowCards++;
      }
    }
    
    // Process red cards
    for (let i = 1; i <= 2; i++) {
      const player = fixture[`redCard${i}`];
      if (player && player.trim()) {
        if (!playerStats[player]) {
          playerStats[player] = {
            totalAppearances: 0,
            totalStarts: 0,
            totalSubstitutes: 0,
            completedMatches: 0,
            substitutedOff: 0,
            yellowCards: 0,
            redCards: 0
          };
        }
        playerStats[player].redCards++;
      }
    }
  });

  return playerStats;
};

export const formatPlayerStats = (playerStats) => {
  return Object.entries(playerStats).map(([playerName, stats]) => {
    // Parse name into forename/surname
    const nameParts = playerName.split(' ');
    let forename, surname;
    
    if (nameParts.length === 1) {
      forename = nameParts[0];
      surname = "";
    } else if (nameParts.length === 2) {
      forename = nameParts[0];
      surname = nameParts[1];
    } else {
      // Handle cases like "T. Sharman-Lowe" or "Mendes Gomes"
      if (nameParts[0].includes('.')) {
        forename = nameParts[0];
        surname = nameParts.slice(1).join(' ');
      } else {
        forename = nameParts[0];
        surname = nameParts.slice(1).join(' ');
      }
    }
    
    // Calculate percentages
    const starterPercentage = stats.totalAppearances > 0 ? 
      Math.round((stats.totalStarts / stats.totalAppearances) * 100) : 0;
    
    const completionRate = stats.totalStarts > 0 ? 
      Math.round((stats.completedMatches / stats.totalStarts) * 100) : 0;
    
    return {
      fullName: playerName,
      forename: forename.trim(),
      surname: surname.trim(),
      totalAppearances: stats.totalAppearances,
      totalStarts: stats.totalStarts,
      totalSubstitutes: stats.totalSubstitutes,
      completedMatches: stats.completedMatches,
      substitutedOff: stats.substitutedOff,
      starterPercentage,
      completionRate,
      totalCards: stats.yellowCards + stats.redCards,
      yellowCards: stats.yellowCards,
      redCards: stats.redCards
    };
  });
};

export const getAppearanceStats = (playerStats) => {
  return formatPlayerStats(playerStats)
    .filter(player => player.totalAppearances > 0)
    .sort((a, b) => b.totalAppearances - a.totalAppearances);
};

export const getDisciplinaryStats = (playerStats) => {
  return formatPlayerStats(playerStats)
    .filter(player => player.totalCards > 0)
    .sort((a, b) => b.totalCards - a.totalCards);
};