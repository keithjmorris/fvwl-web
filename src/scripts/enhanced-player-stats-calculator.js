/**
 * Bolton Wanderers Player Statistics Calculator - Enhanced Version
 * Processes fixture data to generate comprehensive player statistics
 * Includes smart name matching to handle variations like "M. Burstow" vs "Mason Burstow"
 */

class PlayerStatsCalculator {
  constructor(fixtures) {
    this.fixtures = fixtures;
    this.playerStats = new Map();
    this.nameMapping = this.createNameMapping();
    this.debugMode = false;
  }

  /**
   * Enable/disable debug logging
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * Create name mapping for common player name variations
   * Add entries here for players that appear with different name formats
   */
  createNameMapping() {
    return {
      // Goalkeepers
      'T. Sharman-Lowe': 'Teddy Sharman-Lowe',
      'J. Bonham': 'Jack Bonham',
      'T. Miller': 'Tyler Miller',
      'N. Broome': 'Nathan Broome',

      // Defenders  
      'M. Conway': 'Max Conway',
      'G. Johnston': 'George Johnston',
      'C. Forino': 'Chris Forino',
      'E. Toal': 'Eoin Toal',
      'J. Dacres-Cogley': 'Josh Dacres-Cogley',
      'J. Osei-Tutu': 'Jordi Osei-Tutu',
      'C. Christie': 'Cyrus Christie',
      'R. Taylor': 'Richard Taylor',
      'W. Forrester': 'Will Forrester',
      'S. Hogan': 'Sam Hogan',

      // Midfielders
      'X. Simons': 'Xavi Simons',
      'J. Sheehan': 'Josh Sheehan',
      'E. Erhahon': 'Ethan Erhahon',
      'A. Morley': 'Aaron Morley',
      'T. Gale': 'Thierry Gale',
      'I. Cissoko': 'Ibrahim Cissoko',
      'K. Dempsey': 'Kyle Dempsey',
      'C. Blackett-Taylor': 'Corey Blackett-Taylor',
      'R. Apter': 'Rob Apter',
      'Mendes Gomes': 'Mendes Gomes', // Keep as full name
      'X. Simons': 'Xavier Simons',
      'Xavi Simons': 'Xavier Simons',   // Map to short version

      // Forwards
      'M. Burstow': 'Mason Burstow',
      'A. Cozier-Duberry': 'Amario Cozier-Duberry',
      'J. Randall': 'Joel Randall',
      'S. Dalby': 'Sam Dalby',
      'M. Forss': 'Marcus Forss',
      'J. McAtee': 'John McAtee',
      'J. Kenny': 'Jonny Kenny',
      'D. Lawrence': 'Daeshon Lawrence',

      // Add more mappings as needed
      // Format: 'Short Name': 'Full Name'
    };
  }

  /**
   * Main function to calculate all player statistics
   */
  calculateAllStats() {
    if (this.debugMode) {
      console.log(`Processing ${this.fixtures.length} fixtures...`);
    }
    
    // Reset stats
    this.playerStats.clear();
    
    // Process each fixture
    this.fixtures.forEach((fixture, index) => {
      if (this.debugMode) {
        console.log(`Processing fixture ${index + 1}: ${fixture.competition || 'Unknown Competition'}`);
      }
      this.processFixture(fixture);
    });

    // Generate final stats and return
    return this.generateFinalStats();
  }

  /**
   * Process a single fixture for appearances and cards
   */
  processFixture(fixture) {
    const competition = this.normalizeCompetition(fixture.competition);
    
    // Process starting XI
    for (let i = 1; i <= 11; i++) {
      const player = fixture[`starter${i}`];
      if (player && player.trim() !== "" && player.trim() !== "0") {
        this.recordAppearance(player, competition, 'start', fixture);
      }
    }

    // Process substitutions (players coming on)
    for (let i = 1; i <= 5; i++) {
      const player = fixture[`substitute${i}`];
      if (player && player.trim() !== "" && player.trim() !== "0") {
        this.recordAppearance(player, competition, 'substitute', fixture);
      }
    }

    // Process yellow cards
    for (let i = 1; i <= 6; i++) {
      const player = fixture[`yellowCard${i}`];
      const time = fixture[`yellowCardTime${i}`];
      if (player && player.trim() !== "" && player.trim() !== "0") {
        this.recordCard(player, competition, 'yellow', time, fixture);
      }
    }

    // Process red cards
    for (let i = 1; i <= 2; i++) {
      const player = fixture[`redCard${i}`];
      const time = fixture[`redCardTime${i}`];
      if (player && player.trim() !== "" && player.trim() !== "0") {
        this.recordCard(player, competition, 'red', time, fixture);
      }
    }
  }

