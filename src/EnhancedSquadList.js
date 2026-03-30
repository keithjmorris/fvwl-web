import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import PlayerDetail from './PlayerDetail';

const firebaseConfig = {
  apiKey: "AIzaSyAvITdQHZkF-Kjkacna0fsxPYqbBEKJwlg",
  authDomain: "fvwl-8109b.firebaseapp.com",
  databaseURL: "https://fvwl-8109b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fvwl-8109b",
  storageBucket: "fvwl-8109b.firebasestorage.app",
  messagingSenderId: "406636067359",
  appId: "1:406636067359:web:8b70673d38495254b2f32a"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function EnhancedSquadList({ isAuthenticated, onRequestLogin, user }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Available');
  const [competitionFilter, setCompetitionFilter] = useState('All');
  const [fixtures, setFixtures] = useState([]);
  const [gestureStep, setGestureStep] = useState(0);
  const [gestureTimer, setGestureTimer] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch('https://api.jsonbin.io/v3/b/68283e428561e97a50159f75/latest', {
          headers: { 'X-Master-Key': '$2a$10$VTMAZsuNJaZxXb2dEFdOheJXXwRGD7GJj7e5vRp9jKvHqF51SN29e' }
        });
        const data = await response.json();
        setFixtures(data.record);
      } catch (error) {
        console.error('Error fetching fixtures:', error);
      }
    };
    fetchFixtures();
  }, []);

  const getPlayerGoals = (player) => {
    let totalGoals = 0;
    const relevantFixtures = getRelevantFixtures();
    relevantFixtures.forEach(fixture => {
      for (let i = 1; i <= 6; i++) {
        const scorer = fixture[`scorer${i}`];
        if (scorer && scorer.includes(`${player.forename.charAt(0)}. ${player.surname}`)) {
          const matches = scorer.match(/\d+'/g);
          totalGoals += matches ? matches.length : 1;
        }
      }
    });
    return totalGoals;
  };

  const getPlayerStatistics = (player) => {
    let stats = { appearances: 0, starts: 0, substitutes: 0, yellowCards: 0, redCards: 0 };
    const relevantFixtures = getRelevantFixtures();
    relevantFixtures.forEach(fixture => {
      let appeared = false;
      for (let i = 1; i <= 11; i++) {
        const starter = fixture[`starter${i}`];
        if (starter && starter.includes(`${player.forename.charAt(0)}. ${player.surname}`)) {
          stats.appearances++; stats.starts++; appeared = true; break;
        }
      }
      if (!appeared) {
        for (let i = 1; i <= 5; i++) {
          const substitute = fixture[`substitute${i}`];
          if (substitute && substitute.includes(`${player.forename.charAt(0)}. ${player.surname}`)) {
            stats.appearances++; stats.substitutes++; break;
          }
        }
      }
      for (let i = 1; i <= 6; i++) {
        const yellowCard = fixture[`yellowCard${i}`];
        if (yellowCard && yellowCard.includes(`${player.forename.charAt(0)}. ${player.surname}`)) stats.yellowCards++;
      }
      for (let i = 1; i <= 2; i++) {
        const redCard = fixture[`redCard${i}`];
        if (redCard && redCard.includes(`${player.forename.charAt(0)}. ${player.surname}`)) stats.redCards++;
      }
    });
    return stats;
  };

  const parseMinute = (timeStr) => {
    if (!timeStr) return null;
    const clean = timeStr.replace(/'/g, '').trim();
    if (clean.includes('+')) {
      const parts = clean.split('+');
      return parseInt(parts[0]) + parseInt(parts[1]);
    }
    return parseInt(clean);
  };

  const getPlayerMinutes = (player) => {
    const playerRef = `${player.forename.charAt(0)}. ${player.surname}`;
    let totalMinutes = 0;

    fixtures.forEach(fixture => {
      const MATCH_DURATION = 90;
      let minutesThisGame = 0;
      let playedThisGame = false;

      for (let i = 1; i <= 11; i++) {
        const starter = fixture[`starter${i}`];
        if (starter && starter.includes(playerRef)) {
          minutesThisGame = MATCH_DURATION;
          playedThisGame = true;
          break;
        }
      }

      for (let i = 1; i <= 5; i++) {
        const subOff = fixture[`substitutedPlayer${i}`];
        const subTime = fixture[`substituteTime${i}`];
        if (subOff && subOff.includes(playerRef) && subTime) {
          const minute = parseMinute(subTime);
          if (minute !== null) minutesThisGame = minute;
          break;
        }
      }

      for (let i = 1; i <= 5; i++) {
        const subOn = fixture[`substitute${i}`];
        const subTime = fixture[`substituteTime${i}`];
        if (subOn && subOn.includes(playerRef) && subTime) {
          const minute = parseMinute(subTime);
          if (minute !== null) {
            minutesThisGame = MATCH_DURATION - minute;
            playedThisGame = true;
          }
          break;
        }
      }

      if (playedThisGame) totalMinutes += minutesThisGame;
    });

    return totalMinutes;
  };

  // Returns fixtures filtered by the competition filter
  const getRelevantFixtures = () => {
    if (competitionFilter === 'All') return fixtures;
    if (competitionFilter === 'League') return fixtures.filter(f => f.competition === 'EFL League One');
    // 'Other' = all competitions except EFL League One
    return fixtures.filter(f => f.competition !== 'EFL League One');
  };

  // Returns true if a player appeared in at least one fixture matching the competition filter
  const playerAppearedInCompetition = (player) => {
    if (competitionFilter === 'All') return true;
    const playerRef = `${player.forename.charAt(0)}. ${player.surname}`;
    const relevantFixtures = getRelevantFixtures();
    return relevantFixtures.some(fixture => {
      for (let i = 1; i <= 11; i++) {
        if (fixture[`starter${i}`] && fixture[`starter${i}`].includes(playerRef)) return true;
      }
      for (let i = 1; i <= 5; i++) {
        if (fixture[`substitute${i}`] && fixture[`substitute${i}`].includes(playerRef)) return true;
      }
      return false;
    });
  };

  useEffect(() => {
    const publicRef = ref(database, 'squad2526p');
    const unsubscribePublic = onValue(publicRef, (snapshot) => {
      const publicData = snapshot.val();
      if (publicData) {
        const publicArray = Object.values(publicData).filter(player => player.notes !== 'Total');

        if (isAuthenticated) {
          const financialRef = ref(database, 'squad2526f');
          const unsubscribeFinancial = onValue(financialRef, (snapshot) => {
            const financialData = snapshot.val();
            if (financialData) {
              const financialArray = Object.values(financialData);
              const mergedArray = publicArray.map(player => {
                const financial = financialArray.find(f => f.id === player.id);
                return financial ? { ...player, ...financial } : player;
              });
              setPlayers(mergedArray);
            }
            setLoading(false);
          });
          return () => unsubscribeFinancial();
        } else {
          setPlayers(publicArray);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribePublic();
  }, [isAuthenticated]);

  const calculateTeamTotals = (filteredPlayers) => {
    const relevantFixtures = getRelevantFixtures();
    return filteredPlayers.reduce((totals, player) => {
      const goals = getPlayerGoals(player);
      const stats = getPlayerStatistics(player);
      totals.totalGoals += goals;
      totals.totalCards += stats.yellowCards + stats.redCards;
      return totals;
    }, {
      totalGoals: 0,
      totalCards: 0,
      activePlayers: filteredPlayers.length,
      fixturesPlayed: relevantFixtures.length
    });
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading squad...</div>;

  if (selectedPlayer) {
    return <PlayerDetail
      player={selectedPlayer}
      onBack={() => setSelectedPlayer(null)}
      user={user}
    />;
  }

  const filteredPlayers = players.filter(player => {
    // Status filter
    const statusMatch = (() => {
      if (statusFilter === 'All') return true;
      if (statusFilter === 'Available') return player.notes === 'Squad' || player.notes === 'Loan in';
      return player.notes === statusFilter;
    })();

    // Competition filter
    const competitionMatch = playerAppearedInCompetition(player);

    return statusMatch && competitionMatch;
  });

  const teamTotals = calculateTeamTotals(filteredPlayers);

  const statBlock = (value, label, bgColor, textColor) => (
    <div style={{
      backgroundColor: bgColor,
      borderRadius: '8px',
      padding: '12px 8px',
      textAlign: 'center',
      flex: 1,
      minWidth: '80px'
    }}>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: textColor }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>

      {/* Logo + Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <img
          src="/BWFC_logo2.jpeg"
          alt="Bolton Wanderers FC"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            cursor: 'default',
            userSelect: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none'
          }}
          onClick={() => {
            const validClickSteps = [0, 1, 3, 4];
            if (validClickSteps.includes(gestureStep)) {
              const nextStep = gestureStep + 1;
              setGestureStep(nextStep);
              if (gestureTimer) clearTimeout(gestureTimer);
              if (nextStep < 5) {
                const t = setTimeout(() => setGestureStep(0), 3000);
                setGestureTimer(t);
              } else {
                setGestureStep(0);
                onRequestLogin();
              }
            } else {
              setGestureStep(0);
            }
          }}
          onContextMenu={(e) => { e.preventDefault(); }}
          onMouseDown={(e) => {
            if (gestureStep === 2) {
              const pressTimer = setTimeout(() => {
                setGestureStep(3);
                if (gestureTimer) clearTimeout(gestureTimer);
                const t = setTimeout(() => setGestureStep(0), 3000);
                setGestureTimer(t);
              }, 600);
              e.currentTarget._pressTimer = pressTimer;
            }
          }}
          onMouseUp={(e) => { clearTimeout(e.currentTarget._pressTimer); }}
          onMouseLeave={(e) => { clearTimeout(e.currentTarget._pressTimer); }}
          onTouchStart={(e) => {
            if (gestureStep === 2) {
              const pressTimer = setTimeout(() => {
                setGestureStep(3);
                if (gestureTimer) clearTimeout(gestureTimer);
                const t = setTimeout(() => setGestureStep(0), 3000);
                setGestureTimer(t);
              }, 600);
              e.currentTarget._pressTimer = pressTimer;
            }
          }}
          onTouchEnd={(e) => { clearTimeout(e.currentTarget._pressTimer); }}
        />
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#003f7f', marginBottom: '4px', textAlign: 'center' }}>
        Squad 2025/26
      </h1>

      {/* Team Totals */}
      <div style={{
        border: '2px solid #4682b4',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        backgroundColor: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#003f7f' }}>Team Totals</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {statBlock(teamTotals.totalGoals, 'Total Goals', '#ddeeff', '#1976d2')}
          {statBlock(teamTotals.totalCards, 'Total Cards', '#fdefd4', '#e65100')}
          {statBlock(teamTotals.activePlayers, 'Active Players', '#dff0df', '#2e7d32')}
          {statBlock(teamTotals.fixturesPlayed, 'Fixtures Played', '#f0f0f0', '#444')}
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#003f7f', fontSize: '14px' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="Available">Available (Squad + Loan in)</option>
            <option value="All">All Players</option>
            <option value="Squad">Squad</option>
            <option value="Loan in">Loan in</option>
            <option value="On loan">On loan</option>
            <option value="Gone">Gone</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#003f7f', fontSize: '14px' }}>Competition:</label>
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="All">All Competitions</option>
            <option value="League">EFL League One</option>
            <option value="Other">All Other Competitions</option>
          </select>
        </div>
      </div>

      {/* Player Cards */}
      {filteredPlayers.map(player => {
        const goals = getPlayerGoals(player);
        const stats = getPlayerStatistics(player);
        const relevantFixtures = getRelevantFixtures();
        const participationPercentage = relevantFixtures.length > 0
          ? Math.round((stats.appearances / relevantFixtures.length) * 100)
          : 0;
        const totalCards = stats.yellowCards + stats.redCards;

        return (
          <div key={player.id}
            onClick={() => { if (user) setSelectedPlayer(player); }}
            style={{
              border: '1px solid #ddd',
              cursor: user ? 'pointer' : 'default',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '14px',
              backgroundColor: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#003f7f' }}>
                  {player.forename} {player.surname}
                </div>
                <div style={{ fontSize: '13px', color: '#777' }}>
                  Status: <span style={{ color: '#cc0000', fontWeight: 'bold' }}>{player.notes}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              {statBlock(goals, 'Goals', '#ddeeff', '#1976d2')}
              {statBlock(stats.appearances, 'Appearances', '#dff0df', '#2e7d32')}
              {statBlock(stats.starts, 'Starts', '#f3e8f8', '#7b1fa2')}
              {statBlock(stats.substitutes, 'Sub Apps', '#dff0df', '#2e7d32')}
              {statBlock(totalCards, 'Cards', '#fdefd4', '#e65100')}
              {statBlock(`${participationPercentage}%`, 'Season %', '#f0f0f0', '#444')}
            </div>

            {isAuthenticated && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '5px',
                padding: '10px',
                marginTop: '12px'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                  ðŸ’° Financial Details (Admin Only)
                </div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', marginBottom: '8px' }}>
                  {player.currentWeeklyWage && (
                    <div><strong>Weekly Wage:</strong> Â£{player.currentWeeklyWage.toLocaleString()}</div>
                  )}
                  {player.overallTotal && (
                    <div><strong>Overall Total:</strong> Â£{player.overallTotal.toLocaleString()}</div>
                  )}
                </div>
                {(() => {
                  const minutes = getPlayerMinutes(player);
                  const costPerMinute = player.overallTotal && minutes > 0
                    ? (player.overallTotal / minutes).toFixed(2)
                    : null;
                  return (
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', borderTop: '1px solid #ffc107', paddingTop: '8px' }}>
                      <div><strong>Minutes Played:</strong> {minutes}</div>
                      {costPerMinute && (
                        <div><strong>Cost per Minute:</strong> Â£{costPerMinute}</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}

      {filteredPlayers.length === 0 && (
        <div style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginTop: '40px' }}>
          No players found for the selected filters.
        </div>
      )}
    </div>
  );
}

export default EnhancedSquadList;