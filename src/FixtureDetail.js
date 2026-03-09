import React from 'react';

function FixtureDetail({ fixture, onBack }) {
  const getGoalScorers = () => {
    const scorers = [];
    for (let i = 1; i <= 8; i++) {
      const scorer = fixture[`scorer${i}`];
      if (scorer && scorer !== "0") {
        scorers.push(scorer);
      }
    }
    return scorers;
  };

  const goalScorers = getGoalScorers();

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
        ← Back to Fixtures
      </button>

      {/* Date */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {fixture.date}
      </div>

      {/* Match title */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {fixture.homeOrAway === "Home" 
          ? `Bolton Wanderers v ${fixture.opponent}`
          : `${fixture.opponent} v Bolton Wanderers`
        }
      </div>

      {/* Competition and venue */}
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
        <span>{fixture.competition}</span>
        <span>{fixture.homeOrAway}</span>
      </div>

      {/* Score */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {fixture.homeOrAway === "Home" ? (
          <>
            <span style={{ width: '120px', textAlign: 'left' }}>Bolton</span>
            <span style={{ fontSize: '20px' }}>{fixture.BWFCScore} - {fixture.opponentScore}</span>
            <span style={{ width: '120px', textAlign: 'right' }}>{fixture.opponent}</span>
          </>
        ) : (
          <>
            <span style={{ width: '120px', textAlign: 'left' }}>{fixture.opponent}</span>
            <span style={{ fontSize: '20px' }}>{fixture.opponentScore} - {fixture.BWFCScore}</span>
            <span style={{ width: '120px', textAlign: 'right' }}>Bolton</span>
          </>
        )}
      </div>

      {/* Goal Scorers */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '10px',
        fontWeight: 'bold'
      }}>
        <div style={{ textDecoration: 'underline', marginBottom: '10px', fontSize: '18px' }}>
          Goal Scorers
        </div>
        {goalScorers.length > 0 ? (
          goalScorers.map((scorer, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {scorer}
            </div>
          ))
        ) : (
          <div>No goals scored</div>
        )}
      </div>

      {/* League stats or Cup match */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        fontWeight: 'bold'
      }}>
        {fixture.competition === "EFL League One" ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Cumulative points</span>
              <span>{fixture.BWFCCummulativePoints}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cumulative goal difference</span>
              <span>{fixture.BWFCGoalDifferenceCummulative}</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>Cup Match</div>
        )}
      </div>
    </div>
  );
}

export default FixtureDetail;