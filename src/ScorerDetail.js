import React from 'react';

function ScorerDetail({ playerRef, fixtures = [], onBack }) {

  const competitionGroups = [
    { key: 'EFL League One', label: 'League' },
    { key: 'FA Cup', label: 'FA Cup' },
    { key: 'Caraboa League Cup', label: 'EFL Cup' },
    { key: 'EFL Trophy', label: 'EFL Trophy' },
    { key: 'Vertu EFL Trophy', label: 'EFL Trophy' },
  ];

  // Build a list of every goal this player scored, grouped by competition
  const buildGoalList = () => {
    const goalsByCompetition = {};

    fixtures.forEach(fixture => {
      for (let i = 1; i <= 8; i++) {
        const scorer = fixture[`scorer${i}`];
        if (!scorer || scorer.trim() === '') continue;

        const playerRefInScorer = scorer.split('(')[0].trim();
        if (playerRefInScorer !== playerRef) continue;

        // Find all goal times in this scorer entry
        const timeMatches = [...scorer.matchAll(/\((\d+)'([+]\d+)?(?:pen|og)?\)/g)];
        if (timeMatches.length === 0) continue;

        const competition = fixture.competition || 'Unknown';
        if (!goalsByCompetition[competition]) {
          goalsByCompetition[competition] = [];
        }

        timeMatches.forEach(match => {
          const minute = match[2]
            ? parseInt(match[1]) + parseInt(match[2].replace('+', ''))
            : parseInt(match[1]);
          const isPen = scorer.includes('pen');
          const isOg = scorer.includes('og');

          goalsByCompetition[competition].push({
            opponent: fixture.opponent,
            date: fixture.date,
            homeOrAway: fixture.homeOrAway,
            minute,
            isPen,
            isOg,
            result: `${fixture.BWFCScore}-${fixture.opponentScore}`
          });
        });
      }
    });

    return goalsByCompetition;
  };

  const goalsByCompetition = buildGoalList();

  // Calculate totals
  const totalGoals = Object.values(goalsByCompetition).reduce((sum, goals) => sum + goals.length, 0);

  // Merge EFL Trophy variants
  const leagueGoals = (goalsByCompetition['EFL League One'] || []).length;
  const faCupGoals = (goalsByCompetition['FA Cup'] || []).length;
  const eflCupGoals = (goalsByCompetition['Caraboa League Cup'] || []).length;
  const eflTrophyGoals = (goalsByCompetition['EFL Trophy'] || []).length +
    (goalsByCompetition['Vertu EFL Trophy'] || []).length;

  // All goal entries for game-by-game display, merging trophy variants
  const allCompetitions = [
    { label: 'League', goals: goalsByCompetition['EFL League One'] || [] },
    { label: 'FA Cup', goals: goalsByCompetition['FA Cup'] || [] },
    { label: 'EFL Cup', goals: goalsByCompetition['Caraboa League Cup'] || [] },
    {
      label: 'EFL Trophy',
      goals: [
        ...(goalsByCompetition['EFL Trophy'] || []),
        ...(goalsByCompetition['Vertu EFL Trophy'] || [])
      ]
    },
  ].filter(c => c.goals.length > 0);

  const goalTypeLabel = (goal) => {
    if (goal.isPen) return ' (pen)';
    if (goal.isOg) return ' (og)';
    return '';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>

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
        &larr; Back to Scorers
      </button>

      {/* Player name */}
      <div style={{
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#003f7f',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {playerRef}
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
        <span>Total Goals</span>
        <span>{totalGoals}</span>
      </div>

      {/* Goal breakdown by competition */}
      <div style={{
        backgroundColor: '#003f7f',
        color: 'white',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>League</span>
          <span>{leagueGoals}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>FA Cup</span>
          <span>{faCupGoals}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>EFL Cup</span>
          <span>{eflCupGoals}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>EFL Trophy</span>
          <span>{eflTrophyGoals}</span>
        </div>
      </div>

      {/* Game-by-game breakdown per competition */}
      {allCompetitions.map(comp => (
        <div key={comp.label} style={{
          backgroundColor: '#003f7f',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          <div style={{ color: '#ffc107', marginBottom: '10px', fontSize: '16px' }}>
            {comp.label}
          </div>
          {comp.goals.map((goal, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: idx < comp.goals.length - 1 ? '8px' : '0',
              paddingBottom: idx < comp.goals.length - 1 ? '8px' : '0',
              borderBottom: idx < comp.goals.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>
                  {goal.homeOrAway === 'Home' ? '' : '@ '}{goal.opponent}
                </span>
                <span style={{ color: '#ccc', marginLeft: '8px', fontSize: '12px' }}>
                  {goal.date}
                </span>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                <span>{goal.minute}&apos;{goalTypeLabel(goal)}</span>
                <span style={{ color: '#ccc', marginLeft: '8px', fontSize: '12px' }}>
                  ({goal.result})
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}

    </div>
  );
}

export default ScorerDetail;