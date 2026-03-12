/**
 * PlayerStatsCalculator for React Web App
 * Calculates player statistics dynamically from fixtures data
 */

export class PlayerStatsCalculator {
  constructor(fixtures) {
    this.fixtures = fixtures || [];
    this.playerStats = new Map();
    this.nameMapping = this.createNameMapping();
  }

  /**
   * Create name mapping for common player name variations
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
      'X. Simons': 'Xavier Simons',
      'Xavier Simons': 'Xavier Simons',
      'J. Sheehan': 'Josh Sheehan',
      'E. Erhahon': 'Ethan Erhahon',
      'A. Morley': 'Aaron Morley',
      'T. Gale': 'Thierry Gale',
      'I. Cissoko': 'Ibrahim Cissoko',
      'K. Dempsey': 'Kyle Dempsey',
      'C. Blackett-Taylor': 'Corey Blackett-Taylor',
      'R. Apter': 'Rob Apter',

      // Forwards
      'M. Burstow': 'Mason Burstow',
      'A. Cozier-Duberry': 'Amario Cozier-Duberry',
      'J. Randall': 'Joel Randall',
      'S. Dalby': 'Sam Dalby',
      'M. Forss': 'Marcus Forss',
      'J. McAtee': 'John McAtee',
      'J. Kenny': 'Jonny Kenny',
      'D. Lawrence': 'Daeshon Lawrence',

      // Handle full/short name variations
      'Mendes Gomes': 'Mendes Gomes',
      'Sam Inwood': 'Sam Inwood',
      'S. Inwood': 'Sam Inwood',
    };
  }

  /**
   * Main function to calculate all player statistics
   */
  calculateAllStats() {
    // Reset stats
    this.playerStats.clear();
    
    // Process each fixture
    this.fixtures.forEach(fixture => {
      this.processFixture(fixture);
    });

    // Generate final stats and return
    return this.generateFinalStats();
  }

  /**
   * Process a single fixture for appearances and cards
   */
  processFixture(fixture) {
    if (!fixture) return;
    
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
      if (player && player.trim() !== "" && player.trim() !== "0" && !this.isTimeStamp(player)) {
        this.recordCard(player, competition, 'yellow', time, fixture);
      }
    }

    // Process red cards
    for (let i = 1; i <= 2; i++) {
      const player = fixture[`redCard${i}`];
      const time = fixture[`redCardTime${i}`];
      if (player && player.trim() !== "" && player.trim() !== "0" && !this.isTimeStamp(player)) {
        this.recordCard(player, competition, 'red', time, fixture);
      }
    }
  }

  /**
   * Check if a string is a timestamp (to avoid processing times as player names)
   */
  isTimeStamp(str) {
    // Match patterns like "45'+2", "90'", "23'" etc.
    return /^\d+['′](\+\d+)?$/.test(str.trim());
  }

  /**
   * Normalize competition names
   */
  normalizeCompetition(competition) {
    if (!competition) return 'League';
    
    const comp = competition.toLowerCase();
    if (comp.includes('league one') || comp.includes('efl league')) return 'League';
    if (comp.includes('fa cup')) return 'FA Cup';
    if (comp.includes('league cup') || comp.includes('carabao')) return 'League Cup';
    if (comp.includes('efl trophy')) return 'EFL Trophy';
    
    return 'League'; // Default to league
  }

  /**
   * Record an appearance for a player
   */
  recordAppearance(playerName, competition, type, fixture) {
    const normalizedName = this.normalizePlayerName(playerName);
    const player = this.getOrCreatePlayer(normalizedName);
    
    if (!player.appearances[competition]) {
      player.appearances[competition] = { starts: 0, substitutes: 0, total: 0 };
    }

    if (type === 'start') {
      player.appearances[competition].starts++;
    } else {
      player.appearances[competition].substitutes++;
    }
    
    player.appearances[competition].total++;
    player.totalAppearances++;
  }

  /**
   * Record a card for a player
   */
  recordCard(playerName, competition, cardType, time, fixture) {
    const normalizedName = this.normalizePlayerName(playerName);
    const player = this.getOrCreatePlayer(normalizedName);
    
    if (!player.cards[competition]) {
      player.cards[competition] = { yellow: 0, red: 0 };
    }

    player.cards[competition][cardType]++;

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
    
    const cleaned = name.trim().replace(/\s+/g, ' ');
    return this.nameMapping[cleaned] || cleaned;
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
   * Get statistics for a specific player by name (flexible matching)
   */
  getPlayerStats(playerName) {
    if (!playerName) return null;
    
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
   * Get total appearances for a player (for quick access)
   */
  getPlayerAppearances(playerName) {
    const player = this.getPlayerStats(playerName);
    return player ? player.totalAppearances : 0;
  }

  /**
   * Get total cards for a player
   */
  getPlayerCards(playerName) {
    const player = this.getPlayerStats(playerName);
    return player ? {
      yellow: player.totalYellowCards,
      red: player.totalRedCards,
      total: player.totalYellowCards + player.totalRedCards
    } : { yellow: 0, red: 0, total: 0 };
  }
}

export default PlayerStatsCalculator;