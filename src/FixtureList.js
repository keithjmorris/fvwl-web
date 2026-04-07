import React, { useState, useEffect } from 'react';
import FixtureDetail from './FixtureDetail';

function FixtureList() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [competitionFilter, setCompetitionFilter] = useState('EFL League One');

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75');
      const data = await response.json();
      setFixtures(data.record);
      setLoading(false);
    } catch (error) {
      setError('Failed to load fixtures');
      setLoading(false);
      console.error('Error fetching fixtures:', error);
    }
  };

  const calculateSummary = (fixturesToSummarise) => {
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

    fixturesToSummarise.forEach(fixture => {
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

      if (fixture.shots && fixture.shots !== '') {
        totalShots += parseFloat(fixture.shots);
        shotsCount++;
      }
      if (fixture.shotsonTarget && fixture.shotsonTarget !== '') {
        totalShotsonTarget += parseFloat(fixture.shotsonTarget);
        shotsonTargetCount++;
      }
      if (fixture.oppositionShots && fixture.oppositionShots !== '') {
        totalOppShots += parseFloat(fixture.oppositionShots);
        oppShotsCount++;
      }
      if (fixture.oppositionShotonTarget && fixture.oppositionShotonTarget !== '') {
        totalOppShotsOnTarget += parseFloat(fixture.oppositionShotonTarget);
        oppShotsOnTargetCount++;
      }
      if (fixture.touchesOppositionBox && fixture.touchesOppositionBox !== '') {
        totalTouchesOppBox += parseFloat(fixture.touchesOppositionBox);
        touchesOppBoxCount++;
      }
      if (fixture.touchesOurBox && fixture.touchesOurBox !== '') {
        totalTouchesOurBox += parseFloat(fixture.touchesOurBox);
        touchesOurBoxCount++;
      }
      if (fixture.xg && fixture.xg !== '') {
        totalXg += parseFloat(fixture.xg);
        xgCount++;
      }
      if (fixture.xga && fixture.xga !== '') {
        totalXga += parseFloat(fixture.xga);
        xgaCount++;
      }
      if (fixture.leaguePosition && fixture.leaguePosition !== '') {
        leaguePosition = fixture.leaguePosition;
      }
    });

    const points = (wins * 3) + draws;
    const gamesPlayed = wins + draws + losses;

    return {
      wins, draws, losses, gamesPlayed,
      goalsFor, goalsAgainst, cleanSheets,
      points,
      pointsPerGame: gamesPlayed > 0 ? (points / gamesPlayed).toFixed(2) : '0.00',
      avgShots: shotsCount > 0 ? (totalShots / shotsCount).toFixed(1) : 'N/A',
      avgShotsonTarget: shotsonTargetCount > 0 ? (totalShotsonTarget / shotsonTargetCount).toFixed(1) : 'N/A',
      avgOppShots: oppShotsCount > 0 ? (totalOppShots / oppShotsCount).toFixed(1) : 'N/A',
      avgOppShotsOnTarget: oppShotsOnTargetCount > 0 ? (totalOppShotsOnTarget / oppShotsOnTargetCount).toFixed(1) : 'N/A',
      avgTouchesOppBox: touchesOppBoxCount > 0 ? (totalTouchesOppBox / touchesOppBoxCount).toFixed(1) : 'N/A',
      avgTouchesOurBox: touchesOurBoxCount > 0 ? (totalTouchesOurBox / touchesOurBoxCount).toFixed(1) : 'N/A',
      avgXg: xgCount > 0 ? (totalXg / xgCount).toFixed(2) : 'N/A',
      avgXga: xgaCount > 0 ? (totalXga / xgaCount).toFixed(2) : 'N/A',
      leaguePosition
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

  const getHomeAwayColor = (homeOrAway) => {
    return homeOrAway === 'Home' ? '#ffffff' : '#ffc107';
  };

  if (selectedFixture) {
    return (
      <FixtureDetail
        fixture={selectedFixture}
        onBack={() => setSelectedFixture(null)}
      />
    );
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading fixtures...</div>;
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>;

  const statTile = (value, label, bg, color) => (
    <div key={label} style={{
      backgroundColor: bg,
      borderRadius: '8px',
      padding: '10px 8px',
      textAlign: 'center',
      flex: 1,
      minWidth: '70px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img
          src="/bwfc.png"
          alt="BWFC"
          style={{ width: '50px', height: '50px', marginRight: '15px' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 style={{ color: '#003f7f', margin: 0 }}>Fixtures</h1>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter opponent name here"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px',
            border: '2px solid #003f7f',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        />
      </div>

      {/* Competition Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <label style={{ fontWeight: 'bold', color: '#003f7f', fontSize: '14px' }}>Filter by competition:</label>
        <select
          value={competitionFilter}
          onChange={(e) => setCompetitionFilter(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}
        >
          <option value="All">All Competitions</option>
          <option value="EFL League One">EFL League One</option>
          <option value="Carabao League Cup">Carabao League Cup</option>
          <option value="Vertu EFL Trophy">Vertu EFL Trophy</option>
          <option value="FA Cup">FA Cup</option>
        </select>
      </div>

      {/* Summary Box */}
      <div style={{
        border: '2px solid #4682b4',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        backgroundColor: '#fff'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#003f7f', marginBottom: '14px' }}>
          Season Summary {competitionFilter !== 'All' ? `â€” ${competitionFilter}` : 'â€” All Competitions'}
        </div>

        {/* Results Row */}
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

        {/* League specific row */}
        {isLeague && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {[
              { value: summary.points, label: 'Points', bg: '#ddeeff', color: '#1976d2' },
              { value: summary.pointsPerGame, label: 'Pts/Game', bg: '#ddeeff', color: '#1976d2' },
              { value: summary.leaguePosition ? summary.leaguePosition : 'N/A', label: 'Position', bg: '#fdefd4', color: '#e65100' },
            ].map(item => statTile(item.value, item.label, item.bg, item.color))}
          </div>
        )}

        {/* BWFC shooting & xG row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { value: summary.avgShots, label: 'Avg Shots', bg: '#f3e8f8', color: '#7b1fa2' },
            { value: summary.avgShotsonTarget, label: 'Avg On Target', bg: '#f3e8f8', color: '#7b1fa2' },
            { value: summary.avgXg, label: 'Avg xG', bg: '#fdefd4', color: '#e65100' },
            { value: summary.avgXga, label: 'Avg xGA', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>

        {/* Opposition shooting row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { value: summary.avgOppShots, label: 'Opp Avg Shots', bg: '#fde8e8', color: '#c62828' },
            { value: summary.avgOppShotsOnTarget, label: 'Opp On Target', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>

        {/* Touches row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { value: summary.avgTouchesOppBox, label: 'Avg Touches Opp Box', bg: '#dff0df', color: '#2e7d32' },
            { value: summary.avgTouchesOurBox, label: 'Avg Touches Our Box', bg: '#fde8e8', color: '#c62828' },
          ].map(item => statTile(item.value, item.label, item.bg, item.color))}
        </div>
      </div>

      {/* Fixtures List */}
      <div style={{ maxWidth: '800px' }}>
        {filteredFixtures.map((fixture) => (
          <div
            key={fixture.id}
            onClick={() => setSelectedFixture(fixture)}
            style={{
              backgroundColor: '#003f7f',
              color: 'white',
              padding: '15px',
              marginBottom: '10px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '5px' }}>
                {fixture.opponent}
              </div>
              <div style={{ marginBottom: '3px' }}>{fixture.competition}</div>
              <div>{fixture.date}</div>
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
        ))}
      </div>

      {filteredFixtures.length === 0 && searchText && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No fixtures found matching "{searchText}"
        </div>
      )}
    </div>
  );
}

export default FixtureList;