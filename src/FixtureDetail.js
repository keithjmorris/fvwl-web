import React from 'react';

function FixtureDetail({ fixture, onBack }) {
  const getGoalDetails = () => {
    const goals = [];
    
    // Build arrays of all scorers and assists first
    const allScorers = [];
    const allAssists = [];
    
    for (let i = 1; i <= 8; i++) {
      const scorer = fixture[`scorer${i}`];
      const assist = fixture[`assist${i}`];
      
      if (scorer && scorer !== "0" && scorer !== "") {
        allScorers.push(scorer);
        allAssists.push(assist || "");
      }
    }

    // Process the arrays without any loop variables
    let currentAssistIndex = 0;
    
    allScorers.forEach((scorer) => {
      const nameMatch = scorer.match(/^([^(]+)/);
      const playerName = nameMatch ? nameMatch[1].trim() : scorer;
      
      const timeMatches = scorer.match(/\(([^)]+)\)/);
      if (timeMatches) {
        const times = timeMatches[1].split(',').map(time => time.trim());
        
        times.forEach((time) => {
          const assist = allAssists[currentAssistIndex];
          goals.push({
            player: playerName,
            time: time,
            assist: assist && assist !== "0" && assist !== "" ? assist : null
          });
          currentAssistIndex++;
        });
      } else {
        const assist = allAssists[currentAssistIndex];
        goals.push({
          player: playerName,
          time: '',
          assist: assist && assist !== "0" && assist !== "" ? assist : null
        });
        currentAssistIndex++;
      }
    });

    return goals;
  };

  const goalDetails = getGoalDetails();

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
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
        {goalDetails.length > 0 ? (
          goalDetails.map((goal, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '16px' }}>
                {goal.player} ({goal.time})
              </div>
              {goal.assist && (
                <div style={{ fontSize: '14px', color: '#ffc107', marginLeft: '15px' }}>
                  Assist: {goal.assist}
                </div>
              )}
            </div>
          ))
        ) : (
          <div>No goals scored</div>
        )}
      </div>

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