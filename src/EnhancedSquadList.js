import React, { useState, useEffect } from 'react';
import { ref, onValue, getDatabase } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';

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
  const [appearances, setAppearances] = useState([]);
  const [disciplinary, setDisciplinary] = useState([]); 

  // Load players from Firebase
  useEffect(() => {
    const playersRef = ref(database, 'squad2526');
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.values(data);
        setPlayers(playersArray);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Scorers Data (SINGLE VERSION)
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
          console.log('Loaded scorers:', cleanedScorers.length);
        }
      } catch (error) {
        console.error('Scorers fetch error:', error);
      }
    };
    fetchScorers();
  }, []);

  // Fetch Appearances Data
  useEffect(() => {
    const fetchAppearances = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/69b3095eaa77b81da9dca08d');
        const data = await response.json();
        if (data && data.record && Array.isArray(data.record)) {
          setAppearances(data.record);
          console.log('Loaded appearances:', data.record.length);
        }
      } catch (error) {
        console.error('Appearances fetch error:', error);
      }
    };
    fetchAppearances();
  }, []);

  // Fetch Disciplinary Data  
  useEffect(() => {
    const fetchDisciplinary = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/69b309c8aa77b81da9dca1d9');
        const data = await response.json();
        if (data && data.record && Array.isArray(data.record)) {
          setDisciplinary(data.record);
          console.log('Loaded disciplinary:', data.record.length);
        }
      } catch (error) {
        console.error('Disciplinary fetch error:', error);
      }
    };
    fetchDisciplinary();
  }, []);

  // Helper functions
  const getPlayerGoals = (playerName) => {
    const scorer = scorers.find(s => 
      `${s.forename} ${s.surname}`.toLowerCase() === playerName.toLowerCase()
    );
    return scorer ? scorer.goals : 0;
  };

  const getPlayerAppearances = (playerName) => {
    const player = appearances.find(p => 
      `${p.forename} ${p.surname}`.toLowerCase() === playerName.toLowerCase()
    );
    return player || { totalAppearances: 0, totalStarts: 0, totalSubstitutes: 0, starterPercentage: 0 };
  };

  const getPlayerDisciplinary = (playerName) => {
    const player = disciplinary.find(p => 
      `${p.forename} ${p.surname}`.toLowerCase() === playerName.toLowerCase()
    );
    return player || { totalYellow: 0, totalRed: 0, totalCards: 0 };
  };

  if (loading) {
    return <div style={{padding: '20px'}}>Loading...</div>;
  }

  return (
    <div style={{padding: '20px'}}>
      <h1>Squad 2025/26</h1>
      <div>Players loaded: {players.length}</div>
      
      {players.map(player => (
        <div key={player.id} style={{
          border: '1px solid black', 
          margin: '10px 0', 
          padding: '15px',
          backgroundColor: 'white'
        }}>
          <h3>{player.forename} {player.surname}</h3>
          <div>Status: {player.notes} | Rating: {player.rating}/10</div>
          
          {/* Statistics Grid - 2x2 Layout */}
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '10px', 
            marginTop: '10px'
          }}>
            <div style={{backgroundColor: 'lightblue', padding: '10px', textAlign: 'center'}}>
              Goals: {getPlayerGoals(`${player.forename} ${player.surname}`)}
            </div>
            
            <div style={{backgroundColor: 'lightgreen', padding: '10px', textAlign: 'center'}}>
              Apps: {getPlayerAppearances(`${player.forename} ${player.surname}`).totalAppearances}
            </div>
            
            <div style={{backgroundColor: 'orange', padding: '10px', textAlign: 'center'}}>
              Cards: {getPlayerDisciplinary(`${player.forename} ${player.surname}`).totalCards}
            </div>
            
            <div style={{backgroundColor: 'yellow', padding: '5px', fontSize: '12px'}}>
              Data: S:{scorers.length} A:{appearances.length} D:{disciplinary.length}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EnhancedSquadList;