import React from 'react';

function ScorerDetail({ scorer, onBack }) {
  // Function to convert \n to line breaks - try multiple formats
  const formatText = (text) => {
    if (!text) return '';
    
    // Try different possible line break formats
    let lines = [];
    if (text.includes('\\n')) {
      lines = text.split('\\n');
    } else if (text.includes('\n')) {
      lines = text.split('\n');
    } else {
      return <div>{text}</div>;
    }
    
    return lines.map((line, index) => (
      <div key={index} style={{ marginBottom: index < lines.length - 1 ? '8px' : '0' }}>
        {line.trim()}
      </div>
    ));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      {/* Back button */}
      <button 
        onClick={onBack}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#003f7f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back to Scorers
      </button>

      {/* Player name */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#003f7f',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {scorer.forename} {scorer.surname}
      </div>

      {/* Total goals */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Total goals</span>
        <span>{scorer.goals}</span>
      </div>

      {/* Goal breakdown */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>League</span>
          <span>{scorer.league}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>FA Cup</span>
          <span>{scorer.fACup}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>EFL Cup</span>
          <span>{scorer.eFLCup}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>EFL Trophy</span>
          <span>{scorer.eFLTrophy}</span>
        </div>
      </div>

      {/* League details */}
      {scorer.detail && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '8px', fontSize: '16px' }}>League</div>
          <div style={{ lineHeight: '1.5' }}>{formatText(scorer.detail)}</div>
        </div>
      )}

      {/* Cup details */}
      {scorer.detail2 && (
        <div style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '8px', fontSize: '16px' }}>Cup</div>
          <div style={{ lineHeight: '1.5' }}>{formatText(scorer.detail2)}</div>
        </div>
      )}
    </div>
  );
}

export default ScorerDetail;