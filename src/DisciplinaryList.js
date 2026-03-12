import React, { useState, useEffect } from 'react';
import DisciplinaryDetail from './DisciplinaryDetail';

function DisciplinaryList() {
  const [disciplinary, setDisciplinary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetchDisciplinary();
  }, []);

  const fetchDisciplinary = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/69b309c8aa77b81da9dca1d9');
      const data = await response.json();
      if (data && data.record && Array.isArray(data.record)) {
        const cleanedDisciplinary = data.record.map(player => ({
          ...player,
          forename: String(player.forename || '').trim(),
          surname: String(player.surname || '').trim(),
          totalYellow: Number(player.totalYellow) || 0,
          totalRed: Number(player.totalRed) || 0,
          totalCards: Number(player.totalCards) || 0
        })).sort((a, b) => b.totalCards - a.totalCards);
        setDisciplinary(cleanedDisciplinary);
      } else {
        setError('Data format issue');
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Show detail view if a player is selected
  if (selectedPlayer) {
    return (
      <DisciplinaryDetail 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading disciplinary records...</div>;
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
        <h1 style={{ color: '#003f7f', margin: 0 }}>Disciplinary Records</h1>
      </div>
      
      <div style={{ maxWidth: '600px' }}>
        {disciplinary.length === 0 ? (
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '18px'
          }}>
            ðŸ† Clean slate! No disciplinary records this season.
          </div>
        ) : (
          disciplinary.map((player, index) => (
            <div 
              key={`${player.forename}-${player.surname}`} 
              onClick={() => setSelectedPlayer(player)}
              style={{
                backgroundColor: player.totalRed > 0 ? '#dc3545' : '#ffc107',
                color: player.totalRed > 0 ? 'white' : '#000',
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
                    backgroundColor: player.totalRed > 0 ? '#ffffff' : '#003f7f',
                    color: player.totalRed > 0 ? '#dc3545' : '#ffffff',
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
                      {player.totalYellow} yellow, {player.totalRed} red
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold',
                    minWidth: '60px'
                  }}>
                    {player.totalCards}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {player.totalCards === 1 ? 'card' : 'cards'}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DisciplinaryList;