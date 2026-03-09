import React, { useState, useEffect } from 'react';
import PlayerDetail from './PlayerDetail';

function SquadList({ user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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

  return (
    <div style={{ padding: '20px' }}>
      <h1>Squad 2025/26</h1>
      {!user && (
        <p style={{ color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
          Sign in above to view detailed financial information
        </p>
      )}
      
      <div style={{ display: 'grid', gap: '15px', maxWidth: '600px' }}>
        {players.map((player) => (
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
            
            {/* Show financial details only if user is authenticated */}
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