import React, { useState, useEffect } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';
import { calculatePlayerStats, formatPlayerStats } from './fixturestatscalculator';

const getFirebaseApp = () => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  } else {
    const firebaseConfig = {
      apiKey: "AIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
      authDomain: "fvwl-8109b.firebaseapp.com",
      databaseURL: "https://fvwl-8109b-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "fvwl-8109b",
      storageBucket: "fvwl-8109b.firebasestorage.app",
      messagingSenderId: "406636067359",
      appId: "1:406636067359:web:8b70673d38495254b2f32a"
    };
    return initializeApp(firebaseConfig);
  }
};

const app = getFirebaseApp();
const database = getDatabase(app);

const EnhancedSquadList = ({ isAuthenticated }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scorers, setScorers] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');

  // Load players from Firebase
  useEffect(() => {
    const playersRef = ref(database, 'squad2526');
    const _unsubscribe = onValue(playersRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    const playersArray = Object.values(data).filter(player => player.notes !== 'Total');
    setPlayers(playersArray);
  }
  setLoading(false);
});
}, []);  // ← These lines were missing!

  // Load scorers data
  useEffect(() => {
    const fetchScorers = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68283e668561e97a50159f8a');
        const data = await response.json();
        if (data && data.record && Array.isArray(data.record)) {
          const cleanedScorers = data.record.map(scorer => ({
            ...scorer,
            forename: String(scorer.forename || '').trim(),
            surname: String(scorer.surname || '').trim(),
            goals: Number(scorer.goals) || 0
          }));
          setScorers(cleanedScorers);
        }
      } catch (error) {
        console.error('Scorers fetch error:', error);
      }
    };
    fetchScorers();
  }, []);

  // Load fixture data and calculate statistics
  useEffect(() => {
    const fetchFixturesAndCalculateStats = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75', {
          headers: {
            'X-Master-Key': '$2a$10$mYvv7Zt9.2mHp3BSPb3J8.0qg8EZgxCeXGjnJhGQO.k9Qr5f5/b2C'
          }
        });
        const data = await response.json();
        
        if (data && data.record && Array.isArray(data.record)) {
          setFixtures(data.record);
          
          // Calculate player statistics from fixture data
          const calculatedStats = calculatePlayerStats(data.record);
          const formattedStats = formatPlayerStats(calculatedStats);
          
          // Convert to lookup object for easy access
          const statsLookup = {};
          formattedStats.forEach(player => {
            statsLookup[player.fullName] = player;
          });
          
          setPlayerStats(statsLookup);
        }
      } catch (error) {
        console.error('Error calculating player stats:', error);
      }
    };

    fetchFixturesAndCalculateStats();
  }, []);

  // Helper function to convert Firebase name to fixture format
  const convertToFixtureFormat = (firebasePlayer) => {
    // Convert "George Johnston" to "G. Johnston" format
    const firstInitial = firebasePlayer.forename.charAt(0).toUpperCase();
    return `${firstInitial}. ${firebasePlayer.surname}`;
  };

  // Helper functions
  const getPlayerGoals = (firebasePlayer) => {
    const fixtureFormatName = convertToFixtureFormat(firebasePlayer);
    const scorer = scorers.find(s => 
      `${s.forename} ${s.surname}`.toLowerCase() === fixtureFormatName.toLowerCase()
    );
    return scorer ? scorer.goals : 0;
  };

  const getPlayerStatistics = (firebasePlayer) => {
    const fixtureFormatName = convertToFixtureFormat(firebasePlayer);
    const stats = playerStats[fixtureFormatName];
    
    if (stats) {
      // Calculate league vs cup appearances
      const leagueFixtures = fixtures.filter(f => f.competition === 'EFL League One').length;
      const cupFixtures = fixtures.length - leagueFixtures;
      const totalFixtures = fixtures.length;
      
      return {
        appearances: stats.totalAppearances,
        starts: stats.totalStarts,
        substitutes: stats.totalSubstitutes,
        cards: stats.totalCards,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards,
        // New percentage calculations based on total season games
        totalFixtures,
        leagueFixtures,
        cupFixtures,
        appearancePercentage: totalFixtures > 0 ? Math.round((stats.totalAppearances / totalFixtures) * 100) : 0,
        startsPercentage: totalFixtures > 0 ? Math.round((stats.totalStarts / totalFixtures) * 100) : 0
      };
    }
    
    return {
      appearances: 0,
      starts: 0,
      substitutes: 0,
      cards: 0,
      yellowCards: 0,
      redCards: 0,
      totalFixtures: fixtures.length,
      leagueFixtures: 0,
      cupFixtures: 0,
      appearancePercentage: 0,
      startsPercentage: 0
    };
  };

  // Calculate team totals
  const calculateTeamTotals = (filteredPlayers = players) => {
  let totalGoals = 0;
  let totalCards = 0;
  let activePlayers = 0;
  
  filteredPlayers.forEach(player => {
    const goals = getPlayerGoals(player);
    const stats = getPlayerStatistics(player);
    
    totalGoals += goals;
    totalCards += stats.cards;
    
    // Count active players (not "Gone")
    if (player.notes !== 'Gone') {
      activePlayers++;
    }
  });
  
  return {
    totalGoals,
    totalCards,
    activePlayers,
    totalFixtures: fixtures.length
  };
};
  if (loading) {
    return <div style={{padding: '20px'}}>Loading squad...</div>;
  }

 const filteredPlayers = players.filter(player => {
  if (statusFilter === 'All') return true;
  if (statusFilter === 'Available') return player.notes === 'Squad' || player.notes === 'Loan in';
  return player.notes === statusFilter;
});

