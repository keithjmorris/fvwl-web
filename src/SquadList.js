import React, { useState, useEffect } from 'react';
import PlayerDetail from './PlayerDetail';

function SquadList({ user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedStatuses, setSelectedStatuses] = useState(['Squad', 'Loan in']);
  const [totalCost, setTotalCost] = useState({ Total: 0, overallTotal: 0 });

  useEffect(() => {
    const loadFirebase = async () => {
      try {
        const { initializeApp } = await import('firebase/app');
        const { getDatabase, ref, onValue } = await import('firebase/database');
        
        const firebaseConfig = {
          apiKey: "AIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
          authDomain: "fvwl-8109b.firebaseapp.com",
          databaseURL: "https://fvwl-8109b-default-rtdb.europe-west1.firebasedatabase.app",
          projectId: "fvwl-8109b",
          storageBucket: "fvwl-8109b.firebasestorage.app",
          messagingSenderId: "406636067359",
          appId: "1:406636067359:web:8b70673d38495254b2f32a"
        };

        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);
        
        const playersRef = ref(database, 'squad2526');
        onValue(playersRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const playersArray = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            setPlayers(playersArray);
            setLoading(false);
          } else {
            setError('No data found');
            setLoading(false);
          }
        });
        
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    loadFirebase();
  }, []);

  // Filter players by status
  const filteredPlayers = players.filter(player => 
    selectedStatuses.some(status => 
      player.notes && player.notes.toLowerCase().includes(status.toLowerCase())
    )
  );

  // Calculate totals for filtered players
  useEffect(() => {
    const totals = filteredPlayers.reduce((acc, player) => ({
      Total: acc.Total + (player.Total || 0),
      overallTotal: acc.overallTotal + (player.overallTotal || 0)
    }), { Total: 0, overallTotal: 0 });
    setTotalCost(totals);
  }, [filteredPlayers, user]);

  // Show detail view if a player is selected
  if (selectedPlayer) {
    return (
      <PlayerDetail 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
        user={user}
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading players...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;

  const statusOptions = ['Squad', 'On loan', 'Loan in', 'Gone'];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Squad 2025/26</h1>
      
      {/* Status Filter */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#003f7f' }}>
          Filter by Status:
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => {
                if (selectedStatuses.includes(status)) {
                  setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                } else {
                  setSelectedStatuses([...selectedStatuses, status]);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedStatuses.includes(status) ? '#003f7f' : 'transparent',
                color: selectedStatuses.includes(status) ? 'white' : '#003f7f',
                border: '2px solid #003f7f',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {status}
            </button>
          ))}
        </div>
        
        {/* Total row - only show if user is authenticated */}
        {user && (
          <div style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Total for {selectedStatuses.join(', ')}:</span>
            <span>£{totalCost.overallTotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      {!user && (
        <p style={{ color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
          Sign in above to view detailed financial information
        </p>
      )}
      
      <div style={{ display: 'grid', gap: '15px', maxWidth: '600px' }}>
        {filteredPlayers.map((player) => (
          <div 
            key={player.id} 
            onClick={() => setSelectedPlayer(player)}
            style={{ 
              border: '2px solid #003f7f', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#003f7f' }}>
              {player.forename} {player.surname}
            </h3>
            <p style={{ margin: '5px 0' }}><strong>Status:</strong> {player.notes}</p>
            
            {user ? (
              <>
                <p style={{ margin: '5px 0' }}><strong>Total:</strong> £{player.Total?.toLocaleString()}</p>
                <p style={{ margin: '5px 0' }}><strong>Overall:</strong> £{player.overallTotal?.toLocaleString()}</p>
              </>
            ) : (
              <p style={{ margin: '5px 0', color: '#999', fontStyle: 'italic' }}>
                Sign in to view financial details
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SquadList;