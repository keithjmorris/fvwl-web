import React, { useState, useEffect } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';
import { calculatePlayerStats, formatPlayerStats } from './fixtureStatsCalculator';

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
  const [statsLoading, setStatsLoading] = useState(true);

  // Load players from Firebase
  useEffect(() => {
    const playersRef = ref(database, 'squad2526');
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.values(data);
        setPlayers(playersArray);
        console.log('Firebase players loaded:', playersArray.map(p => `${p.forename} ${p.surname}`));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          console.log('Scorers loaded:', cleanedScorers.map(s => `${s.forename} ${s.surname}`));
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
          // Calculate player statistics from fixture data
          const calculatedStats = calculatePlayerStats(data.record);
          const formattedStats = formatPlayerStats(calculatedStats);
          
          console.log('Fixture-based player names found:', Object.keys(calculatedStats));
          console.log('Formatted stats sample:', formattedStats.slice(0, 3));
          
          // Convert to lookup object for easy access
          const statsLookup = {};
          formattedStats.forEach(player => {
            statsLookup[player.fullName] = player;
          });
          
          setPlayerStats(statsLookup);
        }
        setStatsLoading(false);
      } catch (error) {
        console.error('Error calculating player stats:', error);
        setStatsLoading(false);
      }
    };

    fetchFixturesAndCalculateStats();
  }, []);

  // Helper functions
  const getPlayerGoals = (playerName) => {
    const scorer = scorers.find(s => 
      `${s.forename} ${s.surname}`.toLowerCase() === playerName.toLowerCase()
    );
    return scorer ? scorer.goals : 0;
  };

  const getPlayerStatistics = (firebasePlayer) => {
    const playerName = `${firebasePlayer.forename} ${firebasePlayer.surname}`;
    
    // Try exact match first
    let stats = playerStats[playerName];
    
    // If no exact match, try to find a partial match
    if (!stats) {
      // Try matching with fixture data format (e.g., G. Johnston vs George Johnston)
      const matchingKey = Object.keys(playerStats).find(key => {
        const parts = key.split(' ');
        if (parts.length >= 2) {
          const firstName = parts[0];
          const lastName = parts.slice(1).join(' ');
          
          // Check if first name starts with same letter and last name matches
          return firstName.charAt(0).toLowerCase() === firebasePlayer.forename.charAt(0).toLowerCase() &&
                 lastName.toLowerCase() === firebasePlayer.surname.toLowerCase();
        }
        return false;
      });
      
      if (matchingKey) {
        stats = playerStats[matchingKey];
        console.log(`Matched ${playerName} with fixture name: ${matchingKey}`);
      }
    }
    
    if (stats) {
      return {
        appearances: stats.totalAppearances,
        starts: stats.totalStarts,
        substitutes: stats.totalSubstitutes,
        starterPercentage: stats.starterPercentage,
        cards: stats.totalCards,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards
      };
    } else {
      console.log(`No stats found for: ${playerName}`);
      return {
        appearances: 0,
        starts: 0,
        substitutes: 0,
        starterPercentage: 0,
        cards: 0,
        yellowCards: 0,
        redCards: 0
      };
    }
  };

  if (loading) {
    return <div style={{padding: '20px'}}>Loading squad...</div>;
  }

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
        {players.length} players â€¢ {isAuthenticated ? 'Full financial data visible' : 'Public view - financial data hidden'}
        {statsLoading && ' â€¢ Loading statistics...'}
      </div>

      {/* Debug info */}
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginBottom: '20px', fontSize: '12px', borderRadius: '4px' }}>
        <strong>Debug Info:</strong><br />
        Firebase players: {players.length}<br />
        Scorers loaded: {scorers.length}<br />
        Fixture stats calculated: {Object.keys(playerStats).length}<br />
        Sample fixture names: {Object.keys(playerStats).slice(0, 3).join(', ')}
      </div>
      
      {players.map(player => {
        const fullName = `${player.forename} ${player.surname}`;
        const goals = getPlayerGoals(fullName);
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
                  {player.notes} â€¢ Rating: {player.rating}/10
                </div>
              </div>
              
              {/* Quick Stats Summary */}
              <div style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                <div>{goals} goals â€¢ {stats.appearances} apps â€¢ {stats.cards} cards</div>
                <div>{stats.starterPercentage}% starter rate</div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
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
                <div style={{fontWeight: 'bold', color: '#7b1fa2', fontSize: '20px'}}>{stats.starterPercentage}%</div>
                <div style={{fontSize: '12px', color: '#666'}}>Starter Rate</div>
              </div>
              
              <div style={{backgroundColor: '#fff3e0', padding: '12px', borderRadius: '6px', textAlign: 'center'}}>
                <div style={{fontWeight: 'bold', color: '#f57c00', fontSize: '20px'}}>{stats.cards}</div>
                <div style={{fontSize: '12px', color: '#666'}}>Cards</div>
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
    </div>
  );
};

export default EnhancedSquadList;