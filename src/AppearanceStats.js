import React, { useState, useEffect } from 'react';
import { calculatePlayerStats, getAppearanceStats } from './fixturestatscalculator';
import AppearanceDetail from './AppearanceDetail';

function AppearanceStats() {
  const [appearances, setAppearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchFixturesAndCalculateStats();
  }, []);

  const fetchFixturesAndCalculateStats = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75', {
        headers: {
          'X-Master-Key': '$2a$10$mYvv7Zt9.2mHp3BSPb3J8.0qg8EZgxCeXGjnJhGQO.k9Qr5f5/b2C'
        }
      });
      const data = await response.json();
      
      if (data && data.record && Array.isArray(data.record)) {
        console.log('Loaded fixtures for appearance calculation:', data.record.length);
        
        // Calculate player statistics from fixture data
        const playerStats = calculatePlayerStats(data.record);
        const appearanceData = getAppearanceStats(playerStats);
        
        setAppearances(appearanceData);
        console.log('Calculated appearance stats for players:', appearanceData.length);
      } else {
        setError('Invalid fixture data format');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fixtures or calculating stats:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Show detail view if a player is selected
  if (selectedPlayer) {
    return (
      <AppearanceDetail 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Calculating appearance statistics...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img 
          src="/bwfc.png" 
          alt="BWFC" 
          style={{ width: '50px', height: '50px', marginRight: '15px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ color: '#003f7f', margin: 0 }}>Player Appearances</h1>
      </div>
      
      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        Statistics calculated from {appearances.length > 0 ? 'fixture data' : 'loading...'} . 
        Showing players with appearance records
      </div>
      
      <div style={{ maxWidth: '600px' }}>
        {appearances.map((player, index) => (
          <div 
            key={`${player.forename}-${player.surname}`} 
            onClick={() => setSelectedPlayer(player)}
            style={{
              backgroundColor: '#003f7f',
              color: 'white',
              padding: '15px',
              marginBottom: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateX(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  color: '#003f7f',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  marginRight: '15px'
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    {player.forename} {player.surname}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>
                    {player.totalStarts} starts, {player.totalSubstitutes} sub appearances
                  </div>
                  
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  minWidth: '60px'
                }}>
                  {player.totalAppearances}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {player.starterPercentage}% starter
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {appearances.length === 0 && !loading && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          No appearance data available. Please check that fixture data is properly loaded.
        </div>
      )}
    </div>
  );
}

export default AppearanceStats;