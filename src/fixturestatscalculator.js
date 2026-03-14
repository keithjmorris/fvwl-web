// fixtureStatsCalculator.js - Enhanced with match-by-match details

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
            redCards: 0,
            goals: 0
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
            redCards: 0,
            goals: 0
          };
        }
        
        playerStats[player].totalAppearances++;
        playerStats[player].totalSubstitutes++;
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
            redCards: 0,
            goals: 0
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
            redCards: 0,
            goals: 0
          };
        }
        playerStats[player].redCards++;
      }
    }

    for (let i = 1; i <= 6; i++) {
      const scorer = fixture[`scorer${i}`];
      if (scorer && scorer.trim()) {
        if (!playerStats[scorer]) {
          playerStats[scorer] = {
            totalAppearances: 0,
            totalStarts: 0,
            totalSubstitutes: 0,
            completedMatches: 0,
            substitutedOff: 0,
            yellowCards: 0,
            redCards: 0,
            goals: 0
          };
        }
        playerStats[scorer].goals++;
      }
    }
  });


  return playerStats;
};

// NEW: Get appearance details for a specific player
export const getPlayerAppearanceDetails = (fixtures, playerName) => {
  const appearances = [];
  
  fixtures.forEach(fixture => {
    let playerRole = null;
    let wasSubstituted = false;
    let substitutionTime = null;
    let cameOnTime = null;
    
    // Check if player started
    for (let i = 1; i <= 11; i++) {
      if (fixture[`starter${i}`] === playerName) {
        playerRole = 'Started';
        
        // Check if they were substituted off
        for (let j = 1; j <= 5; j++) {
          if (fixture[`substitutedPlayer${j}`] === playerName) {
            wasSubstituted = true;
            substitutionTime = fixture[`substituteTime${j}`];
            break;
          }
        }
        break;
      }
    }
    
    // Check if player came on as substitute
    if (!playerRole) {
      for (let i = 1; i <= 5; i++) {
        if (fixture[`substitute${i}`] === playerName) {
          playerRole = 'Substitute';
          cameOnTime = fixture[`substituteTime${i}`];
          break;
        }
      }
    }
    
    // If player was involved, add to appearances
    if (playerRole) {
      appearances.push({
        date: fixture.date,
        opponent: fixture.opponent,
        homeOrAway: fixture.homeOrAway,
        competition: fixture.competition,
        result: fixture.result,
        role: playerRole,
        wasSubstituted,
        substitutionTime,
        cameOnTime
      });
    }
  });
  
  return appearances.reverse(); // Most recent first
};

// NEW: Get disciplinary details for a specific player
export const getPlayerDisciplinaryDetails = (fixtures, playerName) => {
  const disciplinaryRecords = [];
  
  fixtures.forEach(fixture => {
    const matchIncidents = [];
    
    // Check for yellow cards
    for (let i = 1; i <= 6; i++) {
      if (fixture[`yellowCard${i}`] === playerName) {
        matchIncidents.push({
          type: 'Yellow Card',
          time: fixture[`yellowCardTime${i}`] || 'Unknown time'
        });
      }
    }
    
    // Check for red cards
    for (let i = 1; i <= 2; i++) {
      if (fixture[`redCard${i}`] === playerName) {
        matchIncidents.push({
          type: 'Red Card',
          time: fixture[`redCardTime${i}`] || 'Unknown time'
        });
      }
    }
    
    // If player had cards in this match, add to records
    if (matchIncidents.length > 0) {
      disciplinaryRecords.push({
        date: fixture.date,
        opponent: fixture.opponent,
        homeOrAway: fixture.homeOrAway,
        competition: fixture.competition,
        result: fixture.result,
        incidents: matchIncidents
      });
    }
  });
  
  return disciplinaryRecords.reverse(); // Most recent first
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