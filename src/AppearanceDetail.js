import React from 'react';

function AppearanceDetail({ player, onBack }) {
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
        â† Back to Appearances
      </button>

      {/* Player name */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#003f7f',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {player.forename} {player.surname}
      </div>

      {/* Total appearances */}
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
        <span>Total appearances</span>
        <span>{player.totalAppearances}</span>
      </div>

      {/* Appearance breakdown */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Starts</span>
          <span>{player.totalStarts}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Substitute appearances</span>
          <span>{player.totalSubstitutes}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Starter percentage</span>
          <span>{player.starterPercentage}%</span>
        </div>
      </div>

      {/* Performance summary */}
      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ color: '#fff', marginBottom: '8px', fontSize: '16px' }}>Performance Summary</div>
        <div style={{ lineHeight: '1.5' }}>
          {player.starterPercentage >= 80 ? (
            <>Regular starter with {player.totalStarts} starts from {player.totalAppearances} appearances</>
          ) : player.starterPercentage >= 50 ? (
            <>Frequent starter with {player.totalStarts} starts and {player.totalSubstitutes} substitute appearances</>
          ) : player.totalSubstitutes > player.totalStarts ? (
            <>Impact substitute with {player.totalSubstitutes} substitute appearances and {player.totalStarts} starts</>
          ) : (
            <>Squad player with {player.totalAppearances} total appearances</>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppearanceDetail;