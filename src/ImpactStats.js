import React, { useState } from 'react';

const MINIMUM_APPEARANCES = 5;

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PlayerImpactDetail â€” self-contained, can be
// extracted to its own file later if needed
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PlayerImpactDetail({ playerRef, fixtures, onBack }) {
  const parseMinute = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.replace(/'/g, '').trim();
    if (clean.includes('+')) {
      const parts = clean.split('+');
      return parseInt(parts[0]) + parseInt(parts[1]);
    }
    return parseInt(clean);
  };

  const getGoalImportance = (scoringTeamGoals, concedingTeamGoals) => {
    const diff = scoringTeamGoals - concedingTeamGoals;
    if (diff <= 0) return 1;
    return 1 / (diff + 1);
  };

  const getGoalDescription = (scoringTeamGoals, concedingTeamGoals) => {
    const diff = scoringTeamGoals - concedingTeamGoals;
    if (scoringTeamGoals === 0 && concedingTeamGoals === 0) return 'opening goal';
    if (diff === -1) return 'equaliser';
    if (diff === 0) return 'going into the lead';
    if (diff < -1) return 'pulling one back';
    if (diff === 1) return 'extending lead';
    return 'extending lead further';
  };

  const calculatePlayerMinutesInFixture = (playerRef, fixture) => {
    let minutesStart = null;
    let minutesEnd = null;

    for (let i = 1; i <= 11; i++) {
      const starter = fixture[`starter${i}`];
      if (starter && starter.trim() === playerRef) {
        minutesStart = 0; minutesEnd = 90; break;
      }
    }
    for (let i = 1; i <= 5; i++) {
      const subOff = fixture[`substitutedPlayer${i}`];
      const subTime = fixture[`substituteTime${i}`];
      if (subOff && subOff.trim() === playerRef && subTime) {
        const minute = parseMinute(subTime);
        if (minute !== null) minutesEnd = minute;
        break;
      }
    }
    for (let i = 1; i <= 5; i++) {
      const subOn = fixture[`substitute${i}`];
      const subTime = fixture[`substituteTime${i}`];
      if (subOn && subOn.trim() === playerRef && subTime) {
        const minute = parseMinute(subTime);
        if (minute !== null) { minutesStart = minute; minutesEnd = 90; }
        break;
      }
    }
    for (let i = 1; i <= 2; i++) {
      const redCard = fixture[`redCard${i}`];
      const redCardTime = fixture[`redCardTime${i}`];
      if (redCard && redCard.trim().includes(playerRef) && redCardTime) {
        const minute = parseMinute(redCardTime);
        if (minute !== null) minutesEnd = minute;
        break;
      }
    }

    if (minutesStart === null) return null;
    return { start: minutesStart, end: minutesEnd, pitchEnd: minutesEnd === 90 ? 120 : minutesEnd };
  };

  const leagueFixtures = fixtures.filter(f =>
    f.competition === 'EFL League One' && f.result !== ''
  );

  const gameData = [];
  let totalPlusMinus = 0;
  let totalMinutes = 0;
  let appearances = 0;

  leagueFixtures.forEach(fixture => {
    const minuteRange = calculatePlayerMinutesInFixture(playerRef, fixture);
    if (!minuteRange) return;

    appearances++;
    const minutesPlayed = Math.min(minuteRange.end, 90) - minuteRange.start;
    totalMinutes += minutesPlayed;

    const bwfc = parseInt(fixture.BWFCScore);
    const opp = parseInt(fixture.opponentScore);
    const points = bwfc > opp ? 3 : bwfc === opp ? 1 : 0;
    const resultLabel = bwfc > opp ? 'W' : bwfc === opp ? 'D' : 'L';
    const resultColor = bwfc > opp ? '#2e7d32' : bwfc === opp ? '#e65100' : '#c62828';

    const goalEvents = [];
    for (let i = 1; i <= 8; i++) {
      const scorer = fixture[`scorer${i}`];
      if (scorer && scorer.trim() !== '') {
        const timeMatch = scorer.match(/\((\d+)'([+]\d+)?(?:pen|og)?\)/);
        if (timeMatch) {
          const minute = timeMatch[2]
            ? parseInt(timeMatch[1]) + parseInt(timeMatch[2].replace('+', ''))
            : parseInt(timeMatch[1]);
          goalEvents.push({ minute, team: 'bolton' });
        }
      }
    }
    for (let i = 1; i <= 5; i++) {
      const oppTime = fixture[`opponentGoalTime${i}`];
      if (oppTime && oppTime.trim() !== '') {
        const minute = parseMinute(oppTime);
        if (minute !== null) goalEvents.push({ minute, team: 'opponent' });
      }
    }
    goalEvents.sort((a, b) => a.minute - b.minute);

    let gamePlusMinus = 0;
    let boltonGoals = 0;
    let opponentGoals = 0;
    const annotatedGoals = [];

    goalEvents.forEach(event => {
      const playerOnPitch = event.minute >= minuteRange.start && event.minute <= minuteRange.pitchEnd;
      const scoringTeamGoals = event.team === 'bolton' ? boltonGoals : opponentGoals;
      const concedingTeamGoals = event.team === 'bolton' ? opponentGoals : boltonGoals;
      const importance = getGoalImportance(scoringTeamGoals, concedingTeamGoals);
      const description = getGoalDescription(scoringTeamGoals, concedingTeamGoals);
      const contribution = playerOnPitch ? (event.team === 'bolton' ? importance : -importance) : 0;
      if (playerOnPitch) gamePlusMinus += contribution;

      annotatedGoals.push({
        minute: event.minute, team: event.team,
        importance: parseFloat(importance.toFixed(2)),
        description, playerOnPitch,
        contribution: parseFloat(contribution.toFixed(2))
      });

      if (event.team === 'bolton') boltonGoals++;
      else opponentGoals++;
    });

    totalPlusMinus += gamePlusMinus;

    gameData.push({
      opponent: fixture.opponent, date: fixture.date, homeOrAway: fixture.homeOrAway,
      bwfc, opp, resultLabel, resultColor, points, minutesPlayed,
      gamePlusMinus: parseFloat(gamePlusMinus.toFixed(2)),
      annotatedGoals
    });
  });

  const per90 = totalMinutes > 0
    ? parseFloat(((totalPlusMinus / totalMinutes) * 90).toFixed(2))
    : 0;

  const getPMColor = (pm) => {
    if (pm > 0) return '#2e7d32';
    if (pm < 0) return '#c62828';
    return '#555';
  };

  const GoalBadge = ({ team }) => (
    <span style={{
      display: 'inline-block', padding: '1px 6px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 'bold', color: 'white',
      backgroundColor: team === 'bolton' ? '#003f7f' : '#c62828',
      minWidth: '36px', textAlign: 'center'
    }}>
      {team === 'bolton' ? 'BWFC' : 'OPP'}
    </span>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack} style={{
        marginBottom: '20px', padding: '8px 16px', backgroundColor: '#003f7f',
        color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
      }}>
        &larr; Back to Impact Stats
      </button>

      <h2 style={{ color: '#003f7f', marginBottom: '4px' }}>{playerRef}</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        EFL League One only &mdash; game by game breakdown
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Appearances', value: appearances, bg: '#dff0df', color: '#2e7d32' },
          { label: 'Total +/\u2212', value: totalPlusMinus > 0 ? `+${totalPlusMinus.toFixed(2)}` : totalPlusMinus.toFixed(2), bg: totalPlusMinus >= 0 ? '#dff0df' : '#fdecea', color: getPMColor(totalPlusMinus) },
          { label: '+/\u2212 per 90', value: per90 > 0 ? `+${per90}` : per90, bg: per90 >= 0 ? '#dff0df' : '#fdecea', color: getPMColor(per90) },
          { label: 'Minutes', value: totalMinutes, bg: '#f0f0f0', color: '#444' }
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: s.bg, borderRadius: '8px', padding: '12px 20px',
            textAlign: 'center', flex: 1, minWidth: '100px'
          }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {gameData.map((game, idx) => (
        <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '10px', marginBottom: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', backgroundColor: '#f5f8ff', borderBottom: '1px solid #ddd',
            flexWrap: 'wrap', gap: '8px'
          }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#003f7f', fontSize: '16px' }}>
                {game.homeOrAway === 'Home' ? '' : '@ '}{game.opponent}
              </span>
              <span style={{ color: '#777', fontSize: '13px', marginLeft: '10px' }}>{game.date}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: game.resultColor, color: 'white', borderRadius: '4px', padding: '2px 8px', fontWeight: 'bold', fontSize: '13px' }}>
                {game.resultLabel} {game.bwfc}&ndash;{game.opp}
              </span>
              <span style={{ fontSize: '13px', color: '#555' }}>{game.points} pt{game.points !== 1 ? 's' : ''}</span>
              <span style={{ fontSize: '13px', color: '#555' }}>{game.minutesPlayed} mins</span>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: getPMColor(game.gamePlusMinus) }}>
                {game.gamePlusMinus > 0 ? `+${game.gamePlusMinus}` : game.gamePlusMinus}
              </span>
            </div>
          </div>

          {game.annotatedGoals.length === 0 ? (
            <div style={{ padding: '10px 16px', fontSize: '13px', color: '#999' }}>No goals in this game</div>
          ) : (
            <div style={{ padding: '10px 16px' }}>
              {game.annotatedGoals.map((goal, gIdx) => (
                <div key={gIdx} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 0',
                  borderBottom: gIdx < game.annotatedGoals.length - 1 ? '1px solid #f0f0f0' : 'none',
                  opacity: goal.playerOnPitch ? 1 : 0.4
                }}>
                  <GoalBadge team={goal.team} />
                  <span style={{ fontSize: '13px', color: '#555', minWidth: '40px' }}>{goal.minute}&apos;</span>
                  <span style={{ fontSize: '13px', color: '#555', flex: 1 }}>{goal.description}</span>
                  <span style={{ fontSize: '12px', color: '#999', minWidth: '60px', textAlign: 'right' }}>weight {goal.importance}</span>
                  {goal.playerOnPitch ? (
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: getPMColor(goal.contribution), minWidth: '50px', textAlign: 'right' }}>
                      {goal.contribution > 0 ? `+${goal.contribution}` : goal.contribution}
                    </span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#aaa', minWidth: '50px', textAlign: 'right' }}>not on pitch</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ImpactStats â€” main component
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ImpactStats({ fixtures = [] }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const leagueFixtures = fixtures.filter(f =>
    f.competition === 'EFL League One' && f.result !== ''
  );

  const parseMinute = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.replace(/'/g, '').trim();
    if (clean.includes('+')) {
      const parts = clean.split('+');
      return parseInt(parts[0]) + parseInt(parts[1]);
    }
    return parseInt(clean);
  };

  const getGoalImportance = (scoringTeamGoals, concedingTeamGoals) => {
    const diff = scoringTeamGoals - concedingTeamGoals;
    if (diff <= 0) return 1;
    return 1 / (diff + 1);
  };

  const calculatePlayerMinutesInFixture = (playerRef, fixture) => {
    let minutesStart = null;
    let minutesEnd = null;

    for (let i = 1; i <= 11; i++) {
      const starter = fixture[`starter${i}`];
      if (starter && starter.trim() === playerRef) { minutesStart = 0; minutesEnd = 90; break; }
    }
    for (let i = 1; i <= 5; i++) {
      const subOff = fixture[`substitutedPlayer${i}`];
      const subTime = fixture[`substituteTime${i}`];
      if (subOff && subOff.trim() === playerRef && subTime) {
        const minute = parseMinute(subTime);
        if (minute !== null) minutesEnd = minute;
        break;
      }
    }
    for (let i = 1; i <= 5; i++) {
      const subOn = fixture[`substitute${i}`];
      const subTime = fixture[`substituteTime${i}`];
      if (subOn && subOn.trim() === playerRef && subTime) {
        const minute = parseMinute(subTime);
        if (minute !== null) { minutesStart = minute; minutesEnd = 90; }
        break;
      }
    }
    for (let i = 1; i <= 2; i++) {
      const redCard = fixture[`redCard${i}`];
      const redCardTime = fixture[`redCardTime${i}`];
      if (redCard && redCard.trim().includes(playerRef) && redCardTime) {
        const minute = parseMinute(redCardTime);
        if (minute !== null) minutesEnd = minute;
        break;
      }
    }

    if (minutesStart === null) return null;
    return { start: minutesStart, end: minutesEnd, pitchEnd: minutesEnd === 90 ? 120 : minutesEnd };
  };

  // Build player list from league fixtures
  const playerSet = new Set();
  leagueFixtures.forEach(fixture => {
    for (let i = 1; i <= 11; i++) {
      if (fixture[`starter${i}`]) playerSet.add(fixture[`starter${i}`].trim());
    }
    for (let i = 1; i <= 5; i++) {
      if (fixture[`substitute${i}`]) playerSet.add(fixture[`substitute${i}`].trim());
    }
  });
  const players = [...playerSet].sort();

  const calculatePlusMinus = (playerRef) => {
    let plusMinus = 0, appearances = 0, totalMinutes = 0;
    let pointsWhenPlaying = 0, pointsWhenNotPlaying = 0, gamesNotPlaying = 0;

    leagueFixtures.forEach(fixture => {
      const bwfc = parseInt(fixture.BWFCScore);
      const opp = parseInt(fixture.opponentScore);
      const points = bwfc > opp ? 3 : bwfc === opp ? 1 : 0;
      const minuteRange = calculatePlayerMinutesInFixture(playerRef, fixture);

      if (minuteRange) {
        appearances++;
        const minutesPlayed = Math.min(minuteRange.end, 90) - minuteRange.start;
        totalMinutes += minutesPlayed;
        pointsWhenPlaying += points;

        const goalEvents = [];
        for (let i = 1; i <= 8; i++) {
          const scorer = fixture[`scorer${i}`];
          if (scorer && scorer.trim() !== '') {
            const timeMatch = scorer.match(/\((\d+)'([+]\d+)?(?:pen|og)?\)/);
            if (timeMatch) {
              const minute = timeMatch[2]
                ? parseInt(timeMatch[1]) + parseInt(timeMatch[2].replace('+', ''))
                : parseInt(timeMatch[1]);
              goalEvents.push({ minute, team: 'bolton' });
            }
          }
        }
        for (let i = 1; i <= 5; i++) {
          const oppTime = fixture[`opponentGoalTime${i}`];
          if (oppTime && oppTime.trim() !== '') {
            const minute = parseMinute(oppTime);
            if (minute !== null) goalEvents.push({ minute, team: 'opponent' });
          }
        }
        goalEvents.sort((a, b) => a.minute - b.minute);

        let boltonGoals = 0, opponentGoals = 0;
        goalEvents.forEach(event => {
          const playerOnPitch = event.minute >= minuteRange.start && event.minute <= minuteRange.pitchEnd;
          if (event.team === 'bolton') {
            const importance = getGoalImportance(boltonGoals, opponentGoals);
            if (playerOnPitch) plusMinus += importance;
            boltonGoals++;
          } else {
            const importance = getGoalImportance(opponentGoals, boltonGoals);
            if (playerOnPitch) plusMinus -= importance;
            opponentGoals++;
          }
        });
      } else {
        pointsWhenNotPlaying += points;
        gamesNotPlaying++;
      }
    });

    const per90 = totalMinutes > 0 ? parseFloat(((plusMinus / totalMinutes) * 90).toFixed(2)) : 0;

    return {
      playerRef, appearances, totalMinutes,
      plusMinus: parseFloat(plusMinus.toFixed(2)),
      per90,
      pointsPerGamePlaying: appearances > 0 ? parseFloat((pointsWhenPlaying / appearances).toFixed(2)) : 0,
      pointsPerGameNotPlaying: gamesNotPlaying > 0 ? parseFloat((pointsWhenNotPlaying / gamesNotPlaying).toFixed(2)) : null,
      pointsDifference: appearances > 0 && gamesNotPlaying > 0
        ? parseFloat(((pointsWhenPlaying / appearances) - (pointsWhenNotPlaying / gamesNotPlaying)).toFixed(2))
        : null
    };
  };

  if (selectedPlayer) {
    return <PlayerImpactDetail playerRef={selectedPlayer} fixtures={fixtures} onBack={() => setSelectedPlayer(null)} />;
  }

  const playerStats = players
    .map(playerRef => calculatePlusMinus(playerRef))
    .filter(p => p.appearances >= MINIMUM_APPEARANCES)
    .sort((a, b) => b.appearances - a.appearances);

  const getDifferenceColor = (diff) => {
    if (diff === null) return '#555';
    if (diff > 0.5) return '#2e7d32';
    if (diff > 0) return '#7cb342';
    if (diff < -0.5) return '#c62828';
    if (diff < 0) return '#e53935';
    return '#555';
  };

  const getPlusMinusColor = (pm) => {
    if (pm > 3) return '#2e7d32';
    if (pm > 0) return '#7cb342';
    if (pm < -3) return '#c62828';
    if (pm < 0) return '#e53935';
    return '#555';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: '#003f7f', marginBottom: '8px' }}>Player Impact</h2>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        League games only. Minimum {MINIMUM_APPEARANCES} appearances.
        Plus/minus weighted by goal importance. Click a player for game-by-game detail.
      </p>

      <div style={{ backgroundColor: '#f0f8ff', border: '1px solid #4682b4', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#444' }}>
        <strong>How to read this:</strong> Plus/Minus shows the weighted goal difference
        while the player was on the pitch. <strong>+/&minus; per 90</strong> normalises this
        by minutes played, making players with different appearance counts directly comparable.
        Difference shows how many more points per game Bolton average with vs without this player.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 12px', backgroundColor: '#003f7f', borderRadius: '8px 8px 0 0', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
        <div>Player</div>
        <div style={{ textAlign: 'center' }}>Apps</div>
        <div style={{ textAlign: 'center' }}>+/&minus;</div>
        <div style={{ textAlign: 'center' }}>+/&minus; per 90</div>
        <div style={{ textAlign: 'center' }}>Pts/Game Playing</div>
        <div style={{ textAlign: 'center' }}>Pts/Game Not Playing</div>
        <div style={{ textAlign: 'center' }}>Difference</div>
      </div>

      {playerStats.map((p, index) => (
        <div key={p.playerRef} onClick={() => setSelectedPlayer(p.playerRef)}
          style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: '8px',
            padding: '12px', backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
            borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd',
            fontSize: '14px', alignItems: 'center', cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e8f0fe'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9f9f9'}
        >
          <div style={{ fontWeight: 'bold', color: '#003f7f', textDecoration: 'underline' }}>{p.playerRef}</div>
          <div style={{ textAlign: 'center' }}>{p.appearances}</div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: getPlusMinusColor(p.plusMinus) }}>
            {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
          </div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: getPlusMinusColor(p.per90) }}>
            {p.per90 > 0 ? `+${p.per90}` : p.per90}
          </div>
          <div style={{ textAlign: 'center' }}>{p.pointsPerGamePlaying}</div>
          <div style={{ textAlign: 'center' }}>{p.pointsPerGameNotPlaying !== null ? p.pointsPerGameNotPlaying : '\u2014'}</div>
          <div style={{ textAlign: 'center', fontWeight: 'bold', color: getDifferenceColor(p.pointsDifference) }}>
            {p.pointsDifference !== null ? (p.pointsDifference > 0 ? `+${p.pointsDifference}` : p.pointsDifference) : '\u2014'}
          </div>
        </div>
      ))}

      {playerStats.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666', backgroundColor: '#fff', border: '1px solid #ddd' }}>
          No players found with {MINIMUM_APPEARANCES} or more league appearances.
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
        Goal importance weighting: a goal that changes the match outcome is worth 1.0.
        A goal that extends an existing lead is worth 1/2, 1/3 etc.
        Per 90 minutes played, capped at 90 per game.
      </div>
    </div>
  );
}

export default ImpactStats;