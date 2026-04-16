import React, { useState, useEffect } from 'react';
import { calculatePlayerStats, getDisciplinaryStats } from './fixturestatscalculator';
import DisciplinaryDetail from './DisciplinaryDetail';

function DisciplinaryStats({ fixtures = [] }) {
  const [disciplinary, setDisciplinary] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    if (fixtures.length > 0) {
      const playerStats = calculatePlayerStats(fixtures);
      const disciplinaryData = getDisciplinaryStats(playerStats);
      setDisciplinary(disciplinaryData);
    }
  }, [fixtures]);

  if (selectedPlayer) {
    return (
      <DisciplinaryDetail
        player={selectedPlayer}
        onBack={() => setSelectedPlayer(null)}
      />
    );
  }

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

      <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        Statistics calculated from fixture data &middot; Showing players with disciplinary records
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
            Clean slate! No disciplinary records this season.
          </div>
        ) : (
          disciplinary.map((player, index) => (
            <div
              key={`${player.forename}-${player.surname}`}
              onClick={() => setSelectedPlayer(player)}
              style={{
                backgroundColor: player.redCards > 0 ? '#dc3545' : '#ffc107',
                color: player.redCards > 0 ? 'white' : '#000',
                padding: '15px',
                marginBottom: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    backgroundColor: player.redCards > 0 ? '#ffffff' : '#003f7f',
                    color: player.redCards > 0 ? '#dc3545' : '#ffffff',
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
                      {player.yellowCards} yellow, {player.redCards} red
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {player.totalAppearances} appearances
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '60px' }}>
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

export default DisciplinaryStats;