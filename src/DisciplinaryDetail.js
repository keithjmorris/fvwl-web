import React, { useState, useEffect } from 'react';
import { getPlayerDisciplinaryDetails } from './fixturestatscalculator';

function DisciplinaryDetail({ player, onBack }) {
  const [disciplinaryDetails, setDisciplinaryDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDisciplinaryDetails = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75', {
        headers: {
          'X-Master-Key': '$2a$10$mYvv7Zt9.2mHp3BSPb3J8.0qg8EZgxCeXGjnJhGQO.k9Qr5f5/b2C'
        }
      });
      const data = await response.json();
      
      if (data && data.record && Array.isArray(data.record)) {
        const details = getPlayerDisciplinaryDetails(data.record, player.fullName);
        setDisciplinaryDetails(details);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching disciplinary details:', error);
      setLoading(false);
    }
  };

  fetchDisciplinaryDetails();
}, [player]);

  const getDisciplinaryStatus = () => {
    if (player.redCards > 0) {
      return {
        status: 'High Risk',
        color: '#dc3545',
        description: `${player.redCards} red card${player.redCards > 1 ? 's' : ''} received this season. Immediate attention required.`
      };
    } else if (player.yellowCards >= 5) {
      return {
        status: 'Suspension Warning',
        color: '#fd7e14',
        description: 'Close to suspension threshold. Monitor closely.'
      };
    } else if (player.yellowCards >= 3) {
      return {
        status: 'Caution Required',
        color: '#ffc107',
        description: 'Multiple yellow cards - discipline needs improvement.'
      };
    } else if (player.yellowCards > 0) {
      return {
        status: 'Minor Issues',
        color: '#ffc107',
        description: 'Some bookings but generally well-disciplined.'
      };
    } else {
      return {
        status: 'Excellent',
        color: '#28a745',
        description: 'Clean disciplinary record this season.'
      };
    }
  };

  const formatResult = (result, homeOrAway) => {
    if (!result) return 'Result unknown';
    
    let cleanResult = result.replace(/\s+/g, ' ').trim();
    
    if (homeOrAway === 'Away') {
      return `${cleanResult} (A)`;
    } else {
      return `${cleanResult} (H)`;
    }
  };

  const disciplinaryStatus = getDisciplinaryStatus();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
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
        color: player.redCards > 0 || player.yellowCards >= 3 ? 'white' : '#000',
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
          <span>{player.yellowCards}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Red cards</span>
          <span>{player.redCards}</span>
        </div>
      </div>

      {/* Disciplinary status */}
      <div style={{
        backgroundColor: disciplinaryStatus.color,
        color: player.redCards > 0 || player.yellowCards >= 3 ? 'white' : '#000',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        <div style={{ marginBottom: '8px', fontSize: '16px' }}>
          Status: {disciplinaryStatus.status}
        </div>
        <div style={{ lineHeight: '1.5', fontWeight: 'normal' }}>
          {disciplinaryStatus.description}
        </div>
      </div>

      {/* Suspension warning if needed */}
      {player.yellowCards >= 5 && (
        <div style={{
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '10px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          ⚠️ <strong>Warning:</strong> Player may be close to suspension threshold.
        </div>
      )}

      {/* Match-by-match details */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading disciplinary records...
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Match-by-Match Disciplinary Record ({disciplinaryDetails.length} matches)
          </div>
          
          {disciplinaryDetails.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              color: '#155724',
              border: '1px solid #c3e6cb'
            }}>
              ðŸ† Clean disciplinary record - no cards received this season!
            </div>
          ) : (
            disciplinaryDetails.map((record, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: record.incidents.some(i => i.type === 'Red Card') ? '#f8d7da' : '#fff3cd',
                  border: `1px solid ${record.incidents.some(i => i.type === 'Red Card') ? '#f5c6cb' : '#ffeaa7'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: '#003f7f' }}>
                      {record.opponent} {formatResult(record.result, record.homeOrAway)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '2px' }}>
                      {record.date} â€¢ {record.competition}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      {record.incidents.map((incident, incidentIndex) => (
                        <div 
                          key={incidentIndex}
                          style={{ 
                            fontSize: '14px', 
                            marginBottom: '4px',
                            color: incident.type === 'Red Card' ?  '🟥' : '🟨',
                            fontWeight: 'bold'
                          }}
                        >
                         {incident.type === 'Red Card' ? '🟥' : '🟨'} {incident.type} - {incident.time}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default DisciplinaryDetail;