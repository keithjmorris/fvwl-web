import React from 'react';

function DisciplinaryDetail({ player, onBack }) {
  const getDisciplinaryStatus = () => {
    if (player.totalRed > 0) {
      return {
        status: 'High Risk',
        color: '#dc3545',
        description: `${player.totalRed} red card${player.totalRed > 1 ? 's' : ''} received this season`
      };
    } else if (player.totalYellow >= 3) {
      return {
        status: 'Caution Required',
        color: '#ffc107',
        description: 'Multiple yellow cards - close to suspension threshold'
      };
    } else if (player.totalYellow > 0) {
      return {
        status: 'Minor Issues',
        color: '#ffc107',
        description: 'Some bookings but generally well-disciplined'
      };
    } else {
      return {
        status: 'Excellent',
        color: '#28a745',
        description: 'Clean disciplinary record this season'
      };
    }
  };

  const disciplinaryStatus = getDisciplinaryStatus();

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
        â† Back to Disciplinary
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

      {/* Total cards */}
      <div style={{
        backgroundColor: disciplinaryStatus.color,
        color: player.totalRed > 0 ? 'white' : '#000',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Total cards</span>
        <span>{player.totalCards}</span>
      </div>

      {/* Card breakdown */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Yellow cards</span>
          <span>{player.totalYellow}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Red cards</span>
          <span>{player.totalRed}</span>
        </div>
      </div>

      {/* Disciplinary status */}
      <div style={{
        backgroundColor: disciplinaryStatus.color,
        color: player.totalRed > 0 || player.totalYellow >= 3 ? 'white' : '#000',
        padding: '15px',
        borderRadius: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '16px' }}>
          Status: {disciplinaryStatus.status}
        </div>
        <div style={{ lineHeight: '1.5', fontWeight: 'normal' }}>
          {disciplinaryStatus.description}
        </div>
      </div>

      {/* Additional warnings if needed */}
      {player.totalYellow >= 5 && (
        <div style={{
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px',
          borderRadius: '10px',
          marginTop: '10px',
          fontSize: '14px'
        }}>
          âš ï¸ <strong>Warning:</strong> Player may be close to suspension threshold. Check league rules for accumulation limits.
        </div>
      )}
    </div>
  );
}

export default DisciplinaryDetail;