const teamTotals = calculateTeamTotals(filteredPlayers);

  return (
    <div style={{padding: '20px'}}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img 
          src="/bwfc.png" 
          alt="BWFC" 
          style={{ width: '50px', height: '50px', marginRight: '15px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ color: '#003f7f', margin: 0 }}>Squad 2025/26</h1>
      </div>
      
      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        {players.length} players . {fixtures.length} fixtures this season . {isAuthenticated ? 'Full financial data visible' : 'Public view - financial data hidden'}
      </div>
      
      {/* Team Totals */}
      <div
        style={{
          backgroundColor: 'white',
          border: '2px solid #003f7f',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h3 style={{ color: '#003f7f', margin: '0 0 5px 0', fontSize: '24px' }}>
              Team Totals
            </h3>
            <div style={{ color: '#666', fontSize: '16px' }}>
              Season 2025/26 . {teamTotals.activePlayers} active players
            </div>
          </div>
          
          <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
            <div>{teamTotals.totalGoals} total goals . {teamTotals.totalCards} total cards</div>
            <div>{teamTotals.totalFixtures} fixtures played this season</div>
          </div>
        </div>

        {/* Team Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '10px'
        }}>
          <div style={{backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
            <div style={{fontWeight: 'bold', color: '#1976d2', fontSize: '20px'}}>{teamTotals.totalGoals}</div>
            <div style={{fontSize: '12px', color: '#666'}}>Total Goals</div>
          </div>
          
          <div style={{backgroundColor: '#fff3e0', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
            <div style={{fontWeight: 'bold', color: '#f57c00', fontSize: '20px'}}>{teamTotals.totalCards}</div>
            <div style={{fontSize: '12px', color: '#666'}}>Total Cards</div>
          </div>
          
          <div style={{backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
            <div style={{fontWeight: 'bold', color: '#388e3c', fontSize: '20px'}}>{teamTotals.activePlayers}</div>
            <div style={{fontSize: '12px', color: '#666'}}>Active Players</div>
          </div>
          
          <div style={{backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
            <div style={{fontWeight: 'bold', color: '#546e7a', fontSize: '20px'}}>{teamTotals.totalFixtures}</div>
            <div style={{fontSize: '12px', color: '#666'}}>Fixtures Played</div>
          </div>
        </div>
      </div>

      {/* ADD THE DROPDOWN HERE */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontSize: '14px', color: '#666' }}>Filter by status:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        >
          <option value="All">All Players</option>
          <option value="Squad">Squad</option>
          <option value="Loan in">Loan in</option>
          <option value="Available">Squad + Loan in</option>
          <option value="On loan">On loan</option>
          <option value="Gone">Gone</option>
        </select>
      </div>

      {/* Individual Players */}
      {players.filter(player => {
  if (statusFilter === 'All') return true;
  if (statusFilter === 'Available') return player.notes === 'Squad' || player.notes === 'Loan in';
  return player.notes === statusFilter;
}).map(player => {
        const goals = getPlayerGoals(player);
        const stats = getPlayerStatistics(player);
        
        return (
          <div
            key={player.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Player Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ color: '#003f7f', margin: '0 0 5px 0', fontSize: '24px' }}>
                  {player.forename} {player.surname}
                </h3>
                <div style={{ color: '#666', fontSize: '16px' }}>
                  Status: {player.notes}
                </div>
              </div>
              
              {/* Quick Stats Summary */}
              <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                <div>{goals} goals . {stats.appearances}/{stats.totalFixtures} games . {stats.cards} cards</div>
                <div>{stats.appearancePercentage}% season participation</div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              marginBottom: isAuthenticated ? '20px' : '0'
            }}>
              <div style={{backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#1976d2', fontSize: '20px'}}>{goals}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Goals</div>
              </div>
              
              <div style={{backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#388e3c', fontSize: '20px'}}>{stats.appearances}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Appearances</div>
              </div>
              
              <div style={{backgroundColor: '#f3e5f5', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#7b1fa2', fontSize: '20px'}}>{stats.starts}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Starts</div>
              </div>
              
              <div style={{backgroundColor: '#e8f5e8', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#388e3c', fontSize: '20px'}}>{stats.substitutes}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Sub Apps</div>
              </div>
              
              <div style={{backgroundColor: '#fff3e0', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#f57c00', fontSize: '20px'}}>{stats.cards}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Cards</div>
              </div>
              
              <div style={{backgroundColor: '#f0f4f8', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#546e7a', fontSize: '20px'}}>{stats.appearancePercentage}%</div>
                <div style={{fontSize: '12px', color: '#666'}}>Season %</div>
              </div>
            </div>

            {/* Financial Information (Authenticated Only) */}
            {isAuthenticated && (
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '15px',
                backgroundColor: '#f8f9fa',
                margin: '0 -20px -20px -20px',
                padding: '15px 20px',
                borderRadius: '0 0 8px 8px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#003f7f', marginBottom: '10px' }}>
                  Financial Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Weekly Wage</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      Â£{player.currentWeeklyWage?.toLocaleString() || '0'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666' }}>Total Value</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      Â£{player.overallTotal?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {players.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          No players found. Please check that squad data is properly loaded.
        </div>
      )}
    </div>
  );
};

export default EnhancedSquadList;