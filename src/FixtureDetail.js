import React from 'react';

function FixtureDetail({ fixture, onBack }) {
  // Parse goals and assists
  const getGoalsAndAssists = () => {
    const goals = [];
    for (let i = 1; i <= 6; i++) {
      if (fixture[`scorer${i}`]) {
        goals.push({
          scorer: fixture[`scorer${i}`],
          assist: fixture[`assist${i}`] || null,
          time: fixture[`goalTime${i}`] || 'Unknown time'
        });
      }
    }
    return goals;
  };

  // Get starting XI
  const getStartingXI = () => {
    const starters = [];
    for (let i = 1; i <= 11; i++) {
      if (fixture[`starter${i}`]) {
        starters.push({
          player: fixture[`starter${i}`],
          position: i
        });
      }
    }
    return starters;
  };

  // Get substitutions
  const getSubstitutions = () => {
    const substitutions = [];
    for (let i = 1; i <= 5; i++) {
      if (fixture[`substitute${i}`] && fixture[`substitutedPlayer${i}`]) {
        substitutions.push({
          playerIn: fixture[`substitute${i}`],
          playerOut: fixture[`substitutedPlayer${i}`],
          time: fixture[`substituteTime${i}`] || 'Unknown time'
        });
      }
    }
    return substitutions;
  };

  // Get cards
  const getCards = () => {
    const cards = [];
    
    // Yellow cards
    for (let i = 1; i <= 6; i++) {
      if (fixture[`yellowCard${i}`]) {
        cards.push({
          type: 'Yellow Card',
          player: fixture[`yellowCard${i}`],
          time: fixture[`yellowCardTime${i}`] || 'Unknown time'
        });
      }
    }
    
    // Red cards
    for (let i = 1; i <= 2; i++) {
      if (fixture[`redCard${i}`]) {
        cards.push({
          type: 'Red Card',
          player: fixture[`redCard${i}`],
          time: fixture[`redCardTime${i}`] || 'Unknown time'
        });
      }
    }
    
    return cards;
  };

  // Get match analytics
  const getMatchAnalytics = () => {
    const analytics = {
      possession: fixture.possession || 0,
      xg: fixture.xg || 0,
      xga: fixture.xga || 0,
      shots: fixture.shots || 0,
      shotsOnTarget: fixture.shotsonTarget || 0
    };
    
    // Calculate shot accuracy
    analytics.shotAccuracy = analytics.shots > 0 ? 
      Math.round((analytics.shotsOnTarget / analytics.shots) * 100) : 0;
    
    // Determine possession dominance
    analytics.possessionDominance = analytics.possession > 55 ? 'Dominant' :
                                  analytics.possession > 45 ? 'Balanced' : 'Low';
    
    // Calculate xG performance (actual goals vs expected)
    const actualGoals = getGoalsAndAssists().length;
    analytics.xgPerformance = actualGoals > analytics.xg ? 'Overperformed' :
                            actualGoals < analytics.xg ? 'Underperformed' : 'As Expected';
    
    return analytics;
  };

  const formatResult = (result, homeOrAway) => {
    if (!result) return 'Result unknown';
    
    let cleanResult = result.replace(/\s+/g, ' ').trim();
    
    if (homeOrAway === 'Away') {
      return `${cleanResult} (Away)`;
    } else {
      return `${cleanResult} (Home)`;
    }
  };

  const goals = getGoalsAndAssists();
  const startingXI = getStartingXI();
  const substitutions = getSubstitutions();
  const cards = getCards();
  const analytics = getMatchAnalytics();

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
        ←Back to Fixtures
      </button>

      {/* Match header */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#003f7f',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        {fixture.opponent}
      </div>

      <div style={{
        fontSize: '18px',
        color: '#666',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {fixture.date} . {fixture.competition}
      </div>

      {/* Match Result */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '20px'
      }}>
        {formatResult(fixture.result, fixture.homeOrAway)}
      </div>

      {/* Match Analytics */}
      {(analytics.possession > 0 || analytics.xg > 0 || analytics.shots > 0) && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Match Analytics
          </div>
          
          {/* Possession */}
          <div style={{
            backgroundColor: '#f0f8ff',
            border: '1px solid #4682b4',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#003f7f' }}>Possession</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{analytics.possession}%</span>
            </div>
            
            {/* Possession bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${analytics.possession}%`,
                height: '100%',
                backgroundColor: analytics.possession > 50 ? '#4caf50' : '#ff9800',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>
              {analytics.possessionDominance} possession
            </div>
          </div>

          {/* xG Performance */}
          <div style={{
            backgroundColor: '#fff8e1',
            border: '1px solid #ffa726',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6f00' }}>{analytics.xg}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>xG</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>{analytics.xga}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>xGA</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: analytics.xgPerformance === 'Overperformed' ? '#4caf50' : 
                                                                        analytics.xgPerformance === 'Underperformed' ? '#f44336' : '#666' }}>
                  {analytics.xgPerformance}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>vs Expected</div>
              </div>
            </div>
          </div>

          {/* Shots */}
          <div style={{
            backgroundColor: '#f3e5f5',
            border: '1px solid #9c27b0',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>{analytics.shots}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Shots</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{analytics.shotsOnTarget}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>On Target</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{analytics.shotAccuracy}%</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goals and Assists */}
      {goals.length > 0 && (
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Goals ({goals.length})
          </div>
          
          {goals.map((goal, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                    ⚽ {goal.scorer}
                  </div>
                  {goal.assist && (
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>
                      Assist: {goal.assist}
                    </div>
                  )}
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {goal.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Starting XI */}
      {startingXI.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Starting XI
          </div>
          
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '15px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px'
            }}>
              {startingXI.map((starter, index) => (
                <div key={index} style={{ 
                  fontSize: '14px', 
                  color: '#2e7d32',
                  fontWeight: 'bold'
                }}>
                  {starter.position}. {starter.player}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Substitutions */}
      {substitutions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Substitutions ({substitutions.length})
          </div>
          
          {substitutions.map((sub, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#f3e5f5',
                border: '1px solid #9c27b0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                     {sub.playerIn} 🔄 {sub.playerOut}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {sub.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {cards.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#003f7f',
            marginBottom: '15px',
            borderBottom: '2px solid #003f7f',
            paddingBottom: '5px'
          }}>
            Disciplinary ({cards.length})
          </div>
          
          {cards.map((card, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: card.type === 'Red Card' ? '#f8d7da' : '#fff3cd',
                border: `1px solid ${card.type === 'Red Card' ? '#f5c6cb' : '#ffeaa7'}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: card.type === 'Red Card' ? '#dc3545' : '#856404'
                  }}>
                    {card.type === 'Red Card' ? '🟥' : '🟨'} {card.type} - {card.player}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {card.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No events message */}
      {goals.length === 0 && startingXI.length === 0 && substitutions.length === 0 && cards.length === 0 && 
       analytics.possession === 0 && analytics.xg === 0 && analytics.shots === 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          color: '#6c757d',
          marginTop: '20px'
        }}>
          No detailed match information available for this fixture.
        </div>
      )}
    </div>
  );
}

export default FixtureDetail;