  /**
   * Normalize competition names
   */
  normalizeCompetition(competition) {
    if (!competition) return 'Unknown';
    
    const comp = competition.toLowerCase();
    if (comp.includes('league one') || comp.includes('efl league')) return 'League';
    if (comp.includes('fa cup')) return 'FA Cup';
    if (comp.includes('league cup') || comp.includes('carabao')) return 'League Cup';
    if (comp.includes('efl trophy')) return 'EFL Trophy';
    
    return competition; // Return original if no match
  }

  /**
   * Record an appearance for a player
   */
  recordAppearance(playerName, competition, type, fixture) {
    const normalizedName = this.normalizePlayerName(playerName);
    const player = this.getOrCreatePlayer(normalizedName);
    
    if (!player.appearances[competition]) {
      player.appearances[competition] = { starts: 0, substitutes: 0, total: 0, matches: [] };
    }

    // Record the match details
    const matchInfo = {
      id: fixture.id,
      opponent: fixture.opponent || 'Unknown',
      date: fixture.date || 'Unknown',
      type: type,
      competition: competition
    };

    if (type === 'start') {
      player.appearances[competition].starts++;
      matchInfo.role = 'Starter';
    } else {
      player.appearances[competition].substitutes++;
      matchInfo.role = 'Substitute';
      matchInfo.timeOn = fixture[`substituteTime${this.findSubstituteIndex(fixture, playerName)}`] || 'Unknown';
    }
    
    player.appearances[competition].total++;
    player.appearances[competition].matches.push(matchInfo);
    player.totalAppearances++;
  }

  /**
   * Find the substitute index for a given player name
   */
  findSubstituteIndex(fixture, playerName) {
    const normalizedName = this.normalizePlayerName(playerName);
    for (let i = 1; i <= 5; i++) {
      const subName = fixture[`substitute${i}`];
      if (subName && this.normalizePlayerName(subName) === normalizedName) {
        return i;
      }
    }
    return 1; // Default fallback
  }

  /**
   * Record a card for a player
   */
  recordCard(playerName, competition, cardType, time, fixture) {
    const normalizedName = this.normalizePlayerName(playerName);
    const player = this.getOrCreatePlayer(normalizedName);
    
    if (!player.cards[competition]) {
      player.cards[competition] = { yellow: 0, red: 0, details: [] };
    }

    player.cards[competition][cardType]++;
    player.cards[competition].details.push({
      type: cardType,
      time: time || 'Unknown',
      fixture: fixture.id,
      opponent: fixture.opponent || 'Unknown',
      date: fixture.date || 'Unknown',
      competition: competition
    });

    if (cardType === 'yellow') {
      player.totalYellowCards++;
    } else {
      player.totalRedCards++;
    }
  }

  /**
   * Normalize player name using mapping
   */
  normalizePlayerName(name) {
    if (!name) return '';
    
    // Clean the name first
    const cleaned = name.trim().replace(/\s+/g, ' ');
    
    // Check if we have a mapping for this name
    const mapped = this.nameMapping[cleaned];
    if (mapped) {
      if (this.debugMode) {
        console.log(`  Mapped "${cleaned}" â†’ "${mapped}"`);
      }
      return mapped;
    }
    
    return cleaned;
  }

