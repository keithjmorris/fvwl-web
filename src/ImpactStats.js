import React, { useState, useEffect } from 'react';

const MINIMUM_APPEARANCES = 5;

function ImpactStats() {
  const [fixtures, setFixtures] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75/latest', {
          headers: { 'X-Master-Key': '$2a$10$VTMAZsuNJaZxXb2dEFdOheJXXwRGD7GJj7e5vRp9jKvHqF51SN29e' }
        });
        const data = await response.json();
        const leagueFixtures = data.record.filter(f =>
          f.competition === 'EFL League One' &&
          f.result !== ''
        );
        setFixtures(leagueFixtures);

        const playerSet = new Set();
        leagueFixtures.forEach(fixture => {
          for (let i = 1; i <= 11; i++) {
            if (fixture[`starter${i}`]) playerSet.add(fixture[`starter${i}`].trim());
          }
          for (let i = 1; i <= 5; i++) {
            if (fixture[`substitute${i}`]) playerSet.add(fixture[`substitute${i}`].trim());
          }
        });
        setPlayers([...playerSet].sort());
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      if (starter && starter.trim() === playerRef) {
        minutesStart = 0;
        minutesEnd = 90;
        break;
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
        if (minute !== null) {
          minutesStart = minute;
          minutesEnd = 90;
        }
        break;
      }
    }

    if (minutesStart === null) return null;
    return {
      start: minutesStart,
      end: minutesEnd,
      pitchEnd: minutesEnd === 90 ? 120 : minutesEnd
    };
  };

  const calculatePlusMinus = (playerRef) => {
    let plusMinus = 0;
    let appearances = 0;
    let totalMinutes = 0;
    let pointsWhenPlaying = 0;
    let pointsWhenNotPlaying = 0;
    let gamesNotPlaying = 0;

    fixtures.forEach(fixture => {
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

        let boltonGoals = 0;
        let opponentGoals = 0;

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

    const per90 = totalMinutes > 0
      ? parseFloat(((plusMinus / totalMinutes) * 90).toFixed(2))
      : 0;

    return {
      playerRef,
      appearances,
      totalMinutes,
      plusMinus: parseFloat(plusMinus.toFixed(2)),
      per90,
      pointsPerGamePlaying: appearances > 0
        ? parseFloat((pointsWhenPlaying / appearances).toFixed(2))
        : 0,
      pointsPerGameNotPlaying: gamesNotPlaying > 0
        ? parseFloat((pointsWhenNotPlaying / gamesNotPlaying).toFixed(2))
        : null,
      pointsDifference: appearances > 0 && gamesNotPlaying > 0
        ? parseFloat(((pointsWhenPlaying / appearances) - (pointsWhenNotPlaying / gamesNotPlaying)).toFixed(2))
        : null
    };
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading impact stats...</div>;

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
        Plus/minus weighted by goal importance.
      </p>

      <div style={{
        backgroundColor: '#f0f8ff',
        border: '1px solid #4682b4',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '13px',
        color: '#444'
      }}>
        <strong>How to read this:</strong> Plus/Minus shows the weighted goal difference
        while the player was on the pitch. <strong>+/− per 90</strong> normalises this
        by minutes played, making players with different appearance counts directly
        comparable. Difference shows how many more points per game Bolton average
        with vs without this player.
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gap: '8px',
        padding: '10px 12px',
        backgroundColor: '#003f7f',
        borderRadius: '8px 8px 0 0',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        <div>Player</div>
        <div style={{ textAlign: 'center' }}>Apps</div>
        <div style={{ textAlign: 'center' }}>+/−</div>
        <div style={{ textAlign: 'center' }}>+/− per 90</div>
        <div style={{ textAlign: 'center' }}>Pts/Game Playing</div>
        <div style={{ textAlign: 'center' }}>Pts/Game Not Playing</div>
        <div style={{ textAlign: 'center' }}>Difference</div>
      </div>

      {playerStats.map((p, index) => (
        <div key={p.playerRef} style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '8px',
          padding: '12px',
          backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
          borderLeft: '1px solid #ddd',
          borderRight: '1px solid #ddd',
          borderBottom: '1px solid #ddd',
          fontSize: '14px',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 'bold', color: '#003f7f' }}>{p.playerRef}</div>
          <div style={{ textAlign: 'center' }}>{p.appearances}</div>
          <div style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: getPlusMinusColor(p.plusMinus)
          }}>
            {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
          </div>
          <div style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: getPlusMinusColor(p.per90)
          }}>
            {p.per90 > 0 ? `+${p.per90}` : p.per90}
          </div>
          <div style={{ textAlign: 'center' }}>{p.pointsPerGamePlaying}</div>
          <div style={{ textAlign: 'center' }}>
            {p.pointsPerGameNotPlaying !== null ? p.pointsPerGameNotPlaying : '—'}
          </div>
          <div style={{
            textAlign: 'center',
            fontWeight: 'bold',
            color: getDifferenceColor(p.pointsDifference)
          }}>
            {p.pointsDifference !== null
              ? (p.pointsDifference > 0 ? `+${p.pointsDifference}` : p.pointsDifference)
              : '—'}
          </div>
        </div>
      ))}

      {playerStats.length === 0 && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: '#fff',
          border: '1px solid #ddd'
        }}>
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