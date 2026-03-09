import React, { useState, useEffect } from 'react';
import ScorerDetail from './ScorerDetail';

function ScorerList() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScorer, setSelectedScorer] = useState(null);

  useEffect(() => {
    fetchScorers();
  }, []);

  const fetchScorers = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/68283e668561e97a50159f8a');
      const data = await response.json();
      
      if (data && data.record && Array.isArray(data.record)) {
        const cleanedScorers = data.record.map(scorer => ({
          ...scorer,
          forename: String(scorer.forename || '').trim(),
          surname: String(scorer.surname || '').trim(),
          goals: Number(scorer.goals) || 0,
          league: Number(scorer.league) || 0,
          fACup: Number(scorer.fACup) || 0,
          eFLCup: Number(scorer.eFLCup) || 0,
          eFLTrophy: Number(scorer.eFLTrophy) || 0
        })).sort((a, b) => b.goals - a.goals);
        
        setScorers(cleanedScorers);
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

  // Show detail view if a scorer is selected
  if (selectedScorer) {
    return (
      <ScorerDetail 
        scorer={selectedScorer} 
        onBack={() => setSelectedScorer(null)} 
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading scorers...</div>;
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
        <h1 style={{ color: '#003f7f', margin: 0 }}>Top Scorers</h1>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {scorers.map((scorer, index) => (
          <div 
            key={scorer.id || index} 
            onClick={() => setSelectedScorer(scorer)}
            style={{
              backgroundColor: '#003f7f',
              color: 'white',
              padding: '15px',
              marginBottom: '8px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateX(0)'}
          >
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
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                {scorer.forename} {scorer.surname}
              </div>
            </div>

            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {scorer.goals}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScorerList;