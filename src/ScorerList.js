import React, { useState } from 'react';
import ScorerDetail from './ScorerDetail';

function ScorerList({ fixtures = [] }) {
  const [selectedScorer, setSelectedScorer] = useState(null);

  // Build scorer totals from fixtures
  const scorerMap = {};
  fixtures.forEach(fixture => {
    for (let i = 1; i <= 8; i++) {
      const scorer = fixture[`scorer${i}`];
      if (!scorer || scorer.trim() === '') continue;
      const playerRef = scorer.split('(')[0].trim();
      if (!playerRef) continue;
      const timeMatches = scorer.match(/\(\d+[^)]*\)/g);
      const goalCount = timeMatches ? timeMatches.length : 1;
      if (!scorerMap[playerRef]) {
        scorerMap[playerRef] = { playerRef, total: 0 };
      }
      scorerMap[playerRef].total += goalCount;
    }
  });

  const scorers = Object.values(scorerMap)
    .filter(s => s.total > 0)
    .sort((a, b) => b.total - a.total);

  if (selectedScorer) {
    return (
      <ScorerDetail
        playerRef={selectedScorer}
        fixtures={fixtures}
        onBack={() => setSelectedScorer(null)}
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
        <h1 style={{ color: '#003f7f', margin: 0 }}>Top Scorers</h1>
      </div>

      <div style={{ maxWidth: '600px' }}>
        {scorers.map((scorer, index) => (
          <div
            key={scorer.playerRef}
            onClick={() => setSelectedScorer(scorer.playerRef)}
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
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
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
                marginRight: '15px',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                {scorer.playerRef}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center' }}>
              {scorer.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScorerList;