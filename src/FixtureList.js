import React, { useState, useMemo } from 'react';
import FixtureDetail from './FixtureDetail';

function FixtureList({ fixtures = [], players = [], isAuthenticated = false }) {
  const [searchText, setSearchText] = useState('');
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [competitionFilter, setCompetitionFilter] = useState('EFL League One');

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

  // Calculate total season minutes for each player across all played fixtures
  // Uses actual minutes â€” red card stops the clock for the player
  const playerSeasonMinutes = useMemo(() => {
    const minuteMap = {};
    const allPlayed = fixtures.filter(f => f.result && f.result !== '');

    allPlayed.forEach(fixture => {
      // Starters
      for (let i = 1; i <= 11; i++) {
        const p = fixture[`starter${i}`];
        if (!p || !p.trim()) continue;
        const name = p.trim();
        let mins = 90;

        // Substituted off?
        for (let j = 1; j <= 5; j++) {
          if (fixture[`substitutedPlayer${j}`] && fixture[`substitutedPlayer${j}`].trim() === name) {
            const m = parseMinute(fixture[`substituteTime${j}`]);
            if (m !== null) mins = m;
            break;
          }
        }

        // Red card?
        for (let j = 1; j <= 2; j++) {
          if (fixture[`redCard${j}`] && fixture[`redCard${j}`].trim() === name) {
            const m = parseMinute(fixture[`redCardTime${j}`]);
            if (m !== null) mins = m;
            break;
          }
        }

        minuteMap[name] = (minuteMap[name] || 0) + mins;
      }

      // Substitutes
      for (let i = 1; i <= 5; i++) {
        const p = fixture[`substitute${i}`];
        if (!p || !p.trim()) continue;
        const name = p.trim();
        const onTime = parseMinute(fixture[`substituteTime${i}`]);
        const mins = onTime !== null ? 90 - onTime : 0;
        minuteMap[name] = (minuteMap[name] || 0) + mins;
      }
    });

    return minuteMap;
  }, [fixtures]);

  // Build a lookup of playerRef -> overallTotal from squad data
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

  // Calculate cost for a single fixture
  // For cost purposes: starters who received a red card still count as 90 mins
  const calculateFixtureCost = (fixture) => {
    if (!fixture.result || fixture.result === '') return null;
    let totalCost = 0;
    let playerCount = 0;

    // Starters
    for (let i = 1; i <= 11; i++) {
      const p = fixture[`starter${i}`];
      if (!p || !p.trim()) continue;
      const name = p.trim();
      const overallTotal = playerCostMap[name];
      const seasonMins = playerSeasonMinutes[name];
      if (!overallTotal || !seasonMins) continue;

      // Substituted off reduces cost mins; red card does NOT (club still pays)
      let costMins = 90;
      for (let j = 1; j <= 5; j++) {
        if (fixture[`substitutedPlayer${j}`] && fixture[`substitutedPlayer${j}`].trim() === name) {
          const m = parseMinute(fixture[`substituteTime${j}`]);
          if (m !== null) costMins = m;
          break;
        }
      }

      const costPerMin = overallTotal / seasonMins;
      totalCost += costPerMin * costMins;
      playerCount++;
    }

    // Substitutes
    for (let i = 1; i <= 5; i++) {
      const p = fixture[`substitute${i}`];
      if (!p || !p.trim()) continue;
      const name = p.trim();
      const overallTotal = playerCostMap[name];
      const seasonMins = playerSeasonMinutes[name];
      if (!overallTotal || !seasonMins) continue;

      const onTime = parseMinute(fixture[`substituteTime${i}`]);
      const costMins = onTime !== null ? 90 - onTime : 0;
      const costPerMin = overallTotal / seasonMins;
      totalCost += costPerMin * costMins;
      playerCount++;
    }

    return playerCount > 0 ? totalCost : null;
  };

  // â”€â”€â”€ Summary calculation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const calculateSummary = (fixturesToSummarise) => {
    const playedFixtures = fixturesToSummarise.filter(f => f.result && f.result !== '');

    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0, cleanSheets = 0;
    let totalShots = 0, shotsCount = 0;
    let totalShotsonTarget = 0, shotsonTargetCount = 0;
    let totalOppShots = 0, oppShotsCount = 0;
    let totalOppShotsOnTarget = 0, oppShotsOnTargetCount = 0;
    let totalTouchesOppBox = 0, touchesOppBoxCount = 0;
    let totalTouchesOurBox = 0, touchesOurBoxCount = 0;
    let totalXg = 0, xgCount = 0;
    let totalXga = 0, xgaCount = 0;
    let leaguePosition = null;
    let totalFixtureCost = 0, fixtureCostCount = 0;

    playedFixtures.forEach(fixture => {
      const bwfc = parseInt(fixture.BWFCScore);
      const opp = parseInt(fixture.opponentScore);

      if (!isNaN(bwfc) && !isNaN(opp)) {
        goalsFor += bwfc;
        goalsAgainst += opp;
        if (opp === 0) cleanSheets++;
        if (bwfc > opp) wins++;
        else if (bwfc === opp) draws++;
        else losses++;
      }

      if (fixture.shots && fixture.shots !== '') { totalShots += parseFloat(fixture.shots); shotsCount++; }
      if (fixture.shotsonTarget && fixture.shotsonTarget !== '') { totalShotsonTarget += parseFloat(fixture.shotsonTarget); shotsonTargetCount++; }
      if (fixture.oppositionShots && fixture.oppositionShots !== '') { totalOppShots += parseFloat(fixture.oppositionShots); oppShotsCount++; }
      if (fixture.oppositionShotonTarget && fixture.oppositionShotonTarget !== '') { totalOppShotsOnTarget += parseFloat(fixture.oppositionShotonTarget); oppShotsOnTargetCount++; }
      if (fixture.touchesOppositionBox && fixture.touchesOppositionBox !== '') { totalTouchesOppBox += parseFloat(fixture.touchesOppositionBox); touchesOppBoxCount++; }
      if (fixture.touchesOurBox && fixture.touchesOurBox !== '') { totalTouchesOurBox += parseFloat(fixture.touchesOurBox); touchesOurBoxCount++; }
      if (fixture.xg && fixture.xg !== '') { totalXg += parseFloat(fixture.xg); xgCount++; }
      if (fixture.xga && fixture.xga !== '') { totalXga += parseFloat(fixture.xga); xgaCount++; }
      if (fixture.leaguePosition && fixture.leaguePosition !== '') { leaguePosition = fixture.leaguePosition; }

      if (isAuthenticated) {
        const cost = calculateFixtureCost(fixture);
        if (cost !== null) { totalFixtureCost += cost; fixtureCostCount++; }
      }
    });

    const points = (wins * 3) + draws;
    const gamesPlayed = wins + draws + losses;

    return {
      wins, draws, losses, gamesPlayed,
      goalsFor, goalsAgainst, cleanSheets, points,
      pointsPerGame: gamesPlayed > 0 ? (points / gamesPlayed).toFixed(2) : '0.00',
      avgShots: shotsCount > 0 ? (totalShots / shotsCount).toFixed(1) : 'N/A',
      avgShotsonTarget: shotsonTargetCount > 0 ? (totalShotsonTarget / shotsonTargetCount).toFixed(1) : 'N/A',
      avgOppShots: oppShotsCount > 0 ? (totalOppShots / oppShotsCount).toFixed(1) : 'N/A',
      avgOppShotsOnTarget: oppShotsOnTargetCount > 0 ? (totalOppShotsOnTarget / oppShotsOnTargetCount).toFixed(1) : 'N/A',
      avgTouchesOppBox: touchesOppBoxCount > 0 ? (totalTouchesOppBox / touchesOppBoxCount).toFixed(1) : 'N/A',
      avgTouchesOurBox: touchesOurBoxCount > 0 ? (totalTouchesOurBox / touchesOurBoxCount).toFixed(1) : 'N/A',
      avgXg: xgCount > 0 ? (totalXg / xgCount).toFixed(2) : 'N/A',
      avgXga: xgaCount > 0 ? (totalXga / xgaCount).toFixed(2) : 'N/A',
      leaguePosition,
      avgFixtureCost: fixtureCostCount > 0 ? totalFixtureCost / fixtureCostCount : null,
      totalFixtureCost: fixtureCostCount > 0 ? totalFixtureCost : null
    };
  };

  const filteredFixtures = fixtures.filter(fixture => {
    const matchesSearch = searchText === '' || fixture.opponent.toLowerCase().includes(searchText.toLowerCase());
    const matchesCompetition = competitionFilter === 'All' || fixture.competition === competitionFilter;
    return matchesSearch && matchesCompetition;
  });

  const summary = calculateSummary(filteredFixtures);
  const isLeague = competitionFilter === 'EFL League One';

  const getResultColor = (fixture) => {
    if (!fixture.result) return '#999';
    if (fixture.BWFCScore > fixture.opponentScore) return '#28a745';
    if (fixture.BWFCScore === fixture.opponentScore) return '#ffc107';
    return '#dc3545';
  };

  const getHomeAwayColor = (homeOrAway) => homeOrAway === 'Home' ? '#ffffff' : '#ffc107';
  const formatCost = (cost) => `£${Math.round(cost).toLocaleString()}`;

  if (selectedFixture) {
    return (
      <FixtureDetail
        fixture={selectedFixture}
        players={players}
        seasonMinutes={playerSeasonMinutes}
        isAuthenticated={isAuthenticated}
        onBack={() => setSelectedFixture(null)}
      />
    );
  }

  const statTile = (value, label, bg, color) => (
    <div key={label} style={{
      backgroundColor: bg, borderRadius: '8px', padding: '10px 8px',
      textAlign: 'center', flex: 1, minWidth: '70px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img src="/bwfc.png" alt="BWFC" style={{ width: '50px', height: '50px', marginRight: '15px' }}
          onError={(e) => { e.target.style.display = 'none'; }} />
        <h1 style={{ color: '#003f7f', margin: 0 }}>Fixtures</h1>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Enter opponent name here" value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px', border: '2px solid #003f7f', borderRadius: '5px', fontSize: '16px' }}
        />
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontWeight: 'bold', color: '#003f7f', fontSize: '14px' }}>Filter by competition:</label>
        <select value={competitionFilter} onChange={(e) => setCompetitionFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}>
          <option value="All">All Competitions</option>
          <option value="EFL League One">EFL League One</option>
          <option value="Carabao League Cup">Carabao League Cup</option>
          <option value="Vertu EFL Trophy">Vertu EFL Trophy</option>
          <option value="FA Cup">FA Cup</option>
        </select>
      </div>

      {/* Summary Box */}
      <div style={{ border: '2px solid #4682b4', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', backgroundColor: '#fff' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#003f7f', marginBottom: '14px' }}>
          Season Summary {competitionFilter !== 'All' ? `â€” ${competitionFilter}` : 'â€” All Competitions'}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { value: summary.gamesPlayed, label: 'Played', bg: '#f0f0f0', color: '#444' },
            { value: summary.wins, label: 'Wins', bg: '#dff0df', color: '#2e7d32' },
            { value: summary.draws, label: 'Draws', bg: '#f0f0f0', color: '#444' },
            { value: summary.losses, label: 'Losses', bg: '#fde8e8', color: '#c62828' },
            { value: summary.goalsFor, label: 'Goals For', bg: '#ddeeff', color: '#1976d2' },
            { value: summary.goalsAgainst, label: 'Goals Against', bg: '#fde8e8', color: '#c62828' },
            { value: summary.cleanSheets, label: 'Clean Sheets', bg: '#dff0df', color: '#2e7d32' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>
        {isLeague && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {[
              { value: summary.points, label: 'Points', bg: '#ddeeff', color: '#1976d2' },
              { value: summary.pointsPerGame, label: 'Pts/Game', bg: '#ddeeff', color: '#1976d2' },
              { value: summary.leaguePosition || 'N/A', label: 'Position', bg: '#fdefd4', color: '#e65100' },
            ].map(item => statTile(item.value, item.label, item.bg, item.color))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { value: summary.avgShots, label: 'Avg Shots', bg: '#f3e8f8', color: '#7b1fa2' },
            { value: summary.avgShotsonTarget, label: 'Avg On Target', bg: '#f3e8f8', color: '#7b1fa2' },
            { value: summary.avgXg, label: 'Avg xG', bg: '#fdefd4', color: '#e65100' },
            { value: summary.avgXga, label: 'Avg xGA', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { value: summary.avgOppShots, label: 'Opp Avg Shots', bg: '#fde8e8', color: '#c62828' },
            { value: summary.avgOppShotsOnTarget, label: 'Opp On Target', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: isAuthenticated && summary.avgFixtureCost !== null ? '10px' : '0' }}>
          {[
            { value: summary.avgTouchesOppBox, label: 'Avg Touches Opp Box', bg: '#dff0df', color: '#2e7d32' },
            { value: summary.avgTouchesOurBox, label: 'Avg Touches Our Box', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>

        {/* Cost row â€” authenticated only */}
        {isAuthenticated && summary.avgFixtureCost !== null && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { value: formatCost(summary.avgFixtureCost), label: 'Avg Fixture Cost', bg: '#fff3cd', color: '#856404' },
              { value: formatCost(summary.totalFixtureCost), label: 'Total Cost (played)', bg: '#fff3cd', color: '#856404' },
            ].map(item => statTile(item.value, item.label, item.bg, item.color))}
          </div>
        )}
      </div>

      {/* Fixtures List */}
      <div style={{ maxWidth: '800px' }}>
        {filteredFixtures.map((fixture) => {
          const fixtureCost = isAuthenticated ? calculateFixtureCost(fixture) : null;
          return (
            <div key={fixture.id} onClick={() => setSelectedFixture(fixture)}
              style={{
                backgroundColor: '#003f7f', color: 'white', padding: '15px', marginBottom: '10px',
                borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>{fixture.opponent}</div>
                  <div style={{ marginBottom: '3px', fontSize: '14px' }}>{fixture.competition}</div>
                  <div style={{ fontSize: '14px' }}>{fixture.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: getHomeAwayColor(fixture.homeOrAway), marginBottom: '5px' }}>
                    {fixture.homeOrAway}
                  </div>
                  {fixture.result && (
                    <div style={{ fontWeight: 'bold', color: getResultColor(fixture) }}>
                      {fixture.result}
                    </div>
                  )}
                </div>
              </div>

              {/* Cost row â€” authenticated and played fixtures only */}
              {fixtureCost !== null && (
                <div style={{
                  marginTop: '10px', paddingTop: '8px',
                  borderTop: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '13px', color: '#ffc107'
                }}>
                  <strong>Fixture Cost:</strong> {formatCost(fixtureCost)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFixtures.length === 0 && searchText && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No fixtures found matching &ldquo;{searchText}&rdquo;
        </div>
      )}
    </div>
  );
}

export default FixtureList;