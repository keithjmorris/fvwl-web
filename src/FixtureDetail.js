import React, { useMemo } from 'react';

function FixtureDetail({ fixture, players = [], seasonMinutes = {}, isAuthenticated = false, onBack }) {

  // â”€â”€â”€ Cost calculation helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const parseMinute = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.replace(/'/g, '').trim();
    if (clean.includes('+')) {
      const parts = clean.split('+');
      return parseInt(parts[0]) + parseInt(parts[1]);
    }
    return parseInt(clean);
  };

  // Build playerRef -> overallTotal map
  const playerCostMap = useMemo(() => {
    const map = {};
    players.forEach(player => {
      if (player.forename && player.surname && player.overallTotal) {
        const ref = `${player.forename.charAt(0)}. ${player.surname}`;
        map[ref] = player.overallTotal;
      }
    });
    return map;
  }, [players]);

  const getFixtureCostBreakdown = () => {
    if (!fixture.result || fixture.result === '') return null;
    const entries = [];

    // Starters
    for (let i = 1; i <= 11; i++) {
      const p = fixture[`starter${i}`];
      if (!p || !p.trim()) continue;
      const name = p.trim();
      const overallTotal = playerCostMap[name];
      const totalSeasonMins = seasonMinutes[name];
      if (!overallTotal || !totalSeasonMins) continue;

      // Actual minutes played (stops at sub or red card)
      let actualMins = 90;
      for (let j = 1; j <= 5; j++) {
        if (fixture[`substitutedPlayer${j}`] && fixture[`substitutedPlayer${j}`].trim() === name) {
          const m = parseMinute(fixture[`substituteTime${j}`]);
          if (m !== null) actualMins = m;
          break;
        }
      }

      // Red card?
      let redCarded = false;
      for (let j = 1; j <= 2; j++) {
        if (fixture[`redCard${j}`] && fixture[`redCard${j}`].trim() === name) {
          const m = parseMinute(fixture[`redCardTime${j}`]);
          if (m !== null) { actualMins = m; redCarded = true; }
          break;
        }
      }

      // Cost mins: 90 if red card (club still pays), actual if substituted off
      const costMins = redCarded ? 90 : actualMins;
      const costPerMin = overallTotal / totalSeasonMins;
      const cost = costPerMin * costMins;

      entries.push({ name, role: 'Starter', actualMins, costMins, cost, redCarded });
    }

    // Substitutes
    for (let i = 1; i <= 5; i++) {
      const p = fixture[`substitute${i}`];
      if (!p || !p.trim()) continue;
      const name = p.trim();
      const overallTotal = playerCostMap[name];
      const totalSeasonMins = seasonMinutes[name];
      if (!overallTotal || !totalSeasonMins) continue;

      const onTime = parseMinute(fixture[`substituteTime${i}`]);
      const costMins = onTime !== null ? 90 - onTime : 0;
      const costPerMin = overallTotal / totalSeasonMins;
      const cost = costPerMin * costMins;

      entries.push({ name, role: 'Sub', actualMins: costMins, costMins, cost, redCarded: false });
    }

    const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);
    return entries.length > 0 ? { entries, totalCost } : null;
  };

  // â”€â”€â”€ Existing detail helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const getGoalsAndAssists = () => {
    const goals = [];
    for (let i = 1; i <= 8; i++) {
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

  const getStartingXI = () => {
    const starters = [];
    for (let i = 1; i <= 11; i++) {
      if (fixture[`starter${i}`]) starters.push({ player: fixture[`starter${i}`], position: i });
    }
    return starters;
  };

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

  const getCards = () => {
    const cards = [];
    for (let i = 1; i <= 6; i++) {
      if (fixture[`yellowCard${i}`]) cards.push({ type: 'Yellow Card', player: fixture[`yellowCard${i}`], time: fixture[`yellowCardTime${i}`] || 'Unknown time' });
    }
    for (let i = 1; i <= 2; i++) {
      if (fixture[`redCard${i}`]) cards.push({ type: 'Red Card', player: fixture[`redCard${i}`], time: fixture[`redCardTime${i}`] || 'Unknown time' });
    }
    return cards;
  };

  const getMatchAnalytics = () => {
    const analytics = {
      possession: fixture.possession || 0,
      xg: fixture.xg || 0,
      xga: fixture.xga || 0,
      shots: fixture.shots || 0,
      shotsOnTarget: fixture.shotsonTarget || 0,
      oppositionShots: fixture.oppositionShots || 0,
      oppositionShotsOnTarget: fixture.oppositionShotonTarget || 0,
      touchesOppositionBox: fixture.touchesOppositionBox || 0,
      touchesOurBox: fixture.touchesOurBox || 0,
    };
    analytics.shotAccuracy = analytics.shots > 0 ? Math.round((analytics.shotsOnTarget / analytics.shots) * 100) : 0;
    analytics.oppShotAccuracy = analytics.oppositionShots > 0 ? Math.round((analytics.oppositionShotsOnTarget / analytics.oppositionShots) * 100) : 0;
    analytics.possessionDominance = analytics.possession > 55 ? 'Dominant' : analytics.possession > 45 ? 'Balanced' : 'Low';
    const actualGoals = getGoalsAndAssists().length;
    analytics.xgPerformance = actualGoals > analytics.xg ? 'Overperformed' : actualGoals < analytics.xg ? 'Underperformed' : 'As Expected';
    return analytics;
  };

  const formatResult = (result, homeOrAway) => {
    if (!result) return 'Result unknown';
    const cleanResult = result.replace(/\s+/g, ' ').trim();
    return homeOrAway === 'Away' ? `${cleanResult} (Away)` : `${cleanResult} (Home)`;
  };

  const formatCost = (cost) => `£${Math.round(cost).toLocaleString()}`;

  const goals = getGoalsAndAssists();
  const startingXI = getStartingXI();
  const substitutions = getSubstitutions();
  const cards = getCards();
  const analytics = getMatchAnalytics();
  const costBreakdown = isAuthenticated ? getFixtureCostBreakdown() : null;

  const hasAnalytics = analytics.possession > 0 || analytics.xg > 0 ||
    analytics.shots > 0 || analytics.oppositionShots > 0 ||
    analytics.touchesOppositionBox > 0 || analytics.touchesOurBox > 0;

  const sectionHeader = (title) => (
    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#003f7f', marginBottom: '15px', borderBottom: '2px solid #003f7f', paddingBottom: '5px' }}>
      {title}
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>

      <button onClick={onBack} style={{ marginBottom: '20px', padding: '10px 20px', backgroundColor: '#003f7f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        &larr; Back to Fixtures
      </button>

      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#003f7f', textAlign: 'center', marginBottom: '10px' }}>
        {fixture.opponent}
      </div>
      <div style={{ fontSize: '18px', color: '#666', textAlign: 'center', marginBottom: '30px' }}>
        {fixture.date} &middot; {fixture.competition}
      </div>

      <div style={{ backgroundColor: '#003f7f', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center', fontSize: '20px' }}>
        {formatResult(fixture.result, fixture.homeOrAway)}
      </div>

      {/* Fixture Cost Breakdown . authenticated only */}
      {costBreakdown && (
        <div style={{ marginBottom: '30px' }}>
          {sectionHeader('Fixture Cost')}
          <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '15px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#856404', textAlign: 'center', marginBottom: '12px' }}>
              Total: {formatCost(costBreakdown.totalCost)}
            </div>
            {costBreakdown.entries.map((entry, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: idx < costBreakdown.entries.length - 1 ? '1px solid rgba(133,100,4,0.2)' : 'none',
                fontSize: '13px'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#003f7f' }}>{entry.name}</span>
                  <span style={{ color: '#666', marginLeft: '8px' }}>{entry.role}</span>
                  {entry.redCarded && (
                    <span style={{ color: '#c62828', marginLeft: '6px', fontSize: '11px' }}>(red card . charged 90 mins)</span>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#555', fontSize: '12px', marginRight: '10px' }}>{entry.actualMins} mins</span>
                  <span style={{ fontWeight: 'bold', color: '#856404' }}>{formatCost(entry.cost)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Analytics */}
      {hasAnalytics && (
        <div style={{ marginBottom: '30px' }}>
          {sectionHeader('Match Analytics')}

          {analytics.possession > 0 && (
            <div style={{ backgroundColor: '#f0f8ff', border: '1px solid #4682b4', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#003f7f' }}>Possession</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{analytics.possession}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${analytics.possession}%`, height: '100%', backgroundColor: analytics.possession > 50 ? '#4caf50' : '#ff9800' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px', textAlign: 'center' }}>{analytics.possessionDominance} possession</div>
            </div>
          )}

          {(analytics.xg > 0 || analytics.xga > 0) && (
            <div style={{ backgroundColor: '#fff8e1', border: '1px solid #ffa726', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6f00' }}>{analytics.xg}</div><div style={{ fontSize: '12px', color: '#666' }}>xG</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d32f2f' }}>{analytics.xga}</div><div style={{ fontSize: '12px', color: '#666' }}>xGA</div></div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: analytics.xgPerformance === 'Overperformed' ? '#4caf50' : analytics.xgPerformance === 'Underperformed' ? '#f44336' : '#666' }}>{analytics.xgPerformance}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>vs Expected</div>
                </div>
              </div>
            </div>
          )}

          {analytics.shots > 0 && (
            <div style={{ backgroundColor: '#f3e5f5', border: '1px solid #9c27b0', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '10px' }}>Bolton Shots</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7b1fa2' }}>{analytics.shots}</div><div style={{ fontSize: '12px', color: '#666' }}>Total Shots</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{analytics.shotsOnTarget}</div><div style={{ fontSize: '12px', color: '#666' }}>On Target</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{analytics.shotAccuracy}%</div><div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div></div>
              </div>
            </div>
          )}

          {analytics.oppositionShots > 0 && (
            <div style={{ backgroundColor: '#fde8e8', border: '1px solid #e57373', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#c62828', marginBottom: '10px' }}>Opposition Shots</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828' }}>{analytics.oppositionShots}</div><div style={{ fontSize: '12px', color: '#666' }}>Total Shots</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e53935' }}>{analytics.oppositionShotsOnTarget}</div><div style={{ fontSize: '12px', color: '#666' }}>On Target</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>{analytics.oppShotAccuracy}%</div><div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div></div>
              </div>
            </div>
          )}

          {(analytics.touchesOppositionBox > 0 || analytics.touchesOurBox > 0) && (
            <div style={{ backgroundColor: '#e8f5e9', border: '1px solid #66bb6a', borderRadius: '8px', padding: '15px', marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>Touches in Box</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'center' }}>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>{analytics.touchesOppositionBox}</div><div style={{ fontSize: '12px', color: '#666' }}>Bolton in Opp Box</div></div>
                <div><div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c62828' }}>{analytics.touchesOurBox}</div><div style={{ fontSize: '12px', color: '#666' }}>Opp in Our Box</div></div>
              </div>
            </div>
          )}
        </div>
      )}

      {goals.length > 0 && (
        <div>
          {sectionHeader(`Goals (${goals.length})`)}
          {goals.map((goal, index) => (
            <div key={index} style={{ backgroundColor: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#1976d2' }}>{goal.scorer}</div>
              {goal.assist && <div style={{ fontSize: '14px', color: '#666', marginTop: '2px' }}>Assist: {goal.assist}</div>}
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{goal.time}</div>
            </div>
          ))}
        </div>
      )}

      {startingXI.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          {sectionHeader('Starting XI')}
          <div style={{ backgroundColor: '#e8f5e8', border: '1px solid #4caf50', borderRadius: '8px', padding: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {startingXI.map((starter, index) => (
                <div key={index} style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold' }}>
                  {starter.position}. {starter.player}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {substitutions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          {sectionHeader(`Substitutions (${substitutions.length})`)}
          {substitutions.map((sub, index) => (
            <div key={index} style={{ backgroundColor: '#f3e5f5', border: '1px solid #9c27b0', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#7b1fa2' }}>{sub.playerIn} &rarr; {sub.playerOut}</div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{sub.time}</div>
            </div>
          ))}
        </div>
      )}

      {cards.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          {sectionHeader(`Disciplinary (${cards.length})`)}
          {cards.map((card, index) => (
            <div key={index} style={{
              backgroundColor: card.type === 'Red Card' ? '#f8d7da' : '#fff3cd',
              border: `1px solid ${card.type === 'Red Card' ? '#f5c6cb' : '#ffeaa7'}`,
              borderRadius: '8px', padding: '12px', marginBottom: '8px'
            }}>
              <div style={{ fontWeight: 'bold', color: card.type === 'Red Card' ? '#dc3545' : '#856404' }}>
                {card.type} &mdash; {card.player}
              </div>
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{card.time}</div>
            </div>
          ))}
        </div>
      )}

      {goals.length === 0 && startingXI.length === 0 && substitutions.length === 0 && cards.length === 0 && !hasAnalytics && !costBreakdown && (
        <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#6c757d', marginTop: '20px' }}>
          No detailed match information available for this fixture.
        </div>
      )}
    </div>
  );
}

export default FixtureDetail;