  /**
   * Get or create a player record
   */
  getOrCreatePlayer(playerName) {
    if (!this.playerStats.has(playerName)) {
      this.playerStats.set(playerName, {
        name: playerName,
        totalAppearances: 0,
        totalYellowCards: 0,
        totalRedCards: 0,
        appearances: {},
        cards: {}
      });
    }
    
    return this.playerStats.get(playerName);
  }

  /**
   * Generate final statistics sorted by appearances
   */
  generateFinalStats() {
    const stats = Array.from(this.playerStats.values());
    
    // Sort by total appearances (descending), then by name
    stats.sort((a, b) => {
      if (b.totalAppearances !== a.totalAppearances) {
        return b.totalAppearances - a.totalAppearances;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Add summary totals for each player
    stats.forEach(player => {
      player.summary = this.generatePlayerSummary(player);
    });

    return stats;
  }

  /**
   * Generate a summary for a single player
   */
  generatePlayerSummary(player) {
    const competitions = ['League', 'FA Cup', 'League Cup', 'EFL Trophy'];
    const summary = {
      totalStarts: 0,
      totalSubstitutes: 0,
      byCompetition: {}
    };

    competitions.forEach(comp => {
      const apps = player.appearances[comp] || { starts: 0, substitutes: 0, total: 0 };
      const cards = player.cards[comp] || { yellow: 0, red: 0 };
      
      summary.byCompetition[comp] = {
        appearances: apps.total > 0 ? `${apps.total} (${apps.starts}S/${apps.substitutes}Sub)` : '0',
        starts: apps.starts,
        substitutes: apps.substitutes,
        total: apps.total,
        yellowCards: cards.yellow,
        redCards: cards.red
      };

      summary.totalStarts += apps.starts;
      summary.totalSubstitutes += apps.substitutes;
    });

    return summary;
  }

  /**
   * Get detailed statistics for a specific player
   */
  getPlayerDetails(playerName) {
    // Try exact match first
    let player = this.playerStats.get(playerName);
    
    // If not found, try normalized name
    if (!player) {
      const normalizedName = this.normalizePlayerName(playerName);
      player = this.playerStats.get(normalizedName);
    }
    
    // If still not found, search for partial matches
    if (!player) {
      for (const [name, playerData] of this.playerStats) {
        if (name.toLowerCase().includes(playerName.toLowerCase()) || 
            playerName.toLowerCase().includes(name.toLowerCase())) {
          player = playerData;
          break;
        }
      }
    }
    
    return player;
  }

  /**
   * Print detailed stats for a specific player
   */
  printPlayerDetails(playerName) {
    const player = this.getPlayerDetails(playerName);
    if (!player) {
      console.log(`Player "${playerName}" not found`);
      return;
    }

    console.log(`\n=== ${player.name} ===`);
    console.log(`Total Appearances: ${player.totalAppearances} (${player.summary.totalStarts}S/${player.summary.totalSubstitutes}Sub)`);
    console.log(`Cards: ${player.totalYellowCards} Yellow, ${player.totalRedCards} Red\n`);

    console.log('By Competition:');
    Object.entries(player.summary.byCompetition).forEach(([comp, stats]) => {
      if (stats.total > 0) {
        console.log(`  ${comp}: ${stats.appearances}, ${stats.yellowCards}Y/${stats.redCards}R`);
      }
    });

    if (player.totalYellowCards > 0 || player.totalRedCards > 0) {
      console.log('\nCard Details:');
      Object.entries(player.cards).forEach(([comp, cardData]) => {
        if (cardData.details.length > 0) {
          console.log(`  ${comp}:`);
          cardData.details.forEach(card => {
            console.log(`    ${card.type.toUpperCase()} card at ${card.time} vs ${card.opponent}`);
          });
        }
      });
    }

    // Show recent matches
    const allMatches = [];
    Object.values(player.appearances).forEach(compData => {
      if (compData.matches) {
        allMatches.push(...compData.matches);
      }
    });

    if (allMatches.length > 0) {
      console.log(`\nRecent Matches (last 5):`);
      allMatches.slice(-5).forEach(match => {
        console.log(`  ${match.competition} vs ${match.opponent} - ${match.role}${match.timeOn ? ` (${match.timeOn})` : ''}`);
      });
    }
  }

  /**
   * Export statistics in format suitable for Firebase
   */
  exportForFirebase() {
    const firebaseData = {};
    
    this.playerStats.forEach((player, name) => {
      // Create Firebase-safe key
      const firebaseKey = name
        .toLowerCase()
        .replace(/[.\[\]#$/\s]/g, '_')
        .replace(/[^a-z0-9_-]/g, '')
        .replace(/__+/g, '_')
        .replace(/^_|_$/g, '');
      
      // Calculate additional metrics
      const leagueApps = player.summary.byCompetition.League?.total || 0;
      const cupApps = (player.summary.byCompetition['FA Cup']?.total || 0) + 
                     (player.summary.byCompetition['League Cup']?.total || 0) + 
                     (player.summary.byCompetition['EFL Trophy']?.total || 0);
      
      firebaseData[firebaseKey] = {
        name: player.name,
        displayName: player.name,
        totalAppearances: player.totalAppearances,
        totalStarts: player.summary.totalStarts,
        totalSubstitutes: player.summary.totalSubstitutes,
        totalYellowCards: player.totalYellowCards,
        totalRedCards: player.totalRedCards,
        
        // League stats
        leagueApps: leagueApps,
        leagueStarts: player.summary.byCompetition.League?.starts || 0,
        leagueSubstitutes: player.summary.byCompetition.League?.substitutes || 0,
        leagueYellowCards: player.summary.byCompetition.League?.yellowCards || 0,
        leagueRedCards: player.summary.byCompetition.League?.redCards || 0,
        
        // Cup stats  
        cupApps: cupApps,
        faCupApps: player.summary.byCompetition['FA Cup']?.total || 0,
        leagueCupApps: player.summary.byCompetition['League Cup']?.total || 0,
        eflTrophyApps: player.summary.byCompetition['EFL Trophy']?.total || 0,
        
        // Performance metrics
        starterPercentage: player.totalAppearances > 0 ? 
          Math.round((player.summary.totalStarts / player.totalAppearances) * 100) : 0,
        disciplinaryRecord: player.totalYellowCards + player.totalRedCards,
        
        lastUpdated: new Date().toISOString()
      };
    });

    return firebaseData;
  }

  /**
   * Generate name mapping suggestions for unmapped names
   */
  generateNameMappingSuggestions() {
    const suggestions = [];
    const nameFrequency = new Map();
    
    // Collect all player names from fixtures
    this.fixtures.forEach(fixture => {
      // Check starters
      for (let i = 1; i <= 11; i++) {
        const name = fixture[`starter${i}`];
        if (name && name.trim() && name.trim() !== "0") {
          const clean = name.trim().replace(/\s+/g, ' ');
          nameFrequency.set(clean, (nameFrequency.get(clean) || 0) + 1);
        }
      }
      
      // Check substitutes
      for (let i = 1; i <= 5; i++) {
        const name = fixture[`substitute${i}`];
        if (name && name.trim() && name.trim() !== "0") {
          const clean = name.trim().replace(/\s+/g, ' ');
          nameFrequency.set(clean, (nameFrequency.get(clean) || 0) + 1);
        }
      }
    });
    
    // Find potential variations (names with same surname)
    const namesByLastName = new Map();
    nameFrequency.forEach((count, name) => {
      const parts = name.split(' ');
      const lastName = parts[parts.length - 1];
      if (!namesByLastName.has(lastName)) {
        namesByLastName.set(lastName, []);
      }
      namesByLastName.get(lastName).push({ name, count });
    });
    
    namesByLastName.forEach((variations, lastName) => {
      if (variations.length > 1) {
        variations.sort((a, b) => b.count - a.count);
        const primary = variations[0];
        
        variations.slice(1).forEach(variant => {
          if (variant.name.includes('.') && !primary.name.includes('.')) {
            suggestions.push({
              short: variant.name,
              full: primary.name,
              confidence: 'high'
            });
          }
        });
      }
    });
    
    return suggestions;
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlayerStatsCalculator };
}